import React, { useState } from "react";
import { 
  Mail, 
  Database, 
  MessageSquare, 
  Instagram, 
  Slack, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  Play, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  Cpu, 
  Workflow,
  X,
  Send,
  Sliders,
  ChevronRight,
  Info
} from "lucide-react";
import { Integration, AutomationRun } from "../types";
import InstagramCommentToDMDashboard from "./InstagramCommentToDMDashboard";

interface IntegrationsViewProps {
  integrations: Integration[];
  automationRuns: AutomationRun[];
  onAddIntegration: (platform: any, connectionName: string, credentials: any) => Promise<any>;
  onDeleteIntegration: (id: string) => Promise<void>;
  onTriggerAutomation: (prompt: string, platform: string, rawMode?: boolean) => Promise<any>;
  user?: any;
}

const SUPPORTED_PLATFORMS = [
  {
    id: "gmail" as const,
    name: "Gmail Business Office",
    icon: Mail,
    color: "from-red-500/20 to-rose-600/20 text-red-400 border-red-500/20",
    desc: "Route corporate communications, follow-ups, and meeting invites automatically.",
    credentialFields: [
      { name: "email", label: "Gmail Address", type: "email", placeholder: "e.g. executive@ak-ai.com" },
      { name: "accountName", label: "Sender Name / Alias", type: "text", placeholder: "e.g. Elena (AK.AI CEO)" }
    ]
  },
  {
    id: "google_sheets" as const,
    name: "Google Sheets Analytics",
    icon: Database,
    color: "from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/20",
    desc: "Log metrics, project deliverables, and real-time financial logs directly.",
    credentialFields: [
      { name: "sheetId", label: "Spreadsheet ID / Drive URL", type: "text", placeholder: "e.g. 1tY78R_ux..." },
      { name: "sheetName", label: "Target Sheet / Tab Name", type: "text", placeholder: "e.g. 'Deliverables' or 'Sheet1'" }
    ]
  },
  {
    id: "whatsapp" as const,
    name: "WhatsApp Enterprise",
    icon: MessageSquare,
    color: "from-green-500/20 to-emerald-600/20 text-green-400 border-green-500/20",
    desc: "Direct-to-mobile chat notification broadcasts with warm conversational styling.",
    credentialFields: [
      { name: "accountName", label: "Business Account Label", type: "text", placeholder: "e.g. AK.AI Support" },
      { name: "webhookUrl", label: "WhatsApp Gateway API Token", type: "password", placeholder: "e.g. wa_api_token_..." }
    ]
  },
  {
    id: "instagram" as const,
    name: "Instagram Social Business",
    icon: Instagram,
    color: "from-pink-500/20 to-violet-600/20 text-pink-400 border-pink-500/20",
    desc: "Automate social media outreach, promotional posts, and AI visual alerts.",
    credentialFields: [
      { name: "accountName", label: "Instagram Handle Name", type: "text", placeholder: "e.g. @ak.ai_corporate" },
      { name: "apiKey", label: "Meta Graph Access Token", type: "password", placeholder: "e.g. ig_graph_..." }
    ]
  },
  {
    id: "slack" as const,
    name: "Slack Team Workspace",
    icon: Slack,
    color: "from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/20",
    desc: "Instantly alert development and operations teams on task accomplishments.",
    credentialFields: [
      { name: "webhookUrl", label: "Incoming Webhook URL", type: "text", placeholder: "e.g. https://hooks.slack.com/services/..." },
      { name: "accountName", label: "Target Channel Name", type: "text", placeholder: "e.g. #general-deliverables" }
    ]
  },
  {
    id: "webhook" as const,
    name: "Custom API Webhook",
    icon: LinkIcon,
    color: "from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/20",
    desc: "Trigger external microservices, web hooks, or Zapier automation triggers.",
    credentialFields: [
      { name: "webhookUrl", label: "Target Callback Webhook URL", type: "text", placeholder: "e.g. https://api.my-domain.com/v1/webhook" },
      { name: "apiKey", label: "Secret API Access Header Key", type: "password", placeholder: "X-AK-AI-Gateway-Secret" }
    ]
  }
];

