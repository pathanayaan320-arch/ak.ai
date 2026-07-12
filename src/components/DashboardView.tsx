import { motion } from "motion/react";
import { 
  Building2, 
  Layers, 
  Users, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  Cpu,
  Play,
  ArrowRight
} from "lucide-react";
import { Employee, Project, Task, ActivityLog } from "../types";

interface DashboardViewProps {
  profile: any;
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
  logs: ActivityLog[];
  onNavigate: (page: string) => void;
  onSendPrompt: (prompt: string) => void;
}

export default function DashboardView({ 
  profile, 
  employees, 
  projects, 
  tasks, 
  logs, 
  onNavigate,
  onSendPrompt
}: DashboardViewProps) {
  const activeProjectsCount = projects.filter(p => p.status === "active").length;
  const completedProjectsCount = projects.filter(p => p.status === "completed").length;
  const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "failed");
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;

  const quickPrompts = [
    { title: "SaaS Platform", desc: "Build a modern multi-tenant SaaS application with stripe integration", prompt: "I want to build a fully featured SaaS platform for project management with Stripe subscription tiers." },
    { title: "Clothing Brand", desc: "Launch a sustainable luxury apparel line with marketing plans", prompt: "I want to launch a sustainable luxury clothing brand called GreenThread, with complete ad funnels and copywriting." },
    { title: "Mobile App", desc: "Design a Flutter mobile fitness tracking app with database", prompt: "Create a complete mobile fitness tracking app called FitPulse, including UI spec, database schema and login code." },
    { title: "Marketing Campaign", desc: "Promote a local organic tea company on social media", prompt: "Prepare a complete viral launch campaign for my local organic green tea brand with Instagram captions and meta ad copies." }
  ];

  return (
    <div className="space-y-8" id="dashboard-view">
      {/* Welcome Banner */}
      <div className="relative border border-[#27272A] bg-[#18181B] p-8 rounded-2xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider block mb-2">FOUNDER PORTAL</span>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back, {profile?.displayName || "Founder"}.</h2>
          <p className="text-sm text-[#A1A1AA] font-light leading-relaxed mb-6">
            Your AI company is active and standing by. Give instructions directly to your AI CEO to coordinate engineering, design, and marketing agents autonomously.
          </p>
          <button 
            onClick={() => onNavigate("ceo-chat")}
            className="inline-flex items-center space-x-2 bg-white text-black hover:bg-neutral-200 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <span>Convene CEO Briefing</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-3 font-mono">
            <span>ACTIVE PROJECTS</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">{activeProjectsCount}</span>
          <div className="text-[10px] text-[#71717A] mt-2 font-light">
            <span className="text-blue-400 font-semibold">{completedProjectsCount}</span> historical projects delivered
          </div>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-3 font-mono">
            <span>ACTIVE TASKS</span>
            <CheckSquare className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">{activeTasks.length}</span>
          <div className="text-[10px] text-[#71717A] mt-2 font-light">
            <span className="text-purple-400 font-semibold">{completedTasksCount}</span> assets generated successfully
          </div>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-3 font-mono">
            <span>TEAM MEMBERS</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">{employees.length}</span>
          <div className="text-[10px] text-[#71717A] mt-2 font-light">
            <span className="text-indigo-400 font-semibold">{employees.filter(e => e.status === "working").length}</span> agents currently on-duty
          </div>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
          <div className="flex items-center justify-between text-[#71717A] text-xs mb-3 font-mono">
            <span>CREDITS & QUOTA</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {profile?.plan?.toLowerCase().includes("venture") 
              ? "Unlimited" 
              : `${(profile?.balance ?? 50000).toLocaleString()} Cr`}
          </span>
          <div className="text-[10px] text-[#71717A] mt-2 font-light">
            Unlimited enterprise API processing
          </div>
        </div>
      </div>

      {/* Visual Corporate Hierarchy & Delegation Map */}
      <div className="border border-[#27272A] bg-[#18181B] p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-[#27272A]/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Cpu className="w-4 h-4" />
              </span>
              AK.AI Corporate Delegation Hierarchy
            </h3>
            <p className="text-[11px] text-[#A1A1AA] font-light mt-1">
              Live structural view of specialized autonomous agents executing client instructions.
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            REAL-TIME COLLABORATION SYNC
          </div>
        </div>

        {/* Level 1: CEO Node */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="bg-[#09090B] border-2 border-blue-500/40 rounded-xl p-4 shadow-xl max-w-sm w-full text-center relative z-10 hover:border-blue-500 transition-all">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded tracking-widest">
              CHIEF EXECUTIVE
            </div>
            
            <div className="flex items-center justify-center space-x-3 mt-1.5">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Elena CEO" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-[#09090B] rounded-full animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-xs">Elena (AI CEO)</h4>
                <p className="text-[9px] text-slate-400 font-mono">CHIEF STRATEGIST & PLANNER</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#27272A]/60 pt-2.5 text-[9px] font-mono">
              <span className="text-[#71717A]">ACTIVE SYSTEM MODEL:</span>
              <span className="text-blue-400 font-semibold">GEMINI-2.5-FLASH</span>
            </div>
          </div>

          {/* Connection Lines container */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 h-8 w-px border-l-2 border-dashed border-[#27272A]" />
        </div>

        {/* Horizontal Line connector */}
        <div className="relative w-full h-px border-t-2 border-dashed border-[#27272A] mb-8 max-w-4xl mx-auto hidden md:block">
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2.5 h-2.5 bg-[#27272A] rounded-full" />
        </div>

        {/* Level 2: Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
          {employees.map((emp) => {
            // Find if this employee has an active task running live!
            const activeEmpTask = tasks.find(t => t.assignedTo === emp.id && t.status !== "completed" && t.status !== "failed");
            const hasActiveTask = !!activeEmpTask;
            const liveProgress = activeEmpTask?.progress || 0;

            return (
              <div 
                key={emp.id} 
                className={`border bg-[#09090B] p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-md hover:scale-[1.01] transition-all relative ${
                  hasActiveTask 
                    ? "border-blue-500/30 bg-gradient-to-b from-[#09090B] to-blue-500/5 shadow-blue-500/2" 
                    : "border-[#27272A]"
                }`}
              >
                {/* Visual Connector pointing upwards to horizontal line */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 h-4 w-px border-l-2 border-dashed border-[#27272A] hidden md:block" style={{ top: "-16px" }} />

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                      alt={emp.name} 
                      className="w-9 h-9 rounded-full object-cover border border-[#27272A]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-slate-200 text-xs leading-tight">{emp.name}</h4>
                      <span className="text-[9px] text-[#71717A] font-mono uppercase tracking-tight block mt-0.5">{emp.role}</span>
                    </div>
                  </div>

                  {/* On Duty Status Badge */}
                  {hasActiveTask ? (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/20 rounded-md animate-pulse">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      WORKING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-mono text-slate-500 bg-slate-500/5 px-2 py-0.5 border border-slate-500/10 rounded-md">
                      <span className="w-1 h-1 bg-slate-500 rounded-full" />
                      STANDBY
                    </span>
                  )}
                </div>

                <div className="space-y-2 border-t border-[#27272A]/50 pt-2.5">
                  <div className="text-[9px] leading-relaxed text-[#A1A1AA]">
                    <span className="font-semibold text-slate-300">Department:</span> {emp.department}
                  </div>
                  
                  {emp.skills && emp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {emp.skills.slice(0, 3).map((skill, sIdx) => (
                        <span key={sIdx} className="text-[8px] font-mono text-[#71717A] bg-[#18181B] px-1.5 py-0.5 rounded border border-[#27272A]/60">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Task Progress Panel inside card if active */}
                {hasActiveTask ? (
                  <div className="border-t border-blue-500/10 pt-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-blue-400 shrink-0 uppercase tracking-tight">Active Deliverable:</span>
                      <span className="text-white font-bold">{liveProgress}%</span>
                    </div>
                    <p className="text-[9px] text-slate-300 line-clamp-1 font-light italic leading-tight">
                      "{activeEmpTask.title}"
                    </p>
                    <div className="w-full bg-[#18181B] h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                        style={{ width: `${liveProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-[#27272A]/40 pt-2.5 text-[9px] text-[#71717A] font-light leading-snug">
                    <span className="font-semibold text-[#A1A1AA]">Agent Goal:</span> {emp.goal || "Waiting for client instructions to start execution."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Active Project Workflow & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Projects Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-200 text-base tracking-tight">Active Projects Portfolio</h3>
              <button 
                onClick={() => onNavigate("projects")}
                className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] font-mono transition-colors"
              >
                View Portfolio
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 text-[#71717A] text-xs border border-dashed border-[#27272A] rounded-xl">
                No active projects. Use the prompt generator below to launch your first enterprise.
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 2).map((proj) => (
                  <div key={proj.id} className="border border-[#27272A] bg-[#09090B] p-5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm tracking-tight">{proj.name}</h4>
                        <p className="text-[11px] text-[#71717A] mt-1 max-w-md font-light line-clamp-1">{proj.description}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-emerald-400">
                        {proj.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#71717A]">Autonomous delivery speed</span>
                        <span className="text-slate-300 font-semibold">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#18181B] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Start Prompt Launcher */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-6">
            <h3 className="font-bold text-slate-200 text-base tracking-tight mb-2">Launch Quick Ventures</h3>
            <p className="text-xs text-[#A1A1AA] font-light mb-6">Select a pre-designed strategic plan to instantly seed your workspace database and run live AI collaborations.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendPrompt(qp.prompt)}
                  className="border border-[#27272A] bg-[#09090B] p-4 rounded-xl text-left hover:border-blue-500/30 hover:bg-[#27272A]/40 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-200 text-xs group-hover:text-blue-400 transition-colors">{qp.title}</h4>
                    <Play className="w-3 h-3 text-[#71717A] group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-[10px] text-[#71717A] font-light leading-relaxed">{qp.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Logs Feed */}
        <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-200 text-base tracking-tight">Active Company Activity</h3>
              <button 
                onClick={() => onNavigate("logs")}
                className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] font-mono transition-colors"
              >
                Full Logbook
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-16 text-[#71717A] text-xs border border-dashed border-[#27272A] rounded-xl font-light">
                Standby mode. Initialize a project to view chronological log feeds.
              </div>
            ) : (
              <div className="space-y-4">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs border-b border-[#27272A] pb-3">
                    <div className="flex items-center justify-between text-[10px] text-[#71717A] font-mono mb-1.5">
                      <span className="text-slate-300 font-medium">{log.employeeName || "Executive"}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    <span className="font-semibold text-slate-200 block mb-1">{log.action}</span>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed font-light">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#27272A] pt-4 mt-6">
            <div className="flex items-center space-x-2 text-[10px] text-[#71717A] font-mono">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span>LOGBOOK SYNC ACTIVE (SECURE CONTEXT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
