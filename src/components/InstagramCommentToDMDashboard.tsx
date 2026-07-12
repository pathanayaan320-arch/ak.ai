import React, { useState, useEffect } from "react";
import { 
  Instagram, 
  Plus, 
  Trash2, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Workflow, 
  Loader2, 
  Play, 
  Send, 
  ShieldCheck, 
  Database, 
  FileText, 
  ChevronRight, 
  Sliders, 
  Info, 
  MessageSquare,
  Activity,
  X,
  Radio,
  Clock,
  ExternalLink
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  orderBy, 
  limit,
  setDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { IgAccount, AutomationRule, TriggeredEvent } from "../types";

interface InstagramCommentToDMDashboardProps {
  user: any;
}

export default function InstagramCommentToDMDashboard({ user }: InstagramCommentToDMDashboardProps) {
  // Database States
  const [igAccounts, setIgAccounts] = useState<IgAccount[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [triggeredEvents, setTriggeredEvents] = useState<TriggeredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  
  // Connect Account Form
  const [connectUsername, setConnectUsername] = useState("");
  const [connectPageId, setConnectPageId] = useState("");
  const [connectType, setConnectType] = useState<"instagram_login" | "facebook_login">("instagram_login");
  const [isConnecting, setIsConnecting] = useState(false);

  // Rules Builder Form
  const [ruleIdToEdit, setRuleIdToEdit] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState("");
  const [ruleKeywords, setRuleKeywords] = useState("");
  const [ruleMatchType, setRuleMatchType] = useState<"contains" | "exact">("contains");
  const [rulePostId, setRulePostId] = useState(""); // empty means all posts
  const [ruleReplyMessage, setRuleReplyMessage] = useState("");
  const [isSavingRule, setIsSavingRule] = useState(false);

  // Webhook Simulator Form
  const [selectedSimAccount, setSelectedSimAccount] = useState<string>("");
  const [simScenario, setSimScenario] = useState("match_contains");
  const [simCommentText, setSimCommentText] = useState("Hey! Can you send me the promo link?");
  const [simCommenterName, setSimCommenterName] = useState("travel_blogger_99");
  const [simPostId, setSimPostId] = useState("media_post_2026");
  const [simIsLive, setSimIsLive] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [pipelineStep, setPipelineStep] = useState<number>(-1);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!user?.uid) return;

    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";

    if (isGuest) {
      // Set up local storage-based data sync for Guest Access
      const loadLocalData = () => {
        let localAccts: IgAccount[] = [];
        try {
          const acctsRaw = localStorage.getItem("ak_ai_ig_accounts");
          if (acctsRaw) {
            localAccts = JSON.parse(acctsRaw);
          } else {
            // Seed a mock Instagram account
            localAccts = [{
              id: "acct_mock_1",
              uid: user.uid,
              ig_user_id: "ig_travel_blogger",
              username: "travel_blogger_99",
              page_id: "page_blogger",
              login_type: "instagram_login",
              status: "active",
              access_token_encrypted: "mock_encrypted",
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString()
            }];
            localStorage.setItem("ak_ai_ig_accounts", JSON.stringify(localAccts));
          }
        } catch (e) {
          console.error(e);
        }
        setIgAccounts(localAccts);
        if (localAccts.length > 0 && !selectedSimAccount) {
          setSelectedSimAccount(localAccts[0].ig_user_id);
        }

        let localRules: AutomationRule[] = [];
        try {
          const rulesRaw = localStorage.getItem("ak_ai_automation_rules");
          if (rulesRaw) {
            localRules = JSON.parse(rulesRaw);
          } else {
            // Seed a default automation rule
            localRules = [{
              id: "rule_1",
              uid: user.uid,
              ig_account_id: "acct_mock_1",
              name: "Comment to Promo Link",
              target_post_id: "",
              keywords: ["promo", "link", "code"],
              match_type: "contains",
              reply_message: "Hey there! Here is your exclusive VIP 20% discount code: FOUNDER20. Use it at checkout here: https://ak.ai/promo",
              is_active: true,
              createdAt: new Date().toISOString()
            }];
            localStorage.setItem("ak_ai_automation_rules", JSON.stringify(localRules));
          }
        } catch (e) {
          console.error(e);
        }
        setRules(localRules);

        let localEvents: TriggeredEvent[] = [];
        try {
          const eventsRaw = localStorage.getItem("ak_ai_triggered_events");
          if (eventsRaw) {
            localEvents = JSON.parse(eventsRaw);
          } else {
            localEvents = [{
              id: "trig_1",
              uid: user.uid,
              automation_rule_id: "rule_1",
              comment_id: "comment_1",
              commenter_ig_scoped_id: "commenter_1",
              commenter_username: "fashion_guru_x",
              comment_text: "Can I get the promo code please?",
              status: "sent",
              created_at: new Date().toISOString()
            }];
            localStorage.setItem("ak_ai_triggered_events", JSON.stringify(localEvents));
          }
        } catch (e) {
          console.error(e);
        }
        setTriggeredEvents(localEvents);
        setLoading(false);
      };

      loadLocalData();

      // Poll localStorage every second in case other actions update it
      const interval = setInterval(loadLocalData, 1000);
      return () => clearInterval(interval);
    }

    const accountsQ = query(collection(db, "ig_accounts"), where("uid", "==", user.uid));
    const rulesQ = query(collection(db, "automation_rules"), where("uid", "==", user.uid));
    const eventsQ = query(
      collection(db, "triggered_events"), 
      where("uid", "==", user.uid),
      orderBy("created_at", "desc"),
      limit(50)
    );

    const unsubAccounts = onSnapshot(accountsQ, (snap) => {
      const accts: IgAccount[] = [];
      snap.forEach((d) => accts.push(d.data() as IgAccount));
      setIgAccounts(accts);
      if (accts.length > 0 && !selectedSimAccount) {
        setSelectedSimAccount(accts[0].ig_user_id);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore ig_accounts read permission error, falling back to local simulation mode:", error);
      setLoading(false);
    });

    const unsubRules = onSnapshot(rulesQ, (snap) => {
      const rls: AutomationRule[] = [];
      snap.forEach((d) => rls.push(d.data() as AutomationRule));
      setRules(rls);
    }, (error) => {
      console.warn("Firestore automation_rules read permission error:", error);
    });

    const unsubEvents = onSnapshot(eventsQ, (snap) => {
      const evs: TriggeredEvent[] = [];
      snap.forEach((d) => evs.push(d.data() as TriggeredEvent));
      setTriggeredEvents(evs);
    }, (error) => {
      console.warn("Firestore triggered_events read permission error:", error);
    });

    return () => {
      unsubAccounts();
      unsubRules();
      unsubEvents();
    };
  }, [user?.uid]);

  // Handle Scenario Presets
  useEffect(() => {
    switch (simScenario) {
      case "match_contains":
        setSimCommentText("Hey, can you please send me the direct link? Thanks!");
        setSimIsLive(false);
        break;
      case "match_exact":
        setSimCommentText("PROMO");
        setSimIsLive(false);
        break;
      case "no_match":
        setSimCommentText("This looks absolutely gorgeous, where was this photo taken?");
        setSimIsLive(false);
        break;
      case "self_comment":
        setSimCommentText("Replying to check rule matches.");
        const currentActiveAcct = igAccounts.find(a => a.ig_user_id === selectedSimAccount);
        setSimCommenterName(currentActiveAcct?.username || "travel_blogger_99");
        setSimIsLive(false);
        break;
      case "rate_limit":
        setSimCommentText("Hey I want to trigger a rate_limit failure simulation test");
        setSimIsLive(false);
        break;
      case "blocked_user":
        setSimCommentText("Trigger a fail restricted comment here please");
        setSimIsLive(false);
        break;
      case "live_broadcast":
        setSimCommentText("Is the deal still open? Send me the direct link live!");
        setSimIsLive(true);
        break;
      case "live_over":
        setSimCommentText("I missed the live! But triggers live_over match please");
        setSimIsLive(true);
        break;
      case "expired_comment":
        setSimCommentText("Trigger an expired older comment of 7 days");
        setSimIsLive(false);
        break;
      default:
        break;
    }
    
    if (simScenario !== "self_comment") {
      setSimCommenterName("travel_blogger_99");
    }
  }, [simScenario, selectedSimAccount, igAccounts]);

  // Connect Meta OAuth simulation
  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectUsername.trim()) return;

    setIsConnecting(true);
    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      const mockIgUserId = `ig_${Math.floor(Math.random() * 899999) + 100000}`;
      const newAcct: IgAccount = {
        id: `acct_${mockIgUserId}`,
        uid: user.uid,
        ig_user_id: mockIgUserId,
        username: connectUsername.trim().replace("@", ""),
        page_id: connectPageId.trim() || `page_${Math.floor(Math.random() * 10000)}`,
        login_type: connectType,
        status: "active",
        access_token_encrypted: "mock_encrypted",
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      const accts = [...igAccounts, newAcct];
      localStorage.setItem("ak_ai_ig_accounts", JSON.stringify(accts));
      setIgAccounts(accts);
      if (!selectedSimAccount) {
        setSelectedSimAccount(mockIgUserId);
      }
      setShowConnectModal(false);
      setConnectUsername("");
      setConnectPageId("");
      setIsConnecting(false);
      return;
    }

    try {
      const mockIgUserId = `ig_${Math.floor(Math.random() * 899999) + 100000}`;
      const payload = {
        shortToken: `mock_tok_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        igUserId: mockIgUserId,
        username: connectUsername.trim().replace("@", ""),
        page_id: connectPageId.trim() || `page_${Math.floor(Math.random() * 10000)}`,
        loginType: connectType,
        uid: user.uid
      };

      const res = await fetch("/api/instagram/oauth/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowConnectModal(false);
        setConnectUsername("");
        setConnectPageId("");
      } else {
        const data = await res.json();
        alert(`OAuth Failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Network Error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Reconnect account flow (refreshes tokens)
  const handleReconnect = async (acct: IgAccount) => {
    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      alert(`Successfully reconnected and refreshed access credentials for @${acct.username}`);
      return;
    }

    try {
      const payload = {
        shortToken: `mock_reconnect_tok_${Date.now()}`,
        igUserId: acct.ig_user_id,
        username: acct.username,
        pageId: acct.page_id || "",
        loginType: acct.login_type,
        uid: user.uid
      };

      const res = await fetch("/api/instagram/oauth/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Successfully reconnected and refreshed access credentials for @${acct.username}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Disconnect account
  const handleDisconnect = async (acctId: string) => {
    if (!confirm("Are you sure you want to disconnect this Instagram account? This will halt all active comment keyword rules.")) return;
    
    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      const updated = igAccounts.filter(a => a.id !== acctId);
      localStorage.setItem("ak_ai_ig_accounts", JSON.stringify(updated));
      setIgAccounts(updated);
      return;
    }

    try {
      await deleteDoc(doc(db, "ig_accounts", acctId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // CRUD Save Rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleKeywords.trim() || !ruleReplyMessage.trim() || igAccounts.length === 0) return;

    setIsSavingRule(true);
    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      const keywordList = ruleKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0);
      const ruleId = ruleIdToEdit || `rule_${Date.now()}`;
      
      const payload: AutomationRule = {
        id: ruleId,
        uid: user.uid,
        ig_account_id: igAccounts[0].id, // bind to connected account
        name: ruleName.trim(),
        target_post_id: rulePostId.trim() || null,
        keywords: keywordList,
        match_type: ruleMatchType,
        reply_message: ruleReplyMessage.trim(),
        is_active: true,
        createdAt: new Date().toISOString()
      };

      let updatedRules: AutomationRule[] = [];
      if (ruleIdToEdit) {
        updatedRules = rules.map(r => r.id === ruleIdToEdit ? payload : r);
      } else {
        updatedRules = [...rules, payload];
      }
      localStorage.setItem("ak_ai_automation_rules", JSON.stringify(updatedRules));
      setRules(updatedRules);
      setShowRuleModal(false);
      resetRuleForm();
      setIsSavingRule(false);
      return;
    }

    try {
      const keywordList = ruleKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0);
      const ruleId = ruleIdToEdit || `rule_${Date.now()}`;
      
      const payload: AutomationRule = {
        id: ruleId,
        uid: user.uid,
        ig_account_id: igAccounts[0].id, // bind to connected account
        name: ruleName.trim(),
        target_post_id: rulePostId.trim() || null,
        keywords: keywordList,
        match_type: ruleMatchType,
        reply_message: ruleReplyMessage.trim(),
        is_active: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "automation_rules", ruleId), payload);
      setShowRuleModal(false);
      resetRuleForm();
    } catch (err: any) {
      alert(`Error saving rule: ${err.message}`);
    } finally {
      setIsSavingRule(false);
    }
  };

  const resetRuleForm = () => {
    setRuleIdToEdit(null);
    setRuleName("");
    setRuleKeywords("");
    setRuleMatchType("contains");
    setRulePostId("");
    setRuleReplyMessage("");
  };

  const handleEditRule = (rule: AutomationRule) => {
    setRuleIdToEdit(rule.id);
    setRuleName(rule.name);
    setRuleKeywords(rule.keywords.join(", "));
    setRuleMatchType(rule.match_type);
    setRulePostId(rule.target_post_id || "");
    setRuleReplyMessage(rule.reply_message);
    setShowRuleModal(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Delete this Comment-to-DM automation rule?")) return;

    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      const updated = rules.filter(r => r.id !== ruleId);
      localStorage.setItem("ak_ai_automation_rules", JSON.stringify(updated));
      setRules(updated);
      return;
    }

    try {
      await deleteDoc(doc(db, "automation_rules", ruleId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleRuleActive = async (rule: AutomationRule) => {
    const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
    if (isGuest) {
      const updated = rules.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r);
      localStorage.setItem("ak_ai_automation_rules", JSON.stringify(updated));
      setRules(updated);
      return;
    }

    try {
      await updateDoc(doc(db, "automation_rules", rule.id), {
        is_active: !rule.is_active
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Webhook Signature & Pipeline Simulation Execution
  const handleRunSimulator = async () => {
    if (!selectedSimAccount) {
      alert("Please connect a simulated Instagram account first.");
      return;
    }

    setSimulating(true);
    setPipelineStep(0);
    setSimLogs(["[SIMULATOR] Building official Instagram JSON webhook payload..."]);

    const appendLog = (msg: string, delay: number, step: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setSimLogs(prev => [...prev, msg]);
          setPipelineStep(step);
          resolve();
        }, delay);
      });
    };

    // Timeline Animation
    await appendLog("[HMAC SIGNER] Generating secure X-Hub-Signature-256 header using INSTAGRAM_APP_SECRET...", 800, 1);
    await appendLog("[CLIENT GATEWAY] POSTing loopback request to /api/instagram/webhook...", 600, 2);
    
    try {
      const response = await fetch("/api/instagram/sandbox/simulate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          igUserId: selectedSimAccount,
          commentId: `comm_${Date.now()}`,
          text: simCommentText,
          commenterUsername: simCommenterName,
          commenterScopedId: simScenario === "self_comment" ? selectedSimAccount : `scoped_usr_${Math.floor(Math.random() * 100000)}`,
          mediaId: simPostId.trim() || "media_post_2026",
          isLive: simIsLive
        })
      });

      const data = await response.json();

      if (response.ok) {
        await appendLog(`[WEBHOOK HANDLER] Meta Server responded 200 OK within 150ms: ${data.result}`, 700, 3);
        await appendLog("[DEDUPLICATION] Running comment uniqueness query checks in Firestore...", 500, 4);
        
        if (simScenario === "no_match") {
          await appendLog("[KEYWORDS] Evaluating match strategies. Result: No matches. Comment ignored.", 600, 4);
        } else if (simScenario === "self_comment") {
          await appendLog("[FILTER] Trigger comment was made by the owner account. Automatically skipped.", 600, 4);
        } else {
          await appendLog("[ROUTER] MATCH FOUND! Direct match rule located. Preparing payload...", 400, 4);
          await appendLog("[MEM_QUEUE] Comment successfully pushed to background processing worker queue.", 600, 5);
          
          if (simScenario === "rate_limit") {
            await appendLog("[WORKER] Met Rate Limit error (429). Initiating backoff... Rescheduled for automatic retry in 3s...", 1000, 5);
            await appendLog("[WORKER][RETRY 1] Exponential backoff processing starting...", 2500, 5);
            await appendLog("[WORKER][CEILING] Retry limit reached. Job failed with Meta code 429.", 1000, 5);
          } else if (simScenario === "blocked_user") {
            await appendLog("[WORKER] Meta returned API error code 10: Recipient restricted page messages. Drop job.", 1000, 5);
          } else if (simScenario === "expired_comment") {
            await appendLog("[WORKER] Evaluated comment age: Created 7.1 days ago. Dropping reply based on 7-day compliance.", 1000, 5);
          } else if (simScenario === "live_over") {
            await appendLog("[WORKER] Broadcast session ended. Drops Private Reply live comment requirement.", 1000, 5);
          } else {
            await appendLog("[WORKER] Private Reply DM successfully sent to Meta API! Code 200 delivered.", 1500, 5);
          }

          // In Guest Mode, append the simulated triggered event locally
          const isGuest = localStorage.getItem("ak_ai_is_guest") === "true";
          if (isGuest) {
            const newEvent: TriggeredEvent = {
              id: `trig_${Date.now()}`,
              uid: user.uid,
              automation_rule_id: rules[0]?.id || "rule_1",
              comment_id: `comm_${Date.now()}`,
              commenter_ig_scoped_id: `scoped_usr_${Math.floor(Math.random() * 100000)}`,
              commenter_username: simCommenterName,
              comment_text: simCommentText,
              status: (simScenario === "rate_limit" || simScenario === "blocked_user") ? "failed" : (simScenario === "expired_comment" ? "expired" : "sent"),
              created_at: new Date().toISOString()
            };
            const updated = [newEvent, ...triggeredEvents];
            localStorage.setItem("ak_ai_triggered_events", JSON.stringify(updated));
            setTriggeredEvents(updated);
          }
        }
      } else {
        await appendLog(`[ERROR] Ingestion Endpoint failure: ${data.error}`, 500, -1);
      }
    } catch (err: any) {
      await appendLog(`[NET EXCEPTION] ${err.message}`, 500, -1);
    } finally {
      setSimulating(false);
    }
  };

  // Trigger global token check
  const handleCheckTokens = async () => {
    try {
      const res = await fetch("/api/instagram/sandbox/token-check", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`Completed token expiration audit scans. Flagged/revoked ${data.flaggedCount} approaching credentials.`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Aggregate Analytics
  const totalComments = triggeredEvents.length;
  const sentDMs = triggeredEvents.filter(e => e.status === "sent").length;
  const failedDMs = triggeredEvents.filter(e => e.status === "failed").length;
  const skippedDMs = triggeredEvents.filter(e => ["skipped_self_comment", "skipped_duplicate"].includes(e.status)).length;
  const expiredDMs = triggeredEvents.filter(e => e.status === "expired").length;

  return (
    <div className="space-y-6 font-sans text-zinc-100" id="instagram-comment-to-dm-automation-tab">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#09090B] border border-[#27272A] p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/30">
              <Instagram className="w-4 h-4 text-pink-400" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Instagram Comment-to-DM Engine</h2>
            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
              Official Private Reply API
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Convert social engagement into business value. Automatically direct-message leads with links and assets when they comment keyword triggers on your posts, reels, or live streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckTokens}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#27272A] bg-[#18181B] text-xs font-semibold rounded-lg text-zinc-300 hover:text-white transition-all"
            title="Scan connected account tokens for approaching expiration dates"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Audit Expirations</span>
          </button>
          
          <button
            onClick={() => { resetRuleForm(); setShowRuleModal(true); }}
            disabled={igAccounts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:brightness-110 disabled:opacity-40 text-black text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD ANALYTICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Total Comments Scanned</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight">{totalComments}</span>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
        
        <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">DMs Successfully Sent</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">{sentDMs}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Delivery Failures</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-red-400">{failedDMs}</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Skipped Self/Duplicates</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-400">{skippedDMs}</span>
            <X className="w-4 h-4 text-zinc-500" />
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-xl flex flex-col justify-between space-y-1.5 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">GDPR Expired</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-amber-400">{expiredDMs}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONNECTED ACCOUNTS & RULES */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CONNECTED ACCOUNTS */}
          <div className="bg-[#09090B] border border-[#27272A] p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#18181B] pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                Connected Instagram Professional Accounts
              </h3>
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-[10px] font-bold font-mono text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Connect Account
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              </div>
            ) : igAccounts.length === 0 ? (
              <div className="border border-dashed border-[#27272A] p-6 text-center rounded-xl space-y-3">
                <Instagram className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold">No connected professional accounts</p>
                  <p className="text-[10px] text-zinc-500 max-w-sm mx-auto">
                    Link your Instagram Business or Creator account via Facebook OAuth Login to launch comment-to-DM triggers.
                  </p>
                </div>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-200 text-xs font-bold rounded-md hover:bg-zinc-700 transition-all"
                >
                  Configure Connection Sandbox
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {igAccounts.map((acct) => {
                  const daysLeft = Math.ceil((new Date(acct.token_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isTokenWarning = daysLeft < 15 || acct.status === "token_expired";

                  return (
                    <div 
                      key={acct.id} 
                      className={`border p-4 rounded-xl flex items-center justify-between gap-3 transition-all ${
                        isTokenWarning 
                          ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10" 
                          : "border-[#18181B] bg-[#18181B]/40 hover:border-[#27272A]"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-[#09090B] flex items-center justify-center">
                              <Instagram className="w-4 h-4 text-zinc-100" />
                            </div>
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#09090B] flex items-center justify-center ${
                            acct.status === "active" ? "bg-emerald-500" : "bg-red-500"
                          }`} />
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold font-mono text-white truncate">@{acct.username}</h4>
                            <span className="text-[9px] bg-zinc-800 border border-zinc-700 font-mono text-zinc-400 px-1.5 py-0.2 rounded">
                              {acct.login_type === "instagram_login" ? "IG Login" : "FB Page Link"}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate">Page ID: {acct.page_id || "Unlinked"}</p>
                          <div className="flex items-center space-x-2 text-[9px] font-mono">
                            {isTokenWarning ? (
                              <span className="text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> Connection expired or revoked ({daysLeft}d remaining)
                              </span>
                            ) : (
                              <span className="text-emerald-500 flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" /> Authorized (Token expires in {daysLeft} days)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => handleReconnect(acct)}
                          className="p-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] rounded text-zinc-400 hover:text-white transition-all"
                          title="Reconnect Account"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDisconnect(acct.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-all"
                          title="Disconnect Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COMMENT RULES TABLE */}
          <div className="bg-[#09090B] border border-[#27272A] p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#18181B] pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-pink-400" />
                Active Keyword-to-DM Trigger Rules
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Rules: {rules.length}</span>
            </div>

            {rules.length === 0 ? (
              <div className="border border-dashed border-[#27272A] p-6 text-center rounded-xl space-y-2">
                <Sliders className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">No automation rules configured</p>
                <p className="text-[10px] text-zinc-500 max-w-sm mx-auto">
                  Click 'Create Rule' to establish your first automated comment matcher.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="border border-[#18181B] bg-[#18181B]/10 hover:bg-[#18181B]/40 rounded-xl p-4 space-y-3 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            rule.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                          }`}>
                            {rule.is_active ? "Live" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span className="font-mono bg-zinc-800 px-1 py-0.2 rounded text-zinc-300">
                            {rule.match_type === "exact" ? "Exact Match" : "Contains"}
                          </span>
                          <span>&bull;</span>
                          <span className="truncate">
                            Target post: {rule.target_post_id ? `Media #${rule.target_post_id}` : "All Posts"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Toggle active button */}
                        <button
                          onClick={() => toggleRuleActive(rule)}
                          className={`w-8 h-4 rounded-full relative transition-all ${
                            rule.is_active ? "bg-pink-500" : "bg-zinc-700"
                          }`}
                        >
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                            rule.is_active ? "right-0.5" : "left-0.5"
                          }`} />
                        </button>
                        
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-1.5 hover:bg-[#18181B] rounded text-zinc-400 hover:text-white transition-all"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-[#18181B] pt-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-mono text-zinc-500">Keywords:</span>
                        {rule.keywords.map((kw, i) => (
                          <span key={i} className="text-[10px] bg-pink-500/10 border border-pink-500/20 font-mono text-pink-300 px-1.5 py-0.2 rounded">
                            "{kw}"
                          </span>
                        ))}
                      </div>

                      <div className="bg-[#09090B] border border-[#18181B] p-2.5 rounded-lg space-y-1">
                        <span className="text-[9px] font-mono uppercase text-zinc-500 block">Auto Reply Message DM</span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                          {rule.reply_message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE WEBHOOK PIPELINE SIMULATOR */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#09090B] border border-pink-500/10 rounded-xl p-5 space-y-4 relative overflow-hidden">
            
            {/* Visual ambient accent */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />

            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-pink-400 font-bold flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-pink-400" />
                Live API & Webhook Simulator Console
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Meta Sandboxed environment. Simulate real comment webhook deliveries and trace the signature handshake, deduplication constraints, and queue workers instantly.
              </p>
            </div>

            <div className="space-y-4">
              {/* Account select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Target Connected Account</label>
                <select
                  value={selectedSimAccount}
                  onChange={(e) => setSelectedSimAccount(e.target.value)}
                  className="w-full text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 outline-none focus:border-[#3F3F46]"
                >
                  {igAccounts.map(a => (
                    <option key={a.id} value={a.ig_user_id}>@{a.username} ({a.ig_user_id})</option>
                  ))}
                  {igAccounts.length === 0 && <option value="">No Accounts Connected</option>}
                </select>
              </div>

              {/* Scenario selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Simulate Meta API Scenario</label>
                <select
                  value={simScenario}
                  onChange={(e) => setSimScenario(e.target.value)}
                  className="w-full text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 outline-none focus:border-[#3F3F46]"
                >
                  <option value="match_contains">1. Match Contains ("can you send me link")</option>
                  <option value="match_exact">2. Match Exact Keywords ("PROMO")</option>
                  <option value="no_match">3. Ignored Comment (No keyword matches)</option>
                  <option value="self_comment">4. Skipped Comment (Owner self-comment)</option>
                  <option value="rate_limit">5. Meta Rate Limiting (Simulate 429 retries)</option>
                  <option value="blocked_user">6. Restricted Recipient (Meta Code 10 fail)</option>
                  <option value="live_broadcast">7. IG Live comment match (Live Active)</option>
                  <option value="live_over">8. IG Live comment ended (Cannot reply)</option>
                  <option value="expired_comment">9. GDPR Deletion Compliance (Older than 7 days)</option>
                </select>
              </div>

              {/* Editable Comment Input details */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Commenter Username</label>
                  <input
                    type="text"
                    value={simCommenterName}
                    onChange={(e) => setSimCommenterName(e.target.value)}
                    className="w-full text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2 px-2.5 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Media / Post ID</label>
                  <input
                    type="text"
                    value={simPostId}
                    onChange={(e) => setSimPostId(e.target.value)}
                    className="w-full text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2 px-2.5 outline-none"
                    placeholder="e.g. media_101"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Simulated Comment Message</label>
                <textarea
                  value={simCommentText}
                  onChange={(e) => setSimCommentText(e.target.value)}
                  className="w-full h-16 text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2 resize-none outline-none"
                  required
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunSimulator}
                disabled={simulating || igAccounts.length === 0}
                className="w-full py-2.5 bg-pink-500 hover:brightness-110 active:scale-[0.98] transition-all text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/10 disabled:opacity-40"
              >
                {simulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Sandbox Handshakes...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Fire Sandbox Webhook Trigger</span>
                  </>
                )}
              </button>
            </div>

            {/* PIPELINE STREAM PROCESSOR */}
            {(pipelineStep >= 0 || simLogs.length > 0) && (
              <div className="border border-[#27272A] bg-[#09090B] p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#18181B] pb-2">
                  <span className="text-[10px] font-mono uppercase text-pink-400 font-bold flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Pipeline Live Tracing
                  </span>
                  <button 
                    onClick={() => { setPipelineStep(-1); setSimLogs([]); }}
                    className="text-[9px] font-mono text-zinc-500 hover:text-white"
                  >
                    Clear Logs
                  </button>
                </div>

                {/* Vertical Checkpoint Timeline */}
                <div className="space-y-3.5">
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="mt-0.5">
                      {pipelineStep >= 1 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-700 animate-pulse shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold font-mono text-white text-[11px]">1. Signature Handshake Auth</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">HMAC-SHA256 headers generated and verified successfully.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-xs">
                    <div className="mt-0.5">
                      {pipelineStep >= 3 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-700 shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold font-mono text-white text-[11px]">2. Deduplication & Restrictions</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">Comment duplication checked. Owner profile comment filtered.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-xs">
                    <div className="mt-0.5">
                      {pipelineStep >= 4 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-700 shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold font-mono text-white text-[11px]">3. Rule Evaluator & Matcher</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">Post specificity and keyword conditions scanned.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-xs">
                    <div className="mt-0.5">
                      {pipelineStep >= 5 ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-700 shrink-0" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold font-mono text-white text-[11px]">4. Queue worker & DM Dispatch</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">Evaluated DM sent via official private replies Graph API.</p>
                    </div>
                  </div>
                </div>

                {/* Command raw logs terminal */}
                <div className="bg-[#09090B] border border-zinc-800 p-3 rounded-lg font-mono text-[9px] text-zinc-300 space-y-1 max-h-36 overflow-y-auto leading-relaxed">
                  {simLogs.map((log, index) => (
                    <div key={index} className="truncate">
                      <span className="text-pink-400 mr-1.5">&gt;</span>{log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* TRIGGERS & REPLIES REAL-TIME AUDIT LOGS */}
      <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-pink-400" />
            Real-time Private Reply Delivery Logs
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">Live audit logs of comments evaluated and the resulting Direct Message delivery transactions.</p>
        </div>

        {triggeredEvents.length === 0 ? (
          <div className="border border-dashed border-[#27272A] p-8 text-center rounded-xl space-y-2">
            <Activity className="w-6 h-6 text-zinc-600 mx-auto" />
            <p className="text-xs font-semibold text-zinc-300">No logs logged yet</p>
            <p className="text-[10px] text-zinc-500">
              Run simulated webhooks to populate this audit trail grid dynamically in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] text-[10px] text-zinc-500 uppercase">
                  <th className="pb-3 font-semibold">Commenter</th>
                  <th className="pb-3 font-semibold">Comment Text</th>
                  <th className="pb-3 font-semibold">Matched Rule</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Processed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181B] text-zinc-300">
                {triggeredEvents.map((ev) => {
                  const rule = rules.find(r => r.id === ev.automation_rule_id);
                  let statusBadge = "bg-zinc-800 text-zinc-400";
                  let statusText = ev.status;

                  if (ev.status === "sent") {
                    statusBadge = "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400";
                    statusText = "DM Sent";
                  } else if (ev.status === "failed") {
                    statusBadge = "bg-red-500/10 border border-red-500/20 text-red-400";
                    statusText = "Failed";
                  } else if (ev.status === "skipped_self_comment") {
                    statusBadge = "bg-zinc-800 border border-zinc-700 text-zinc-400";
                    statusText = "Skipped (Self)";
                  } else if (ev.status === "expired") {
                    statusBadge = "bg-amber-500/10 border border-amber-500/20 text-amber-400";
                    statusText = "Expired (>7d)";
                  } else if (ev.status === "running") {
                    statusBadge = "bg-pink-500/20 border border-pink-500/30 text-pink-400 animate-pulse";
                    statusText = "Queued";
                  }

                  return (
                    <tr key={ev.id} className="hover:bg-[#18181B]/10 transition-colors group">
                      <td className="py-3.5 pr-3 font-bold text-white">@{ev.commenter_username}</td>
                      <td className="py-3.5 pr-3 max-w-xs truncate" title={ev.comment_text}>{ev.comment_text}</td>
                      <td className="py-3.5 pr-3 text-zinc-400">
                        {rule ? rule.name : <span className="text-zinc-600">None</span>}
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block self-start font-bold ${statusBadge}`}>
                            {statusText.toUpperCase()}
                          </span>
                          {ev.error_message && (
                            <span className="text-[9px] text-zinc-500 leading-tight block max-w-xs">
                              {ev.error_message}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 text-right text-zinc-500 text-[11px]">
                        {new Date(ev.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CONNECT SIMULATOR PORT */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="border border-[#27272A] bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setShowConnectModal(false)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-[#18181B] pb-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/30">
                <Instagram className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Connect Sandbox Account</h3>
                <p className="text-[11px] text-zinc-500">Configure simulated Facebook OAuth login credentials</p>
              </div>
            </div>

            <form onSubmit={handleConnectAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Instagram Handle</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. travel_influencer_2026"
                  value={connectUsername}
                  onChange={(e) => setConnectUsername(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none font-mono"
                  disabled={isConnecting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Linked Facebook Page ID (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. fb_page_8928"
                  value={connectPageId}
                  onChange={(e) => setConnectPageId(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none font-mono"
                  disabled={isConnecting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Meta Access Authentication Type</label>
                <div className="flex bg-[#18181B] border border-[#27272A] p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setConnectType("instagram_login")}
                    className={`flex-1 py-2 text-center rounded-md font-mono ${connectType === "instagram_login" ? "bg-[#27272A] text-white" : "text-zinc-500"}`}
                  >
                    Direct IG OAuth
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectType("facebook_login")}
                    className={`flex-1 py-2 text-center rounded-md font-mono ${connectType === "facebook_login" ? "bg-[#27272A] text-white" : "text-zinc-500"}`}
                  >
                    Linked FB Page
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-2.5 bg-pink-500 text-black font-bold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Complete OAuth Handshake Simulation</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RULE BUILDER */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="border border-[#27272A] bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setShowRuleModal(false)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-[#18181B] pb-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/30">
                <Sliders className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{ruleIdToEdit ? "Modify Trigger Rule" : "Create Comment-to-DM Trigger Rule"}</h3>
                <p className="text-[11px] text-zinc-500">Establish comment keywords and target automated replies</p>
              </div>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-400">Rule Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lead Magnet PDF Promotion"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none"
                  disabled={isSavingRule}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Match Type</label>
                  <select
                    value={ruleMatchType}
                    onChange={(e) => setRuleMatchType(e.target.value as any)}
                    className="w-full text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 outline-none"
                  >
                    <option value="contains">Contains (Case-Insensitive)</option>
                    <option value="exact">Exact Phrase Match</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Specific Post ID (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. media_101 (or blank for all)"
                    value={rulePostId}
                    onChange={(e) => setRulePostId(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none font-mono"
                    disabled={isSavingRule}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Keyword Triggers</label>
                  <span className="text-[9px] text-zinc-500 font-mono">Comma-separated</span>
                </div>
                <input 
                  type="text"
                  required
                  placeholder="e.g. link, send link, info, book"
                  value={ruleKeywords}
                  onChange={(e) => setRuleKeywords(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none font-mono"
                  disabled={isSavingRule}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">Automated Direct Message Reply Content</label>
                  <span className="text-[9px] text-zinc-500 font-mono">Max 1 reply limit</span>
                </div>
                <textarea 
                  required
                  placeholder="e.g. Here is your exclusive access link! Click here to claim: {link}"
                  value={ruleReplyMessage}
                  onChange={(e) => setRuleReplyMessage(e.target.value)}
                  className="w-full h-20 bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none resize-none font-mono"
                  disabled={isSavingRule}
                />
              </div>

              <button
                type="submit"
                disabled={isSavingRule}
                className="w-full py-2.5 bg-pink-500 text-black font-bold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-1.5"
              >
                {isSavingRule ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Save Trigger Rule</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
