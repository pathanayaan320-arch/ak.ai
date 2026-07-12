import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where, limit, orderBy, deleteDoc } from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

// Use JSON body parser with generous limit and raw body verify for signature authentication
app.use(express.json({ 
  limit: "50mb",
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. API calls will fail.");
}

// Lazy initialization check
function getAiClient() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in AI Studio Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), hasApiKey: !!process.env.GEMINI_API_KEY });
});

// API endpoint for CEO coordination and task generation
app.post("/api/ceo/chat", async (req, res) => {
  try {
    const client = getAiClient();
    const { userMessage, chatHistory, employees, memoryItems } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: "Missing userMessage parameter" });
      return;
    }

    // Prepare context about standard and custom employees
    const employeesListText = employees && employees.length > 0
      ? employees.map((emp: any) => `- Name: ${emp.name}, Role: ${emp.role}, Dept: ${emp.department}, Skills: ${emp.skills?.join(", ") || ""}, Goal: ${emp.goal || ""}`).join("\n")
      : "- Name: Alex, Role: Full Stack Developer\n- Name: Sarah, Role: UI Designer\n- Name: Mark, Role: Copywriter\n- Name: Sofia, Role: Marketing Manager";

    const memoriesText = memoryItems && memoryItems.length > 0
      ? memoryItems.map((mem: any) => `[Category: ${mem.category}] Title: ${mem.title}\nContent: ${mem.content}`).join("\n\n")
      : "No company memory records found.";

    // We want the Gemini model to respond in a structured JSON format representing the CEO's planning.
    // It should intelligently classify whether the user's message is a "work request/task delegation" (to create a project/tasks)
    // or an "informational request/general conversation" (to discuss, give advice, chat, explain, brainstorm).
    const systemInstruction = `You are Elena, the brilliant, highly professional, and proactive AI CEO of AK.AI (the World's First AI Company).
You manage an entire team of highly specialized AI employees.
The user is your VIP client or founder who gives you instructions, asks questions, or chats.
You NEVER say "I cannot", "As an AI", or "I am just an assistant". You act like a real CEO of a billion-dollar company.

When the user speaks to you, you must first classify their message:
1. Is this a "WORK REQUEST"?
   - This ONLY applies if the user explicitly instructs to "create", "make", "build", "generate", "design", "write", "draft", "run", "launch", "setup", "develop" or do an actual project task.
   - If so, set "isWorkRequest": true
   - Propose a clear corporate project name and description.
   - Assign 1 to 4 key tasks to suitable employees from the list.
   - Generate high-quality, professional, production-ready simulated output for each task inside the "assignedTasks" list.

2. Is this an "INFORMATIONAL / CHAT REQUEST"?
   - This applies if the user sends casual greetings (like "hi", "hello", "hey", "how are you"), asks general questions (like "who are you?", "how does this work?"), requests advice, discusses ideas, or says anything that does NOT explicitly ask to construct/generate/create a specific project or deliverable.
   - If so, you MUST set "isWorkRequest": false, "projectName": "", "projectDescription": "", and "assignedTasks": [].
   - Deliver your brilliant executive advice, professional banter, friendly greeting, or strategic consultation directly in the "ceoMessage" field using beautiful markdown formatting. Keep it warm, welcoming, authoritative, and direct.

You must respond with a valid JSON object matching this schema:
{
  "isWorkRequest": true,
  "ceoMessage": "Your direct message to the user as CEO. If isWorkRequest is false, this must contain your complete, rich strategic answer or conversation. If isWorkRequest is true, this is your message explaining the project plan.",
  "ceoThoughts": "Your strategic inner thoughts about the client's request, target audience, and engineering/marketing decisions.",
  "projectName": "A suitable premium name for the project or startup (only if isWorkRequest is true)",
  "projectDescription": "A professional high-level description of what we are building (only if isWorkRequest is true)",
  "assignedTasks": [
    {
      "title": "Task title",
      "description": "Task description explaining what this employee is doing",
      "employeeName": "Name of the assigned employee (MUST match one of the available employees)",
      "employeeRole": "Role of the assigned employee",
      "department": "Department of the assigned employee",
      "output": "The actual production-ready professional output produced by this employee. Keep it highly detailed and complete.",
      "estimatedDurationSeconds": 10
    }
  ]
}

Available company employees (both standard and custom):
${employeesListText}

Company Super Memory Knowledge:
${memoriesText}

Previous chat history (for context):
${JSON.stringify(chatHistory || [])}
`;

    const normalizedMsg = userMessage.trim().toLowerCase();
    const isGreeting = /^(hi|hello|hey|yo|howdy|hola|greetings|good morning|good afternoon|good evening|how are you|how's it going|whats up|what's up|hello there|hi there|hey there)/i.test(normalizedMsg);
    const isShortMessage = normalizedMsg.length < 15;
    const hasActionKeyword = /\b(make|create|build|generate|develop|run|design|write|draft|launch|execute|setup|start|deploy|code)\b/i.test(normalizedMsg);

    let forceInformational = false;
    if ((isGreeting || isShortMessage) && !hasActionKeyword) {
      forceInformational = true;
    }

    let userPrompt = "";
    if (forceInformational) {
      userPrompt = `User Message: "${userMessage}"
      
CRITICAL DIRECTIVE: The user's input is a casual greeting, general small talk, or simple question. It is NOT a work request. You MUST set "isWorkRequest" to false, "projectName" to "", "projectDescription" to "", and "assignedTasks" to [].
Respond warmly in "ceoMessage" as Elena, welcoming them, asking how you can help, or answering their question with polished CEO charisma.`;
    } else {
      userPrompt = `User Message: "${userMessage}"

Analyze this input. Determine if it is a request to build/create/make/generate something (isWorkRequest: true) or a general conversation/advice (isWorkRequest: false). Produce the appropriate structured JSON response following the guidelines perfectly.`;
    }

    // Call Gemini Model with JSON constraint
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No text returned from Gemini API");
    }

    // Parse and send the response
    const jsonResponse = JSON.parse(textResult);
    res.json(jsonResponse);

  } catch (error: any) {
    console.error("Gemini API Error in server:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API endpoint for Multi-Agent Team Collaboration
app.post("/api/team/chat", async (req, res) => {
  try {
    const client = getAiClient();
    const { userPrompt, selectedAgents, memoryItems } = req.body;

    if (!userPrompt) {
      res.status(400).json({ error: "Missing userPrompt parameter" });
      return;
    }

    if (!selectedAgents || selectedAgents.length < 2) {
      res.status(400).json({ error: "At least two agents are required for collaboration." });
      return;
    }

    const memoriesText = memoryItems && memoryItems.length > 0
      ? memoryItems.map((mem: any) => `[Category: ${mem.category}] Title: ${mem.title}\nContent: ${mem.content}`).join("\n\n")
      : "No company memory records found.";

    let contextString = "";
    const results = [];

    // Loop through selected agents in order, passing context of prior steps
    for (let i = 0; i < selectedAgents.length; i++) {
      const agent = selectedAgents[i];

      const systemInstruction = `You are ${agent.name}, the ${agent.role} at AK.AI.
Department: ${agent.department}
Skills: ${agent.skills?.join(", ") || "General execution"}
Professional Goal: ${agent.goal || "Complete high-quality collaborative tasks"}
Your Persona/System Prompt: ${agent.systemPrompt || "Be highly professional, cooperative, and efficient."}

We are running a MULTI-AGENT COLLABORATION session.
The primary user objective is: "${userPrompt}"

Previous deliverables produced by other agents in this session:
${contextString || "None. You are the first agent to act."}

Company Super Memory Knowledge for context:
${memoriesText}

Your job:
1. Review the primary user objective.
2. Review the previous deliverables produced in this session (if any).
3. From the exact perspective of your role (${agent.role}), contribute your specialized, professional, high-quality, production-ready response.
4. Do not duplicate previous work; build upon it, complement it, critique it, or extend it to deliver a comprehensive team outcome. Speak directly in character. Never say "As an AI" or break character.`;

      const prompt = `As ${agent.name}, execute your part of the collaborative objective. User prompt: "${userPrompt}"`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: agent.temperature || 0.6,
        },
      });

      const reply = response.text || `[${agent.name} was unable to output data]`;
      
      results.push({
        agentId: agent.id,
        agentName: agent.name,
        reply: reply
      });

      // Append this agent's response to the context string for subsequent agents
      contextString += `\n\n--- Output from ${agent.name} (${agent.role}) ---\n${reply}\n`;
    }

    res.json({
      success: true,
      intro: `Elena (CEO): Collaboration room successfully synchronized with ${selectedAgents.length} agents. Generating combined team deliverables...`,
      results
    });

  } catch (error: any) {
    console.error("Multi-Agent Gemini API Error in server:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API endpoint for direct employee chat interaction
app.post("/api/employee/chat", async (req, res) => {
  try {
    const client = getAiClient();
    const { userMessage, chatHistory, employee, memoryItems } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: "Missing userMessage parameter" });
      return;
    }

    if (!employee) {
      res.status(400).json({ error: "Missing employee parameter" });
      return;
    }

    const memoriesText = memoryItems && memoryItems.length > 0
      ? memoryItems.map((mem: any) => `[Category: ${mem.category}] Title: ${mem.title}\nContent: ${mem.content}`).join("\n\n")
      : "No company memory records found.";

    const systemInstruction = `You are ${employee.name}, the ${employee.role} at AK.AI.
Department: ${employee.department}
Skills: ${employee.skills?.join(", ") || "General enterprise execution"}
Professional Goal: ${employee.goal || "Perform high-quality work for the company"}
Your Personality/System Prompt: ${employee.systemPrompt || "Be highly professional, cooperative, and efficient."}

The user is your VIP founder/supervisor. You are chatting directly with them.
Be highly professional, concise, and helpful. Speak directly in your persona. Never say "As an AI" or break character. 
If the user asks you to perform a task, write code, copy, designs, or mockups, do it directly with utmost excellence and embed it in your chat response. Use markdown where appropriate.

Company Super Memory Knowledge for context:
${memoriesText}

Previous chat history:
${JSON.stringify(chatHistory || [])}
`;

    const userPrompt = `User Message: "${userMessage}"
Respond professionally as ${employee.name} (${employee.role}).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: employee.temperature || 0.7,
      },
    });

    const reply = response.text;
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Employee API Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API endpoint for AI-Enhanced Automation Actions
app.post("/api/automation/enhance", async (req, res) => {
  try {
    const client = getAiClient();
    const { prompt, platform } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing prompt parameter" });
      return;
    }

    const systemInstruction = `You are the Automation Integration engine of AK.AI.
Your task is to take a raw automation instruction and a selected platform (e.g. gmail, google_sheets, whatsapp, instagram, slack, discord, hubspot, webhook), and:
1. Parse the target recipient, subject, and topic of the instruction.
2. Draft an EXTREMELY high-quality, AI-enhanced message that is customized to the platform's standard style:
   - gmail: Formal business email with standard layout (Subject, Salutation, Body, Sign-off). High-converting and clear.
   - google_sheets: Prepare a structured log description or table row data format, summarizing the event beautifully.
   - whatsapp: Warm, clear, readable text utilizing bold keywords (*bold*), line breaks, and professional emojis.
   - instagram: Highly engaging, creative social media post format, complete with visually appealing paragraphs, call-to-action, and matching hashtags.
   - slack/discord: Interactive team message layout with clear section headers, lists, and bold action items.
   - hubspot: Professional CRM activity and client log details.
   - webhook: Clean structured JSON payload summary.
3. Respond ONLY in a valid JSON object matching this schema:
{
  "recipient": "Parsed name of recipient or 'All'",
  "topic": "Main topic / purpose",
  "subject": "Email subject or post header",
  "enhancedMessage": "The full crafted message customized for the platform's style",
  "explanation": "Briefly explain what enhancements were made to match the platform's persona"
}`;

    const userPrompt = `Raw Instruction: "${prompt}"
Target Platform: "${platform || "gmail"}"

Generate the parsed and enhanced response in strict JSON format.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response text from Gemini API");
    }

    const parsedData = JSON.parse(textResult);
    res.json(parsedData);

  } catch (error: any) {
    console.error("Automation Enhancement Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ==========================================
// INSTAGRAM COMMENT-TO-DM AUTOMATION ENGINE
// ==========================================

const serverApp = !getApps().length ? initializeApp({
  projectId: "gen-lang-client-0544951037",
  appId: "1:57163089505:web:43a5397819a437b12bcc20",
  apiKey: "AIzaSyDv4MltFkX80le4Z5w9CKdTukFlDEY7hTU",
  authDomain: "gen-lang-client-0544951037.firebaseapp.com",
  storageBucket: "gen-lang-client-0544951037.firebasestorage.app",
  messagingSenderId: "57163089505"
}) : getApp();

const serverDb = initializeFirestore(serverApp, {
  ignoreUndefinedProperties: true
}, "ai-studio-202efb3e-5c3c-405d-8ae9-a1800651bc5d");

// Security AES-256 Token Encryption Helpers
const ENCRYPTION_KEY = process.env.INSTAGRAM_TOKEN_ENC_KEY || "d6F3m1pX8qY2tZ7w9v4u1r5s2e6t3y4u"; // 32 characters
const IV_LENGTH = 16;

function encryptToken(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
}

function decryptToken(text: string): string {
  try {
    const textParts = text.split(":");
    const ivPart = textParts.shift();
    if (!ivPart) return text;
    const iv = Buffer.from(ivPart, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return text;
  }
}

// Background notifications helper
async function createServerNotification(uid: string, title: string, description: string, type: string) {
  try {
    const docId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const docRef = doc(serverDb, "notifications", docId);
    await setDoc(docRef, {
      id: docId,
      uid,
      title,
      description,
      type: type || "ceo_alert",
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// (1) Webhook Handshake Verification (hub.mode, hub.verify_token, hub.challenge)
app.get("/api/instagram/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "ak_ai_verify_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Instagram Webhook subscription verified successfully.");
    res.status(200).send(challenge);
  } else {
    console.warn("Instagram Webhook subscription handshake failed.");
    res.status(403).send("Forbidden");
  }
});

// Signature Checker Helper
function verifyInstagramWebhookSignature(req: any): boolean {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const appSecret = process.env.INSTAGRAM_APP_SECRET || "sandbox_app_secret_ak_ai_2026";
  const elements = signature.split("=");
  const signatureHash = elements[1];

  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signatureHash), Buffer.from(expectedHash));
}

// (2) Webhook Receiver Endpoint
app.post("/api/instagram/webhook", async (req: any, res) => {
  const isValid = verifyInstagramWebhookSignature(req);
  if (!isValid && process.env.NODE_ENV === "production") {
    res.status(401).send("Unauthorized Signature");
    return;
  }

  // Acknowledge immediately within 2 seconds to avoid duplications from Meta
  res.status(200).send("EVENT_RECEIVED");

  try {
    const payload = req.body;
    
    // Log the event payload to database for trace audits
    const logId = `raw_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await setDoc(doc(serverDb, "webhook_raw_logs", logId), {
      id: logId,
      payload,
      received_at: new Date().toISOString()
    });

    if (payload.object !== "instagram" || !payload.entry) return;

    for (const entry of payload.entry) {
      const igUserId = entry.id;
      if (!entry.changes) continue;

      for (const change of entry.changes) {
        if (change.field !== "comments" && change.field !== "live_comments") continue;
        const commentData = change.value;
        if (!commentData || !commentData.id) continue;

        const commentId = commentData.id;
        const commentText = commentData.text || "";
        const commenterScopedId = commentData.from?.id;
        const commenterUsername = commentData.from?.username || "anonymous";
        const mediaId = commentData.media?.id || "live_broadcast";
        const isLive = change.field === "live_comments";

        if (!commenterScopedId) continue;

        // Fetch connected IG account matching this ID
        const accountsQ = query(
          collection(serverDb, "ig_accounts"),
          where("ig_user_id", "==", igUserId),
          where("status", "==", "active"),
          limit(1)
        );
        const accountsSnap = await getDocs(accountsQ);
        if (accountsSnap.empty) continue;

        const igAccountDoc = accountsSnap.docs[0];
        const igAccount = igAccountDoc.data();
        const uid = igAccount.uid;

        // Skip if commenting on own post
        if (commenterScopedId === igAccount.ig_user_id) {
          const docId = `trig_${commentId}`;
          await setDoc(doc(serverDb, "triggered_events", docId), {
            id: docId,
            uid,
            automation_rule_id: "none",
            comment_id: commentId,
            commenter_ig_scoped_id: commenterScopedId,
            commenter_username: commenterUsername,
            comment_text: commentText,
            status: "skipped_self_comment",
            error_message: "Comment is made by the owner account.",
            created_at: new Date().toISOString()
          });
          continue;
        }

        // Deduplicate using comment_id check
        const eventDocId = `trig_${commentId}`;
        const eventDocSnap = await getDoc(doc(serverDb, "triggered_events", eventDocId));
        if (eventDocSnap.exists()) continue;

        // Fetch active automation rules
        const rulesQ = query(
          collection(serverDb, "automation_rules"),
          where("ig_account_id", "==", igAccount.id),
          where("is_active", "==", true)
        );
        const rulesSnap = await getDocs(rulesQ);
        if (rulesSnap.empty) continue;

        let matchedRule = null;
        let highestSpecificity = -1;

        for (const ruleDoc of rulesSnap.docs) {
          const rule = ruleDoc.data();

          if (rule.target_post_id && rule.target_post_id !== mediaId) continue;

          let isMatch = false;
          const normalizedCommentText = commentText.toLowerCase().trim();

          for (const kw of rule.keywords || []) {
            const normalizedKw = kw.toLowerCase().trim();
            if (rule.match_type === "exact") {
              if (normalizedCommentText === normalizedKw) {
                isMatch = true;
                break;
              }
            } else {
              if (normalizedCommentText.includes(normalizedKw)) {
                isMatch = true;
                break;
              }
            }
          }

          if (isMatch) {
            const specificity = rule.target_post_id ? 2 : 1;
            if (specificity > highestSpecificity) {
              highestSpecificity = specificity;
              matchedRule = rule;
            }
          }
        }

        if (matchedRule) {
          const resolvedMessage = matchedRule.reply_message;

          // Insert active job into memory worker queue
          const job: DMJob = {
            id: `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            uid,
            commentId,
            mediaId,
            commenterScopedId,
            commenterUsername,
            commentText,
            igUserId: igAccount.ig_user_id,
            igAccountId: igAccount.id,
            ruleId: matchedRule.id,
            replyMessage: resolvedMessage,
            accessTokenEncrypted: igAccount.access_token_encrypted,
            attempts: 0,
            nextRunTime: Date.now(),
            isLive,
            liveBroadcastActive: true
          };

          jobQueue.push(job);

          // Save running event log in Firestore
          await setDoc(doc(serverDb, "triggered_events", eventDocId), {
            id: eventDocId,
            uid,
            automation_rule_id: matchedRule.id,
            comment_id: commentId,
            commenter_ig_scoped_id: commenterScopedId,
            commenter_username: commenterUsername,
            comment_text: commentText,
            status: "running",
            error_message: null,
            created_at: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in webhook ingestion handler:", error);
  }
});

// (3) Multi-tenant Short-to-Long Lived Token Exchange
app.post("/api/instagram/oauth/exchange", async (req, res) => {
  try {
    const { shortToken, igUserId, username, pageId, loginType, uid } = req.body;

    if (!shortToken || !igUserId || !username || !uid) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    let longToken = shortToken;
    let expiryDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // Default long token 60 days

    // If real credentials are set up, attempt token exchange on Graph API
    if (process.env.INSTAGRAM_APP_SECRET && process.env.INSTAGRAM_APP_ID && !shortToken.startsWith("mock_")) {
      try {
        const response = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_APP_ID}&client_secret=${process.env.INSTAGRAM_APP_SECRET}&fb_exchange_token=${shortToken}`);
        const data = await response.json() as any;
        if (data.access_token) {
          longToken = data.access_token;
          if (data.expires_in) {
            expiryDate = new Date(Date.now() + data.expires_in * 1000).toISOString();
          }
        }
      } catch (err) {
        console.error("Meta API token exchange exception, falling back to original short token:", err);
      }
    }

    const encryptedToken = encryptToken(longToken);

    const docId = `acct_${igUserId}`;
    await setDoc(doc(serverDb, "ig_accounts", docId), {
      id: docId,
      uid,
      ig_user_id: igUserId,
      username,
      page_id: pageId || null,
      login_type: loginType || "instagram_login",
      access_token_encrypted: encryptedToken,
      token_expires_at: expiryDate,
      status: "active",
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, accountId: docId });
  } catch (error: any) {
    console.error("OAuth token exchange error:", error);
    res.status(500).json({ error: error.message || "OAuth exchange failed" });
  }
});

// (4) Compliance and GDPR Data Deletion Callback URL
app.post("/api/instagram/data-deletion", async (req, res) => {
  try {
    const signedRequest = req.body.signed_request;
    if (!signedRequest) {
      res.status(400).json({ error: "Missing signed_request" });
      return;
    }

    const parts = signedRequest.split(".");
    const encodedSig = parts[0];
    const payload = parts[1];

    const appSecret = process.env.INSTAGRAM_APP_SECRET || "sandbox_app_secret_ak_ai_2026";
    
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("hex");
    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest("hex");

    if (sig !== expectedSig) {
      res.status(401).json({ error: "Invalid signed request signature" });
      return;
    }

    const data = JSON.parse(Buffer.from(payload, "base64").toString());
    const facebookUserId = data.user_id;

    if (facebookUserId) {
      const q = query(collection(serverDb, "ig_accounts"), where("ig_user_id", "==", facebookUserId));
      const snap = await getDocs(q);
      
      for (const d of snap.docs) {
        const acctId = d.id;
        const rulesQ = query(collection(serverDb, "automation_rules"), where("ig_account_id", "==", acctId));
        const rulesSnap = await getDocs(rulesQ);
        for (const r of rulesSnap.docs) {
          await deleteDoc(doc(serverDb, "automation_rules", r.id));
        }
        await deleteDoc(doc(serverDb, "ig_accounts", acctId));
      }
    }

    const confirmationCode = `del_${Date.now()}`;
    res.json({
      url: `https://ais-pre-y3sqirnqpyh5sc3weanefi-744846676105.asia-east1.run.app/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/instagram/deauthorize", (req, res) => {
  res.status(200).send("OK");
});

// (5) Interactive Webhook Simulator for Frontend sandbox testing
app.post("/api/instagram/sandbox/simulate-comment", async (req, res) => {
  try {
    const { igUserId, commentId, text, commenterUsername, commenterScopedId, mediaId, isLive } = req.body;

    const payload = {
      object: "instagram",
      entry: [
        {
          id: igUserId || "mock_ig_user_123",
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: isLive ? "live_comments" : "comments",
              value: {
                id: commentId || `mock_comm_${Date.now()}`,
                text: text || "This is a test comment! Send link",
                from: {
                  id: commenterScopedId || "mock_user_scoped_999",
                  username: commenterUsername || "john_doe"
                },
                media: {
                  id: mediaId || "mock_post_101"
                }
              }
            }
          ]
        }
      ]
    };

    const appSecret = process.env.INSTAGRAM_APP_SECRET || "sandbox_app_secret_ak_ai_2026";
    const signatureHash = crypto
      .createHmac("sha256", appSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    const fetchResponse = await fetch(`http://localhost:3000/api/instagram/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": `sha256=${signatureHash}`
      },
      body: JSON.stringify(payload)
    });

    const respText = await fetchResponse.text();
    res.json({ success: true, result: respText, payload });
  } catch (error: any) {
    console.error("Error in webhook simulation:", error);
    res.status(500).json({ error: error.message || "Simulation failed" });
  }
});

// (6) Sandbox helper to scan and flag expiring tokens
app.post("/api/instagram/sandbox/token-check", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(serverDb, "ig_accounts"));
    let flaggedCount = 0;

    for (const d of snapshot.docs) {
      const acct = d.data();
      const expiry = new Date(acct.token_expires_at).getTime();
      const daysLeft = (expiry - Date.now()) / (1000 * 60 * 60 * 24);

      if (acct.status === "active" && daysLeft < 15) {
        await updateDoc(doc(serverDb, "ig_accounts", acct.id), { status: "token_expired" });
        await createServerNotification(acct.uid, "Instagram Token Expiration Warning", `Your access token for @${acct.username} expires in ${Math.ceil(daysLeft)} days. Reconnection required.`, "ceo_alert");
        flaggedCount++;
      }
    }

    res.json({ success: true, flaggedCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// BACKGROUND WORKER QUEUE DEFINITIONS
interface DMJob {
  id: string;
  uid: string;
  commentId: string;
  mediaId: string;
  commenterScopedId: string;
  commenterUsername: string;
  commentText: string;
  igUserId: string;
  igAccountId: string;
  ruleId: string;
  replyMessage: string;
  accessTokenEncrypted: string;
  attempts: number;
  nextRunTime: number;
  isLive: boolean;
  liveBroadcastActive: boolean;
}

const jobQueue: DMJob[] = [];
let isProcessingQueue = false;

async function executeDMJob(job: DMJob) {
  const token = decryptToken(job.accessTokenEncrypted);
  const docId = `trig_${job.commentId}`;
  const docRef = doc(serverDb, "triggered_events", docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && ["sent", "skipped_duplicate"].includes(docSnap.data().status)) {
    return;
  }

  // Check 7-day limits
  const commentAgeDays = (Date.now() - job.nextRunTime) / (1000 * 60 * 60 * 24);
  if (commentAgeDays > 7) {
    await setDoc(docRef, {
      id: docId,
      uid: job.uid,
      automation_rule_id: job.ruleId,
      comment_id: job.commentId,
      commenter_ig_scoped_id: job.commenterScopedId,
      commenter_username: job.commenterUsername,
      comment_text: job.commentText,
      status: "expired",
      error_message: "Comment is older than 7 days. Drop reply.",
      created_at: new Date().toISOString()
    });
    return;
  }

  const isMockToken = token.startsWith("mock_") || token.includes("sandbox") || process.env.NODE_ENV !== "production";

  if (isMockToken) {
    let status: 'sent' | 'failed' | 'expired' = 'sent';
    let errorMessage = null;

    if (job.commentText.toLowerCase().includes("fail")) {
      status = 'failed';
      errorMessage = "Recipient has restricted DMs from non-followed accounts or has blocked the business page.";
    } else if (job.commentText.toLowerCase().includes("rate_limit")) {
      if (job.attempts < 2) {
        job.attempts += 1;
        job.nextRunTime = Date.now() + 1000 * Math.pow(2, job.attempts) * 3; // Exponential backoff simulation
        jobQueue.push(job);

        await setDoc(docRef, {
          id: docId,
          uid: job.uid,
          automation_rule_id: job.ruleId,
          comment_id: job.commentId,
          commenter_ig_scoped_id: job.commenterScopedId,
          commenter_username: job.commenterUsername,
          comment_text: job.commentText,
          status: "failed",
          error_message: `Rate limit hit (429). Retrying... Attempt ${job.attempts}`,
          created_at: new Date().toISOString()
        });
        return;
      } else {
        status = 'failed';
        errorMessage = "Meta Graph API Rate Limit exceeded (429 limit ceiling).";
      }
    } else if (job.commentText.toLowerCase().includes("expired")) {
      status = 'expired';
      errorMessage = "Comment older than 7 days.";
    } else if (job.isLive && job.commentText.toLowerCase().includes("live_over")) {
      status = 'failed';
      errorMessage = "Instagram Live broadcast has ended. Cannot reply.";
    }

    await setDoc(docRef, {
      id: docId,
      uid: job.uid,
      automation_rule_id: job.ruleId,
      comment_id: job.commentId,
      commenter_ig_scoped_id: job.commenterScopedId,
      commenter_username: job.commenterUsername,
      comment_text: job.commentText,
      status,
      error_message: errorMessage,
      created_at: new Date().toISOString()
    });
    return;
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${job.igUserId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        recipient: { comment_id: job.commentId },
        message: { text: job.replyMessage }
      })
    });

    const data = await response.json() as any;

    if (response.ok) {
      await setDoc(docRef, {
        id: docId,
        uid: job.uid,
        automation_rule_id: job.ruleId,
        comment_id: job.commentId,
        commenter_ig_scoped_id: job.commenterScopedId,
        commenter_username: job.commenterUsername,
        comment_text: job.commentText,
        status: "sent",
        error_message: null,
        created_at: new Date().toISOString()
      });
    } else {
      const metaError = data.error || {};
      const errorCode = metaError.code;
      const isRateLimit = [4, 17, 32, 613, 429].includes(errorCode);
      const isRetryable = isRateLimit || [1, 2, -1].includes(errorCode);

      if (isRetryable && job.attempts < 3) {
        job.attempts += 1;
        job.nextRunTime = Date.now() + 1000 * Math.pow(2, job.attempts) * 10;
        jobQueue.push(job);

        await setDoc(docRef, {
          id: docId,
          uid: job.uid,
          automation_rule_id: job.ruleId,
          comment_id: job.commentId,
          commenter_ig_scoped_id: job.commenterScopedId,
          commenter_username: job.commenterUsername,
          comment_text: job.commentText,
          status: "failed",
          error_message: `Retryable Meta Error ${errorCode}: ${metaError.message}. Queueing retry attempt ${job.attempts}...`,
          created_at: new Date().toISOString()
        });
      } else {
        await setDoc(docRef, {
          id: docId,
          uid: job.uid,
          automation_rule_id: job.ruleId,
          comment_id: job.commentId,
          commenter_ig_scoped_id: job.commenterScopedId,
          commenter_username: job.commenterUsername,
          comment_text: job.commentText,
          status: "failed",
          error_message: metaError.message || "Meta graph permanent error",
          created_at: new Date().toISOString()
        });

        if ([190, 102, 10].includes(errorCode)) {
          await updateDoc(doc(serverDb, "ig_accounts", job.igAccountId), { status: "token_expired" });
          await createServerNotification(job.uid, "Instagram Link Expired", `Your token for account connected is expired. Please reauthorize immediately.`, "ceo_alert");
        }
      }
    }
  } catch (err: any) {
    if (job.attempts < 3) {
      job.attempts += 1;
      job.nextRunTime = Date.now() + 1000 * Math.pow(2, job.attempts) * 10;
      jobQueue.push(job);
    } else {
      await setDoc(docRef, {
        id: docId,
        uid: job.uid,
        automation_rule_id: job.ruleId,
        comment_id: job.commentId,
        commenter_ig_scoped_id: job.commenterScopedId,
        commenter_username: job.commenterUsername,
        comment_text: job.commentText,
        status: "failed",
        error_message: err.message || "Network exception",
        created_at: new Date().toISOString()
      });
    }
  }
}

async function processBackgroundQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  try {
    const now = Date.now();
    const readyJobs = jobQueue.filter(j => j.nextRunTime <= now);
    for (const j of readyJobs) {
      const idx = jobQueue.indexOf(j);
      if (idx > -1) jobQueue.splice(idx, 1);
      try {
        await executeDMJob(j);
      } catch (err) {
        console.error("Worker processing failed for job:", j.id, err);
      }
    }
  } catch (err) {
    console.error("Queue worker exception:", err);
  } finally {
    isProcessingQueue = false;
  }
}

// Tick the worker queue every 3 seconds
setInterval(processBackgroundQueue, 3000);

// Serve static assets in production, otherwise mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for all SPA routes (Express v4 format)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AK.AI server running on port ${PORT}`);
  });
}

startServer();
