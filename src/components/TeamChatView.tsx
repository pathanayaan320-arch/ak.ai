import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Users, 
  Bot, 
  Sparkles, 
  Plus, 
  X, 
  ArrowRight, 
  Copy, 
  Check, 
  Play, 
  CheckCircle,
  FolderPlus,
  HelpCircle,
  Volume2
} from "lucide-react";
import { Employee, MemoryItem } from "../types";

interface TeamChatViewProps {
  employees: Employee[];
  memories: MemoryItem[];
  onTriggerIntegration: (title: string, content: string, platform: string) => void;
  onAddDeliverableToFileSystem: (name: string, content: string, type: 'code' | 'design' | 'text' | 'report') => void;
  onCreateCollaborationProject?: (
    prompt: string,
    selectedAgents: Employee[],
    results: { agentId: string; agentName: string; reply: string }[]
  ) => Promise<any>;
}

interface CollaborationStep {
  agent: Employee;
  status: 'pending' | 'working' | 'completed';
  result?: string;
}

export default function TeamChatView({ 
  employees, 
  memories,
  onTriggerIntegration,
  onAddDeliverableToFileSystem,
  onCreateCollaborationProject
}: TeamChatViewProps) {
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Collaboration outputs
  const [introText, setIntroText] = useState<string | null>(null);
  const [steps, setSteps] = useState<CollaborationStep[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  const toggleAgentSelection = (id: string) => {
    setSelectedAgentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        alert("Maximum of 3 AI employees can be active in a Team Collaboration room simultaneously.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleStartCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgentIds.length < 2) {
      setError("Please select at least 2 AI employees to establish a working team.");
      return;
    }
    if (!userPrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setIntroText(null);
    setSteps([]);

    const selectedAgents = selectedAgentIds.map(id => employees.find(e => e.id === id)!).filter(Boolean);

    // Initial steps setup for UI
    setSteps(selectedAgents.map(agent => ({
      agent,
      status: 'pending'
    })));

    setIntroText(`Elena (CEO): Assembling specialized workspace. Launching multi-agent context with ${selectedAgents.map(a => a.name).join(" and ")}.`);

    try {
      // We will perform the multi-agent execution
      // We do this by calling our endpoint sequentially or executing all at once
      const response = await fetch("/api/team/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt,
          selectedAgents,
          memoryItems: memories
        })
      });

      if (!response.ok) {
        let errMsg = "Failed to execute multi-agent collaboration workspace on backend.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setIntroText(data.intro || `Elena (CEO): Collaboration room successfully synchronized. Resolving team deliverables sequentially...`);

      // Fill steps sequentially in frontend with nice timing delay for realism
      for (let i = 0; i < data.results.length; i++) {
        // Mark current working
        setSteps(prev => prev.map((step, idx) => {
          if (idx === i) return { ...step, status: 'working' };
          return step;
        }));

        // Wait a small artificial delay for visual polish and staggered reading
        await new Promise(r => setTimeout(r, 1800));

        // Set result
        setSteps(prev => prev.map((step, idx) => {
          if (idx === i) {
            return { 
              ...step, 
              status: 'completed', 
              result: data.results[i].reply 
            };
          }
          return step;
        }));
      }

      if (onCreateCollaborationProject) {
        await onCreateCollaborationProject(userPrompt, selectedAgents, data.results);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during collaborative task resolution.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveToFileSystem = (step: CollaborationStep, index: number) => {
    if (!step.result) return;
    const cleanFileName = `${step.agent.name.toLowerCase().replace(/\s+/g, "_")}_output.txt`;
    onAddDeliverableToFileSystem(cleanFileName, step.result, "report");
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 2000);
  };

  const formatMarkdownToText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/### (.*)/g, "$1")
      .replace(/## (.*)/g, "$1")
      .replace(/# (.*)/g, "$1")
      .replace(/`/g, "");
  };

  return (
    <div className="space-y-6" id="team-chat-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          <span>Multi-Agent Collaboration Board</span>
        </h2>
        <p className="text-xs text-[#A1A1AA] font-light mt-1">
          Add 2-3 of your custom-styled AI employees to a single war room. Type your objective, and they will coordinate sequentially, referencing each other's work to compile a unified corporate output.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Agent Selector Panel */}
        <div className="lg:col-span-4 border border-[#27272A] bg-[#18181B] p-5 rounded-2xl space-y-4">
          <span className="text-[10px] text-[#71717A] font-mono block uppercase font-bold tracking-wider">
            1. Assemble Hired Workforce ({selectedAgentIds.length}/3 Selected)
          </span>

          <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
            {employees.length === 0 ? (
              <p className="text-xs text-[#71717A] py-4 text-center">No hired employees found. Please hire employees from the Directory or Marketplace first.</p>
            ) : (
              employees.map((emp) => {
                const isSelected = selectedAgentIds.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => toggleAgentSelection(emp.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected 
                        ? "bg-indigo-500/10 border-indigo-500 text-white" 
                        : "bg-[#09090B] border-[#27272A] hover:border-neutral-500 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        className="w-9 h-9 rounded-lg object-cover border border-[#27272A]" 
                      />
                      <div className="truncate text-xs">
                        <h4 className="font-bold truncate">{emp.name}</h4>
                        <span className="text-[10px] text-[#71717A] truncate block font-mono">{emp.role}</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-indigo-500 bg-indigo-500 text-black" : "border-[#27272A]"
                    }`}>
                      {isSelected && <Plus className="w-3 h-3 text-black stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-lg text-[10px] text-[#71717A] leading-relaxed flex items-start gap-1.5">
            <HelpCircle className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <span>
              <strong>How this works:</strong> First Agent solves the initial task. Subsequent Agents read the prompt plus prior responses, refining the solution from their unique role perspectives.
            </span>
          </div>
        </div>

        {/* Right Side: Chat & Results Console */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Main prompt execution box */}
          <form onSubmit={handleStartCollaboration} className="border border-[#27272A] bg-[#18181B] p-4 rounded-2xl space-y-4">
            <span className="text-[10px] text-[#71717A] font-mono block uppercase font-bold tracking-wider">
              2. Launch Command Briefing
            </span>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <textarea
                required
                rows={2}
                placeholder="Describe your corporate launch objective (e.g., 'We want to launch a cold-email lead gen funnel for SaaS. Elena analyze, Marketing write email template, Sales make follow-up templates.')"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-xs text-white focus:border-neutral-500 outline-none resize-none font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || selectedAgentIds.length < 2}
                className="sm:w-36 py-3 px-4 bg-white text-black hover:bg-neutral-200 disabled:bg-zinc-800 disabled:text-zinc-500 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shrink-0 shadow-sm"
              >
                <Play className="w-4 h-4 text-current fill-current" />
                <span>Run Team</span>
              </button>
            </div>
            {selectedAgentIds.length < 2 && (
              <p className="text-[10px] text-amber-400 font-mono">⚠️ Please select at least 2 hired employees from the left panel to establish a team.</p>
            )}
          </form>

          {/* Results Visualizer Canvas */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-2xl p-5 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#27272A]/60 pb-3">
                <span className="text-[10px] text-[#71717A] font-mono uppercase font-bold tracking-wider block">
                  Active War Room Streams
                </span>
                <div className="flex items-center gap-1.5 bg-[#09090B] px-2.5 py-1 rounded-full border border-[#27272A] text-[9px] text-[#A1A1AA] font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? "bg-indigo-500 animate-ping" : "bg-emerald-400"}`} />
                  <span>{isLoading ? "PROCESS ACTIVE" : "STANDBY"}</span>
                </div>
              </div>

              {/* Visual states */}
              {!introText && !error && steps.length === 0 && (
                <div className="text-center py-20 space-y-3">
                  <Bot className="w-12 h-12 text-[#27272A] mx-auto animate-pulse" />
                  <h4 className="text-xs font-bold text-[#A1A1AA]">Collaborative Stream Terminal</h4>
                  <p className="text-[11px] text-[#71717A] max-w-sm mx-auto leading-relaxed">
                    Assemble your corporate AI workforce, write down your goals, and click **Run Team** to initialize dynamic multi-agent loops.
                  </p>
                </div>
              )}

              {error && (
                <div className="border border-red-500/10 bg-red-500/5 text-red-400 rounded-xl p-4 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Collaborative loop flow timeline */}
              <div className="space-y-5">
                {introText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-[#A1A1AA] font-mono flex items-center gap-2"
                  >
                    <span className="text-indigo-400">⚡</span>
                    <span>{introText}</span>
                  </motion.div>
                )}

                {steps.map((step, idx) => {
                  return (
                    <motion.div 
                      key={step.agent.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-[#27272A] bg-[#09090B] rounded-xl overflow-hidden"
                    >
                      {/* Step Header */}
                      <div className="bg-[#18181B] px-4 py-2.5 border-b border-[#27272A] flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <img 
                            src={step.agent.avatar} 
                            alt={step.agent.name} 
                            className="w-6 h-6 rounded-md object-cover" 
                          />
                          <div className="text-xs">
                            <span className="font-bold text-[#FAFAFA]">{step.agent.name}</span>
                            <span className="text-[9px] text-blue-400 font-mono ml-2">@{step.agent.role}</span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div>
                          {step.status === 'pending' && (
                            <span className="text-[9px] font-mono text-[#71717A]">QUEUEING</span>
                          )}
                          {step.status === 'working' && (
                            <span className="text-[9px] font-mono text-indigo-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                              <span>COMPILING...</span>
                            </span>
                          )}
                          {step.status === 'completed' && (
                            <span className="text-[9px] font-mono text-emerald-400 font-semibold">SUCCESS // DELIVERED</span>
                          )}
                        </div>
                      </div>

                      {/* Step Body */}
                      <div className="p-4 text-xs font-sans leading-relaxed text-zinc-300">
                        {step.status === 'pending' && (
                          <p className="text-[#71717A] italic text-xs font-light">Standby... waiting for previous deliverables context.</p>
                        )}
                        {step.status === 'working' && (
                          <div className="space-y-2">
                            <p className="text-[#A1A1AA] italic text-xs font-light animate-pulse">Reading prior collaboration context and structuring answer under system parameters...</p>
                            <div className="w-full bg-[#18181B] h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 w-1/2 animate-shimmer" />
                            </div>
                          </div>
                        )}
                        {step.status === 'completed' && step.result && (
                          <div className="space-y-4">
                            <p className="whitespace-pre-wrap font-mono text-[11px] text-[#A1A1AA] bg-[#18181B] p-3 rounded-lg border border-[#27272A]/40 leading-relaxed overflow-x-auto">
                              {step.result}
                            </p>

                            {/* Actions panel */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#27272A]/60">
                              <button
                                onClick={() => handleCopyText(step.result || "", idx)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] rounded-lg text-[10px] font-mono text-zinc-300 transition-colors"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Text</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleSaveToFileSystem(step, idx)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] rounded-lg text-[10px] font-mono text-zinc-300 transition-colors"
                              >
                                {savedIndex === idx ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Delivered to Vault!</span>
                                  </>
                                ) : (
                                  <>
                                    <FolderPlus className="w-3.5 h-3.5" />
                                    <span>Save to Files Vault</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => onTriggerIntegration(`Output by ${step.agent.name}`, formatMarkdownToText(step.result || ""), "zapier")}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] rounded-lg text-[10px] font-mono text-zinc-300 transition-colors"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Trigger Webhook</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Note */}
            {introText && (
              <div className="border-t border-[#27272A] pt-4 mt-6 text-center text-[10px] text-[#71717A] font-mono">
                COMPLETED MULTI-AGENT RESOLUTION ROOM • ALL SYSTEM REGISTRIES NORMAL
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
