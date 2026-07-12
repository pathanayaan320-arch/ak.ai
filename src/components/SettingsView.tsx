import { useState } from "react";
import { Shield, Sparkles, Building2, Check, Key, Copy, CheckCircle2 } from "lucide-react";

interface SettingsViewProps {
  profile: any;
}

export default function SettingsView({ profile }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••");
  const [name, setName] = useState(profile?.displayName || "VIP Founder");
  const [email, setEmail] = useState(profile?.email || "founder@example.com");
  const [copied, setCopied] = useState(false);

  const MASTER_PROMPT = `# AK.AI Master Application Replication Blueprint
Create a premium, full-stack Virtual Company Simulation & Workflow Automation suite named "AK.AI" using React, Vite, Tailwind CSS, TypeScript, and Firebase.

## Technical Requirements:
1. **Frontend**: Inter sans-serif typeface, JetBrains Mono font for logs, dark slate theme, Framer Motion transitions.
2. **Backend**: Express server, CJS bundle via esbuild, Gemini 3.5 API integration using @google/genai.
3. **Database**: Real-time Firestore sync with strict owner-based security rules.
4. **Features**: CEO Command Terminal, AI Team Chat, Employee Editor, Super Memory, Kanban Kanban Board, and a full Automation dispatch pipeline (Gmail, Sheets, WhatsApp, Webhooks) with live audit trails and side-by-side previews.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl" id="settings-view">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Workspace Settings</h2>
        <p className="text-xs text-[#A1A1AA] font-light mt-1">Configure workspace parameters, keys, and security permissions for your company.</p>
      </div>

      <div className="border border-[#27272A] bg-[#18181B] p-6 rounded-xl space-y-6 text-xs font-sans">
        {/* User profile details */}
        <div className="space-y-4">
          <span className="text-[10px] text-[#71717A] font-mono block uppercase">FOUNDER PROFILE</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#71717A] font-mono uppercase">DisplayName</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] text-white rounded-lg p-2.5 focus:border-neutral-500 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[#71717A] font-mono uppercase">Email Address</label>
              <input 
                type="email" 
                disabled
                value={email} 
                className="w-full bg-[#09090B]/50 border border-[#27272A] text-[#71717A] rounded-lg p-2.5 outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* API keys configuration */}
        <div className="space-y-4 border-t border-[#27272A]/60 pt-6">
          <span className="text-[10px] text-[#71717A] font-mono block uppercase">API CREDS GATEWAYS</span>
          
          <div className="space-y-1.5">
            <label className="text-[#71717A] font-mono uppercase flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-white" />
              <span>Personal Gemini API Key (Optional)</span>
            </label>
            <input 
              type="password" 
              placeholder="API key provided by default"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] text-white rounded-lg p-2.5 focus:border-neutral-500 outline-none font-mono transition-colors"
            />
            <p className="text-[9px] text-[#71717A] font-light mt-1.5">
              Leave empty to default to the platform's standard processing key.
            </p>
          </div>
        </div>

        {/* Replication Center */}
        <div className="space-y-4 border-t border-[#27272A]/60 pt-6">
          <span className="text-[10px] text-teal-400 font-mono block uppercase tracking-wider">Vibe Coding Replication Center</span>
          
          <div className="border border-teal-500/10 bg-teal-500/5 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Master Replication Blueprint
                </h4>
                <p className="text-[10px] text-[#A1A1AA] font-light mt-0.5 leading-relaxed">
                  Export the exact system context of AK.AI. Paste this prompt into any AI coder to clone this entire app with identical features and aesthetics!
                </p>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="px-3 py-1.5 bg-[#09090B] border border-teal-500/20 hover:border-teal-500/40 text-[10px] font-mono text-teal-300 hover:text-white rounded-md flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950/70 border border-[#27272A] rounded p-2.5 font-mono text-[9px] text-zinc-400 max-h-24 overflow-y-auto leading-relaxed whitespace-pre">
              {MASTER_PROMPT}
            </div>
            
            <p className="text-[8px] text-[#71717A] font-light italic">
              *Full blueprint documentation has also been exported to <code className="text-teal-400 bg-slate-950 px-1 py-0.5 rounded">/REPLICATION_PROMPT.md</code> in your workspace root.
            </p>
          </div>
        </div>

        {/* Security indicators */}
        <div className="border-t border-[#27272A]/60 pt-6 flex items-center space-x-2 text-[10px] text-[#71717A] font-mono">
          <Shield className="w-4 h-4 text-white" />
          <span>ROW LEVEL SECURITY (RLS) FOR FIRESTORE IS ACTIVATED</span>
        </div>
      </div>
    </div>
  );
}