const TEMPLATES = [
  {
    title: "Meeting Invite",
    platform: "gmail",
    prompt: "send an email to Richard Hendricks about coordinating the server migration meeting tomorrow at 3 PM EST"
  },
  {
    title: "Activity Logger",
    platform: "google_sheets",
    prompt: "log a completed project task: Julian Rivera completed premium UI design revision for Pied Piper landing page"
  },
  {
    title: "Client Broadcaster",
    platform: "whatsapp",
    prompt: "send a welcoming WhatsApp notification to Marcus Aurelius thanking him for onboarding onto our Enterprise plan"
  },
  {
    title: "Marketing Blast",
    platform: "instagram",
    prompt: "draft and schedule an Instagram post promoting our brand new AI Developer Employees that work 24/7"
  },
  {
    title: "Slack Alert",
    platform: "slack",
    prompt: "alert the workspace on #ops about successful production deploy of Pied Piper core protocol v1.0.4"
  }
];

export default function IntegrationsView({
  integrations,
  automationRuns,
  onAddIntegration,
  onDeleteIntegration,
  onTriggerAutomation,
  user
}: IntegrationsViewProps) {
  // Modal states
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [connectionName, setConnectionName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Runner states
  const [runnerPrompt, setRunnerPrompt] = useState("");
  const [runnerPlatform, setRunnerPlatform] = useState("gmail");
  const [aiEnhanced, setAiEnhanced] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [selectedHistoryRun, setSelectedHistoryRun] = useState<AutomationRun | null>(null);

  // Active platform tab
  const [activeTab, setActiveTab] = useState<"connections" | "runner" | "history" | "instagram">("runner");

  // Step simulation texts
  const steps = [
    "🔍 Elena (AI CEO): Reviewing instruction and parameters...",
    "✍️ Gemini 3.5: Enhancing copywriting & structuring payload...",
    "🌐 AK.AI Gateway: Fetching platform authorization credentials...",
    "🚀 Router: Handshaking with platform webhook API...",
    "✅ Core: Delivery confirmed! Creating audit trail logs."
  ];

  // Handle open connector
  const handleOpenConnector = (platform: any) => {
    setSelectedPlatform(platform);
    setConnectionName(`${platform.name} Connection`);
    const initialCreds: Record<string, string> = {};
    platform.credentialFields.forEach((f: any) => {
      initialCreds[f.name] = "";
    });
    setCredentials(initialCreds);
    setShowConnectModal(true);
  };

  // Handle connect save
  const handleConnectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionName.trim()) return;

    setIsAuthorizing(true);
    // Add realistic 1.2s API authorization delay
    setTimeout(async () => {
      try {
        await onAddIntegration(selectedPlatform.id, connectionName, credentials);
        setShowConnectModal(false);
        setSelectedPlatform(null);
        setConnectionName("");
        setCredentials({});
      } catch (err) {
        console.error(err);
      } finally {
        setIsAuthorizing(false);
      }
    }, 1200);
  };

  // Handle run automation
  const handleRunAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runnerPrompt.trim()) return;

    setIsExecuting(true);
    setCurrentStep(0);
    setExecutionResult(null);

    // Step animation interval
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1000);

    try {
      const result = await onTriggerAutomation(runnerPrompt, runnerPlatform, !aiEnhanced);
      
      // Delay finish slightly for immersive visuals
      setTimeout(() => {
        clearInterval(stepInterval);
        setCurrentStep(steps.length - 1);
        setExecutionResult(result);
        setIsExecuting(false);
        
        // Add alert to local notification count
      }, 5000);

    } catch (err) {
      clearInterval(stepInterval);
      setIsExecuting(false);
      console.error(err);
    }
  };

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setRunnerPlatform(tpl.platform);
    setRunnerPrompt(tpl.prompt);
    setActiveTab("runner");
  };

  const getPlatformDetails = (pId: string) => {
    return SUPPORTED_PLATFORMS.find(p => p.id === pId) || {
      name: pId.toUpperCase(),
      icon: Cpu,
      color: "from-slate-500/20 to-slate-600/20 text-slate-400 border-slate-500/20"
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 font-sans text-[#FAFAFA]" id="integrations-hub">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500/20 to-indigo-600/20 flex items-center justify-center border border-teal-500/30">
              <Workflow className="w-4 h-4 text-teal-400" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight">AI Agent Automation & Integrations</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Dispatch autonomous agents, trigger webhooks, and sync your AI deliverables with Gmail, Google Sheets, WhatsApp, and social channels.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#18181B] border border-[#27272A] p-0.5 rounded-lg text-xs font-mono self-start md:self-center">
          <button
            onClick={() => setActiveTab("runner")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "runner" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"}`}
          >
            Agent Runner
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "connections" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"}`}
          >
            Connectors ({integrations.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === "history" ? "bg-[#27272A] text-white" : "text-[#71717A] hover:text-white"}`}
          >
            Audit History ({automationRuns.length})
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("instagram")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${activeTab === "instagram" ? "bg-pink-600 text-white" : "text-pink-400 hover:text-pink-300"}`}
            >
              <Instagram className="w-3.5 h-3.5 animate-pulse" />
              <span>Instagram Comment-to-DM</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      {activeTab !== "instagram" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RUNNER TAB */}
        {activeTab === "runner" && (
          <div className="lg:col-span-12 space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Left Column: Form Controls */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* Agent Control Panel Card */}
                <div className="border border-[#27272A] bg-[#09090B] rounded-xl p-5 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#18181B] pb-3">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <h3 className="font-semibold text-xs uppercase font-mono tracking-wider text-[#A1A1AA]">Command Dispatch Center</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-[#71717A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                      <span>Agent Online</span>
                    </div>
                  </div>

                  <form onSubmit={handleRunAutomation} className="space-y-4">
                    {/* Choose Target Channel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-[#71717A]">Target Platform</label>
                        <select
                          value={runnerPlatform}
                          onChange={(e) => setRunnerPlatform(e.target.value)}
                          className="w-full text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-2.5 outline-none focus:border-[#3F3F46]"
                          id="runner-platform-select"
                        >
                          {SUPPORTED_PLATFORMS.map((platform) => {
                            const isConnected = integrations.some(i => i.platform === platform.id);
                            return (
                              <option key={platform.id} value={platform.id}>
                                {platform.name} {isConnected ? "🟢 (Connected)" : "⚪ (Sandbox)"}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-[#71717A]">Engine Processing Mode</label>
                        <div className="flex items-center h-10 border border-[#27272A] bg-[#18181B] rounded-lg px-3 justify-between">
                          <span className="text-xs text-[#FAFAFA] flex items-center gap-1.5 font-mono">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            AI-Enhanced Copy
                          </span>
                          <button
                            type="button"
                            onClick={() => setAiEnhanced(!aiEnhanced)}
                            className={`w-9 h-5 rounded-full transition-all relative ${aiEnhanced ? "bg-teal-500" : "bg-[#27272A]"}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${aiEnhanced ? "right-0.5" : "left-0.5"}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Raw Input Instruction */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-[#71717A]">What should the Agent do?</label>
                        <span className="text-[10px] font-mono text-[#52525B]">E.g. send an email, schedule post, update log</span>
                      </div>
                      <textarea
                        value={runnerPrompt}
                        onChange={(e) => setRunnerPrompt(e.target.value)}
                        placeholder="e.g. send an email to Marcus Aurelius welcoming him to our premium executive suite..."
                        className="w-full h-24 text-xs font-mono bg-[#18181B] border border-[#27272A] text-white rounded-lg p-3 outline-none focus:border-[#3F3F46] resize-none"
                        id="runner-prompt-textarea"
                        required
                        disabled={isExecuting}
                      />
                    </div>

                    {/* Submit Dispatch */}
                    <button
                      type="submit"
                      disabled={isExecuting || !runnerPrompt.trim()}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-teal-500 hover:brightness-110 active:scale-[0.98] transition-all text-slate-950 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:pointer-events-none"
                      id="runner-dispatch-btn"
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Routing & Executing Agent Workflow...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>AI Enhance & Dispatch Automation</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Templates Card */}
                <div className="border border-[#27272A] bg-[#09090B] rounded-xl p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-400" />
                      Instant Agent Automation Templates
                    </h4>
                    <p className="text-[11px] text-[#71717A] mt-1">Click a pre-configured automation recipe below to test instantly in Sandbox mode.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {TEMPLATES.map((tpl, i) => {
                      const platform = getPlatformDetails(tpl.platform);
                      const Icon = platform.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleApplyTemplate(tpl)}
                          className="text-left border border-[#18181B] hover:border-[#27272A] bg-[#18181B]/40 hover:bg-[#18181B] p-3 rounded-lg transition-all space-y-1.5 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#FAFAFA] font-sans group-hover:text-teal-400 transition-colors">
                              {tpl.title}
                            </span>
                            <div className={`p-1 rounded bg-[#09090B] border border-[#27272A]`}>
                              <Icon className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                          <p className="text-[10px] text-[#71717A] line-clamp-2 leading-relaxed font-mono">
                            {tpl.prompt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Simulated Live Output/Checkpoints */}
              <div className="xl:col-span-5 space-y-6">
                
                {/* Checkpoint Logs */}
                {isExecuting && (
                  <div className="border border-teal-500/20 bg-teal-500/5 rounded-xl p-5 space-y-4 animate-pulse">
                    <div className="flex items-center space-x-2 text-xs font-mono text-teal-400 font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>LIVE DISPATCH PIPELINE</span>
                    </div>
                    <div className="space-y-3">
                      {steps.map((step, idx) => (
                        <div 
                          key={idx} 
                          className={`text-[11px] font-mono flex items-start gap-2.5 transition-all duration-300 ${
                            idx === currentStep 
                              ? "text-teal-300 font-semibold" 
                              : idx < currentStep 
                                ? "text-[#71717A] line-through opacity-60" 
                                : "text-[#3F3F46]"
                          }`}
                        >
                          {idx < currentStep ? (
                            <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                          ) : idx === currentStep ? (
                            <div className="w-4 h-4 rounded-full border border-teal-400 border-t-transparent animate-spin shrink-0 mt-0.5"></div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#27272A] shrink-0 mt-2 ml-1.5"></div>
                          )}
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulated Channel Render Display (What actually went out) */}
                <div className="border border-[#27272A] bg-[#09090B] rounded-xl p-5 space-y-4 h-full flex flex-col min-h-[350px]">
                  <div className="flex items-center justify-between border-b border-[#18181B] pb-3 shrink-0">
                    <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      Platform Delivery Preview
                    </h3>
                    <span className="text-[10px] font-mono text-[#71717A] bg-[#18181B] border border-[#27272A] px-2 py-0.5 rounded-md">
                      WYSIWYG Mockup
                    </span>
                  </div>

                  {executionResult ? (
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Live Mock Render based on channel */}
                      <div className="space-y-4">
                        
                        {/* GMAIL PREVIEW */}
                        {runnerPlatform === "gmail" && (
                          <div className="border border-[#27272A] bg-[#18181B]/50 rounded-lg overflow-hidden text-xs">
                            <div className="bg-[#18181B] px-4 py-3 border-b border-[#27272A] space-y-1">
                              <div className="flex items-center text-[#71717A] font-mono">
                                <span className="w-14">To:</span>
                                <span className="text-teal-400 font-sans">{executionResult.recipient || "User"}</span>
                              </div>
                              <div className="flex items-center text-[#71717A] font-mono">
                                <span className="w-14">Subject:</span>
                                <span className="text-white font-sans font-semibold">{executionResult.subject || "No Subject"}</span>
                              </div>
                            </div>
                            <div className="p-4 space-y-4 text-[#FAFAFA] font-sans leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                              {executionResult.enhancedMessage}
                            </div>
                          </div>
                        )}

                        {/* WHATSAPP PREVIEW */}
                        {runnerPlatform === "whatsapp" && (
                          <div className="border border-green-500/20 bg-slate-950 rounded-xl overflow-hidden max-w-sm mx-auto shadow-xl">
                            <div className="bg-emerald-900/30 border-b border-green-500/15 p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 font-bold font-mono text-emerald-400 text-xs">WA</div>
                                <div>
                                  <h4 className="text-xs font-semibold text-white">{executionResult.recipient}</h4>
                                  <p className="text-[9px] font-mono text-emerald-400">Business Channel</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-[#18181B]/20 min-h-[150px] flex flex-col justify-end">
                              <div className="bg-emerald-950/60 border border-emerald-500/20 rounded-2xl rounded-tr-none p-3.5 max-w-[85%] self-end shadow-md space-y-2">
                                <p className="text-xs text-[#E4E4E7] leading-relaxed whitespace-pre-wrap font-sans">
                                  {executionResult.enhancedMessage}
                                </p>
                                <span className="text-[8px] font-mono text-emerald-400 block text-right">Delivered • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* INSTAGRAM PREVIEW */}
                        {runnerPlatform === "instagram" && (
                          <div className="border border-[#27272A] bg-slate-950 rounded-xl overflow-hidden max-w-sm mx-auto shadow-xl text-xs font-sans">
                            <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-0.5">
                                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">AK</div>
                                </div>
                                <span className="text-xs font-semibold text-white">ak.ai_corporate</span>
                              </div>
                            </div>
                            
                            {/* Graphic Mock */}
                            <div className="aspect-square bg-gradient-to-br from-indigo-950 via-[#18181B] to-[#09090B] border-b border-[#27272A] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden group">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0,transparent_100%)]"></div>
                              <Sparkles className="w-7 h-7 text-pink-400" />
                              <h4 className="text-sm font-bold font-sans tracking-tight text-white max-w-[80%] uppercase bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">{executionResult.subject}</h4>
                              <p className="text-[10px] text-[#A1A1AA] font-mono">AK.AI Corporate Automation Hub</p>
                            </div>

                            <div className="p-3 space-y-2.5">
                              <div className="flex items-center space-x-3.5 text-white">
                                <button className="hover:text-pink-400">♥</button>
                                <button className="hover:text-pink-400">💬</button>
                                <button className="hover:text-pink-400">✈</button>
                              </div>
                              <p className="text-xs text-zinc-300 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap font-sans">
                                <strong className="text-white mr-1.5">ak.ai_corporate</strong>
                                {executionResult.enhancedMessage}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* GOOGLE SHEETS */}
                        {runnerPlatform === "google_sheets" && (
                          <div className="border border-[#27272A] bg-slate-950 rounded-xl overflow-hidden font-mono text-[10px]">
                            <div className="bg-[#18181B] border-b border-[#27272A] p-2 flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                              <span className="text-[10px] text-emerald-400 font-semibold ml-2">Google Sheets DB Logger</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[#18181B] text-[#71717A] border-b border-[#27272A]">
                                    <th className="p-2 border-r border-[#27272A] w-12 text-center">Row</th>
                                    <th className="p-2 border-r border-[#27272A]">Timestamp</th>
                                    <th className="p-2 border-r border-[#27272A]">Agent Activity Event</th>
                                    <th className="p-2">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-[#27272A] text-zinc-300">
                                    <td className="p-2 border-r border-[#27272A] text-center bg-[#18181B]/50">01</td>
                                    <td className="p-2 border-r border-[#27272A]">Just Now</td>
                                    <td className="p-2 border-r border-[#27272A] font-sans font-medium text-emerald-400">{executionResult.enhancedMessage}</td>
                                    <td className="p-2 text-emerald-400 font-semibold text-center">SUCCESS</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* SLACK / WEBHOOKS */}
                        {(runnerPlatform === "slack" || runnerPlatform === "webhook") && (
                          <div className="border border-purple-500/20 bg-slate-950 rounded-lg p-4 font-mono text-xs text-zinc-300 space-y-3">
                            <div className="flex items-center justify-between border-b border-purple-500/10 pb-2">
                              <span className="text-[#A1A1AA]">ENDPOINT TRACE</span>
                              <span className="text-purple-400">200 OK</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-purple-400 font-bold">payload_json: </span>
                              <pre className="bg-[#18181B] p-2.5 rounded border border-[#27272A] text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-40">
                                {executionResult.enhancedMessage}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Explanation Info Box */}
                        <div className="border border-teal-500/10 bg-teal-500/5 rounded-lg p-3 flex items-start gap-2 text-[11px] font-sans text-teal-300 shrink-0">
                          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block font-mono uppercase tracking-wider text-[10px]">Elena's AI Optimizations</span>
                            <p className="mt-0.5 text-zinc-300 leading-relaxed font-light">{executionResult.explanation}</p>
                          </div>
                        </div>

                      </div>

                      <div className="pt-4 border-t border-[#18181B] flex items-center justify-between text-[11px] font-mono text-[#71717A] shrink-0">
                        <span>Gateway: Complete</span>
                        <span className="text-teal-400">Online API Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#71717A]">
                      <div className="w-11 h-11 rounded-full border border-dashed border-[#27272A] flex items-center justify-center mb-3">
                        <Play className="w-4 h-4 text-[#3F3F46]" />
                      </div>
                      <p className="text-xs font-mono">Awaiting command dispatch...</p>
                      <p className="text-[10px] text-[#52525B] mt-1">Select a recipe or write your instruction, then hit dispatch.</p>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

        {/* CONNECTIONS TAB */}
        {activeTab === "connections" && (
          <div className="lg:col-span-12 space-y-6">
            
            {/* Header / Active listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SUPPORTED_PLATFORMS.map((platform) => {
                const connectedInstances = integrations.filter(i => i.platform === platform.id);
                const Icon = platform.icon;
                
                return (
                  <div 
                    key={platform.id}
                    className="border border-[#27272A] bg-[#09090B] rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${platform.color} flex items-center justify-center border`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        {connectedInstances.length > 0 ? (
                          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded-full">
                            {connectedInstances.length} connected
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#71717A] bg-[#18181B] border border-[#27272A] px-2 py-0.5 rounded-full">
                            sandbox active
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-white">{platform.name}</h4>
                        <p className="text-[11px] text-[#71717A] leading-relaxed font-light">{platform.desc}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#18181B] flex flex-col space-y-2">
                      {connectedInstances.map((inst) => (
                        <div key={inst.id} className="flex items-center justify-between text-xs bg-[#18181B] border border-[#27272A] p-2 rounded-lg">
                          <span className="font-mono text-[10px] text-zinc-300 truncate max-w-[150px]">{inst.connectionName}</span>
                          <button
                            onClick={() => onDeleteIntegration(inst.id)}
                            className="p-1 hover:bg-[#27272A] rounded-md text-rose-500 hover:text-rose-400 transition-colors"
                            title="Remove integration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => handleOpenConnector(platform)}
                        className="w-full mt-1.5 py-2 border border-dashed border-[#27272A] hover:border-[#3F3F46] bg-[#18181B]/35 text-xs font-mono font-medium text-[#A1A1AA] hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Authorize Connection</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* AUDIT HISTORY TAB */}
        {activeTab === "history" && (
          <div className="lg:col-span-12 space-y-6">
            
            <div className="border border-[#27272A] bg-[#09090B] rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#27272A] flex items-center justify-between bg-[#18181B]/40">
                <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                  Agent Action Audit Trail
                </h3>
                <span className="text-[10px] font-mono text-[#71717A]">
                  Double click any run to view raw API transaction logs
                </span>
              </div>

              {automationRuns.length === 0 ? (
                <div className="p-10 text-center text-zinc-500">
                  <Workflow className="w-8 h-8 mx-auto stroke-[1.5] text-zinc-600 mb-3" />
                  <p className="text-xs font-mono">No automation events logged yet.</p>
                  <p className="text-[10px] text-[#52525B] mt-1">Send your first dispatch from the Agent Runner tab!</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#18181B] text-[#71717A] border-b border-[#27272A]">
                        <th className="p-3">Platform</th>
                        <th className="p-3">Raw Prompt / Objective</th>
                        <th className="p-3">Extracted Target</th>
                        <th className="p-3">Dispatch Subject</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {automationRuns.map((run) => {
                        const platDetails = getPlatformDetails(run.platform);
                        const PlatIcon = platDetails.icon;

                        return (
                          <tr 
                            key={run.id}
                            className="border-b border-[#18181B] hover:bg-[#18181B]/30 transition-colors group cursor-pointer"
                            onClick={() => setSelectedHistoryRun(run)}
                          >
                            <td className="p-3 flex items-center gap-2">
                              <div className="p-1.5 rounded bg-[#18181B] border border-[#27272A]">
                                <PlatIcon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="font-semibold text-zinc-300">{run.platform.toUpperCase()}</span>
                            </td>
                            <td className="p-3 max-w-xs truncate text-[#A1A1AA]" title={run.prompt}>
                              {run.prompt}
                            </td>
                            <td className="p-3 font-sans font-medium text-[#FAFAFA]">
                              {run.recipient}
                            </td>
                            <td className="p-3 truncate max-w-xs text-[#FAFAFA]">
                              {run.subject}
                            </td>
                            <td className="p-3 text-zinc-500">
                              {run.createdAt ? new Date(run.createdAt).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : "N/A"}
                            </td>
                            <td className="p-3">
                              {run.status === "completed" ? (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold">
                                  COMPLETED
                                </span>
                              ) : run.status === "failed" ? (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 font-bold">
                                  FAILED
                                </span>
                              ) : (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 font-bold animate-pulse">
                                  RUNNING
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedHistoryRun(run);
                                }}
                                className="px-2 py-1 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] rounded text-[10px] text-zinc-300 flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        </div>
      )}

      {/* INSTAGRAM COMMENT TO DM AUTOMATION DASHBOARD */}
      {activeTab === "instagram" && user && (
        <InstagramCommentToDMDashboard user={user} />
      )}

      {/* CONNECTOR AUTHORIZATION DIALOG MODAL */}
      {showConnectModal && selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="border border-[#27272A] bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-5">
            {/* Close */}
            <button 
              onClick={() => {
                if (!isAuthorizing) {
                  setShowConnectModal(false);
                  setSelectedPlatform(null);
                }
              }}
              className="absolute top-4 right-4 text-[#71717A] hover:text-[#FAFAFA] disabled:opacity-30"
              disabled={isAuthorizing}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5 border-b border-[#18181B] pb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${selectedPlatform.color} flex items-center justify-center border`}>
                {React.createElement(selectedPlatform.icon, { className: "w-4 h-4" })}
              </div>
              <div>
                <h3 className="font-bold text-[#FAFAFA] text-base">Authorize {selectedPlatform.name}</h3>
                <p className="text-[11px] text-[#71717A] font-light">Establishing secure client gateway connection</p>
              </div>
            </div>

            <form onSubmit={handleConnectSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-[#71717A]">Friendly Connection Identifier</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Sales Department Leads Sheet"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-[#FAFAFA] rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none font-mono"
                  disabled={isAuthorizing}
                  id="connection-name-input"
                />
              </div>

              {selectedPlatform.credentialFields.map((field: any) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#71717A]">{field.label}</label>
                  <input 
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={credentials[field.name] || ""}
                    onChange={(e) => setCredentials({ ...credentials, [field.name]: e.target.value })}
                    className="w-full bg-[#18181B] border border-[#27272A] text-[#FAFAFA] rounded-lg p-2.5 text-xs focus:border-[#3F3F46] outline-none font-mono"
                    disabled={isAuthorizing}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isAuthorizing}
                className="w-full py-2.5 rounded-xl bg-teal-500 font-bold text-slate-950 text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg"
                id="connector-auth-btn"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Handshake with Gateway...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Connection Handshake</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT DETAILS MODAL */}
      {selectedHistoryRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="border border-[#27272A] bg-[#09090B] w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setSelectedHistoryRun(null)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3.5 border-b border-[#18181B] pb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500/10 to-indigo-600/10 flex items-center justify-center border border-teal-500/25">
                <Workflow className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Transaction Inspection</h3>
                <p className="text-[11px] text-[#71717A] font-mono">Run ID: {selectedHistoryRun.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-[#18181B] border border-[#27272A] p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#71717A] block">Original Agent Objective</span>
                  <p className="text-xs text-[#FAFAFA] font-mono leading-relaxed">{selectedHistoryRun.prompt}</p>
                </div>

                <div className="bg-[#18181B] border border-[#27272A] p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#71717A] block">AI Optimization Strategy</span>
                  <p className="text-xs text-teal-300 leading-relaxed font-light">{selectedHistoryRun.explanation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-[#18181B] border border-[#27272A] p-3 rounded-lg text-center">
                    <span className="text-[9px] font-mono uppercase text-[#71717A] block">Target Destination</span>
                    <span className="text-xs font-semibold text-[#FAFAFA] truncate block mt-1">{selectedHistoryRun.recipient}</span>
                  </div>
                  <div className="bg-[#18181B] border border-[#27272A] p-3 rounded-lg text-center">
                    <span className="text-[9px] font-mono uppercase text-[#71717A] block">Platform Engine</span>
                    <span className="text-xs font-semibold text-teal-400 block mt-1">{selectedHistoryRun.platform.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="bg-[#18181B] border border-[#27272A] p-3.5 rounded-xl space-y-2 flex-1 flex flex-col">
                  <span className="text-[10px] font-mono uppercase text-[#71717A] block">AI Enhanced Payload Output</span>
                  <div className="text-xs text-[#FAFAFA] whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto flex-1 font-sans pr-1">
                    {selectedHistoryRun.enhancedMessage}
                  </div>
                </div>

                {selectedHistoryRun.responsePayload && (
                  <div className="bg-slate-950 border border-[#27272A] p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#71717A] block">Platform Gateway JSON Response</span>
                    <pre className="text-[9px] font-mono text-zinc-400 overflow-x-auto overflow-y-auto max-h-32 whitespace-pre pr-1">
                      {selectedHistoryRun.responsePayload}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#18181B] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
              <span>Date: {new Date(selectedHistoryRun.createdAt).toLocaleString()}</span>
              <span className="text-teal-400">Verifiably Signed by AK.AI Vault</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
