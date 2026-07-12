# AK.AI Master Application Replication Prompt
> Paste this absolute "God-Level" blueprint prompt into any AI coding, vibe-coding, or text-to-app platform (e.g. Bolt, Lovable, v0, Replit Agent, Cursor, Windsurf) to reproduce the entire application with identical logic, layout, and architecture.

---

```markdown
Role: Master Full-Stack AI Engineer & UI/UX Craftsman
Objective: Create a highly polished, premium, full-stack Virtual Company Simulation and Workflow Automation suite named "AK.AI".

The application must be visually magnificent, highly responsive, and follow an elegant dark slate slate-gray theme (minimalist, off-whites, charcoal backdrops, custom gradient highlights). It must utilize a robust React + TypeScript SPA on the frontend, a Node.js/Express backend on the server, and Firebase Firestore + Auth for secure, persistent, real-time database syncing.

Please implement the following exact components, workflows, and full-stack routes with precision.

---

### SECTION 1: ARCHITECTURE & TECH STACK
1. **Frontend framework**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (`motion/react` for elegant micro-transitions), Lucide React for consistent icons, Recharts for analytics data visualization.
2. **Backend engine**: Express + Node.js (TypeScript). Use the modern `@google/genai` SDK for Gemini 3.5 integrations. All API key calls must be proxied through backend routes (`/api/*`) for security.
3. **Database & Auth**: Firestore for persistent syncing and Firebase Auth for secure login. Utilize client-side real-time snap-listeners (`onSnapshot`) to reflect state changes immediately in the UI.

---

### SECTION 2: CLIENT SIDE STATE & DATABASE MODEL (Firestore)
Keep a unified store hook (`useCompanyStore`) that synchronizes real-time collection streams.
- `users`: `{ uid, email, displayName, balance, plan, isDev, createdAt }`
- `employees`: `{ id, uid, name, role, avatar, department, goal, skills, systemPrompt, model, temperature, createdAt }`
- `projects`: `{ id, uid, name, description, status, progress, deadline, budget, createdAt }`
- `tasks`: `{ id, uid, title, description, status ('todo' | 'in_progress' | 'review' | 'completed'), priority, assigneeId, projectId, createdAt }`
- `chats`: `{ id, uid, employeeId, title, pinned, updatedAt }`
- `messages`: `{ id, uid, chatId, sender ('user' | 'assistant'), text, timestamp }`
- `activity_logs`: `{ id, uid, action, details, timestamp }`
- `files`: `{ id, uid, name, type, content, size, createdAt }`
- `memories`: `{ id, uid, title, content, category ('knowledge' | 'instruction' | 'saved_doc'), createdAt }`
- `notifications`: `{ id, uid, title, description, type, isRead, createdAt }`
- `integrations`: `{ id, uid, platform, connectionName, status, credentials, createdAt }`
- `automation_runs`: `{ id, uid, platform, prompt, recipient, topic, subject, enhancedMessage, explanation, status, responsePayload, createdAt }`

---

### SECTION 3: BACKEND CONTROLLER CHANNELS (server.ts)
Implement secure endpoints integrating Gemini:
1. `/api/ceo/chat`: Takes a user's prompt directed to the CEO assistant. Uses a strict executive system instruction to automatically parse the user's request. If the user commands an action (e.g. "Build a web app"), the agent should reply with the project's details, task outlines, and recommend spawning specialized virtual employees.
2. `/api/employee/chat`: Proxies conversational requests directly to individual virtual workers, grounding their responses in their unique `systemPrompt`, `goal`, and `temperature`.
3. `/api/automation/enhance`: Parses raw user instructions (e.g. "Send an email to Richard") and formats them according to the targeted channel's metadata style:
   - **Gmail**: Crafts formal, professional layouts.
   - **WhatsApp**: Integrates bold styling, spacing, and emojis.
   - **Instagram**: Creates highly engaging captions with hashtags.
   - **Google Sheets**: Prepares structured grid log entries.
   - **Slack / Discord**: Generates team-oriented markdown headers.

---

### SECTION 4: THE USER INTERFACE VIEW LAYOUTS (Single SPA Navigation)
Render these premium, distinctive interfaces through a left-side navigation sidebar:
1. **Dynamic Dashboard Overview**: Summarizes core KPIs in a beautiful dashboard grid. Includes active project counts, task completion ratios, running automation pipelines, and quick-prompt launchers.
2. **CEO Chat Executive Terminal**: A clean conversation interface to chat with "Elena" (AI CEO). Directives typed here can trigger real-time actions.
3. **Team Collaboration Hub**: A shared terminal showing custom employee agents working together. Users can inspect memory bases or auto-create documents.
4. **Employees Roster**: Interactive cards displaying each AI worker. Users can click to configure their parameters, edit traits, delete, or create custom employees.
5. **Project Tracker & Kanban Boards**: A visual Kanban board where cards can be clicked or status-toggled in real-time, instantly reflecting on the analytics board.
6. **Super Memory Bank**: Enables website scraping (scrapes titles and main text) and drag-and-drop text file uploaders to expand the AI's corporate knowledge base.
7. **Integrations & Workflow Runner**:
   - **Connectors**: Auth forms for Gmail, Sheets, WhatsApp, Instagram, Slack, and custom Webhooks.
   - **Agent Dispatcher**: Choose a platform, write a prompt, and watch the AI enhance and trigger the API.
   - **Delivery Preview**: Side-by-side mockups showing how the final payload appears on the recipient's channel.
   - **Audit Logs**: History list with expanding details of raw payloads and JSON responses.
8. **Files Vault**: Central storage showing files generated by AI employees.
9. **Activity logs & Billing plans**: Live audit list of all actions, plus premium plans redeemable via promo codes.

---

### SECTION 5: SIGNATURE STYLING & ACCENTS
- Choose **Inter** for UI, and **JetBrains Mono** for developer logs/JSON payloads.
- Backgrounds must be very dark off-blacks (`bg-slate-950` / `bg-[#09090B]`) with containers in dark charcoal (`bg-[#18181B]`) styled with thin, high-contrast borders (`border-[#27272A]`).
- Do NOT use low-quality mock logs, terminal telemetry slop, or unnecessary system status credit lines in margins. High design is achieved with clean space, elegant margins, and smooth hover feedback.
```
