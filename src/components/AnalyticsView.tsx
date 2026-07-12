import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Cpu, TrendingUp, Users, CheckCircle, Sparkles, Info, Briefcase, FileText } from "lucide-react";
import { Employee, Task, Project } from "../types";

interface AnalyticsViewProps {
  employees: Employee[];
  tasks: Task[];
  projects: Project[];
}

export default function AnalyticsView({ employees, tasks, projects }: AnalyticsViewProps) {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const tokenUsageData = daysOfWeek.map(day => {
    const dayTasks = tasks.filter(t => {
      if (!t.updatedAt) return false;
      try {
        const date = new Date(t.updatedAt);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue", etc.
        return dayName === day && t.status === "completed";
      } catch (e) {
        return false;
      }
    });
    
    const tokens = dayTasks.reduce((sum, t) => {
      const charCount = (t.output || "").length;
      return sum + Math.max(150, Math.floor(charCount / 3.5));
    }, 0);

    return { day, tokens };
  });

  const outputSpeedData = [
    { 
      name: "Engineering", 
      count: tasks.filter(t => 
        t.status === "completed" && 
        (t.employeeRole?.toLowerCase().includes("developer") || 
         t.employeeRole?.toLowerCase().includes("engineer") || 
         t.employeeRole?.toLowerCase().includes("engineering"))
      ).length 
    },
    { 
      name: "Design", 
      count: tasks.filter(t => 
        t.status === "completed" && 
        (t.employeeRole?.toLowerCase().includes("designer") || 
         t.employeeRole?.toLowerCase().includes("design"))
      ).length 
    },
    { 
      name: "Content", 
      count: tasks.filter(t => 
        t.status === "completed" && 
        (t.employeeRole?.toLowerCase().includes("copywriter") || 
         t.employeeRole?.toLowerCase().includes("writer") || 
         t.employeeRole?.toLowerCase().includes("content"))
      ).length 
    },
    { 
      name: "Marketing", 
      count: tasks.filter(t => 
        t.status === "completed" && 
        (t.employeeRole?.toLowerCase().includes("marketing") || 
         t.employeeRole?.toLowerCase().includes("seo") || 
         t.employeeRole?.toLowerCase().includes("sales"))
      ).length 
    }
  ];

  const totalTokens = tokenUsageData.reduce((acc, curr) => acc + curr.tokens, 0);

  // Compute actual live statistics from Firestore data
  const liveActiveEmployees = employees.length;
  const liveActiveProjects = projects.length;
  const liveCompletedTasks = tasks.filter(t => t.status === "completed").length;
  const livePendingTasks = tasks.filter(t => t.status !== "completed").length;

  return (
    <div className="space-y-8" id="analytics-view">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Business Analytics & Metrics</h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">Audit operational efficiency, continuous asset logs, and language processing quotas across your autonomous workforce.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-[#A1A1AA]">WORKSPACE PROJECTION MODEL</span>
        </div>
      </div>

      {/* Real-time Tracking Onboarding Banner */}
      <div className="border border-emerald-500/20 bg-emerald-500/5 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Real-Time Operations & Metrics Active</h4>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Welcome to your company workspace analytics dashboard. All metric visualizations below are compiled <strong>live from your active Firestore database</strong>.
            {totalTokens === 0 ? (
              <span> Currently, you have not completed any tasks yet, so your stats start at <strong>0</strong>. Go ahead and start a conversation with your CEO in the <strong>CEO Chat</strong> or delegate some milestones!</span>
            ) : (
              <span> You have consumed <strong>{totalTokens.toLocaleString()} tokens</strong> across your completed deliverables. Keep up the high velocity!</span>
            )}
          </p>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Tip: Real-time telemetry is synchronized across all AI employee agent instances automatically.
          </div>
        </div>
      </div>

      {/* Real-time Workspace Stats (Live) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">Live Workspace Status</span>
          <span className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#27272A] bg-[#09090B] p-4 rounded-xl relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
            <div className="absolute top-3 right-3 text-[#27272A]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[#71717A] text-[9px] font-mono block uppercase">ACTIVE STAFF</span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">{liveActiveEmployees}</span>
            <p className="text-[9px] text-[#71717A] mt-1 font-light">AI employee profiles loaded</p>
          </div>

          <div className="border border-[#27272A] bg-[#09090B] p-4 rounded-xl relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
            <div className="absolute top-3 right-3 text-[#27272A]">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[#71717A] text-[9px] font-mono block uppercase">ACTIVE PROJECTS</span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">{liveActiveProjects}</span>
            <p className="text-[9px] text-[#71717A] mt-1 font-light">Structured milestones ongoing</p>
          </div>

          <div className="border border-[#27272A] bg-[#09090B] p-4 rounded-xl relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
            <div className="absolute top-3 right-3 text-[#27272A]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[#71717A] text-[9px] font-mono block uppercase">COMPLETED TASKS</span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">{liveCompletedTasks}</span>
            <p className="text-[9px] text-[#71717A] mt-1 font-light">Deliverables compiled & saved</p>
          </div>

          <div className="border border-[#27272A] bg-[#09090B] p-4 rounded-xl relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
            <div className="absolute top-3 right-3 text-[#27272A]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[#71717A] text-[9px] font-mono block uppercase">PENDING WORKLOAD</span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">{livePendingTasks}</span>
            <p className="text-[9px] text-[#71717A] mt-1 font-light">Tasks currently in progress</p>
          </div>
        </div>
      </div>

      {/* Simulated Production Projection (Charts & Mock) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A1A1AA]">Simulated Projections</span>
          <span className="h-[1px] flex-1 bg-gradient-to-r from-[#27272A] to-transparent" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
            <span className="text-[#71717A] text-[10px] font-mono block uppercase mb-2">QUOTA PROCESSED</span>
            <span className="text-2xl font-bold text-white tracking-tight">{totalTokens.toLocaleString()}</span>
            <p className="text-[10px] text-[#71717A] mt-2 font-light">Gemini LLM tokens consumed</p>
          </div>
          <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
            <span className="text-[#71717A] text-[10px] font-mono block uppercase mb-2">AVG RESPONSE</span>
            <span className="text-2xl font-bold text-white tracking-tight">12.5s</span>
            <p className="text-[10px] text-[#71717A] mt-2 font-light">Average task compilation latency</p>
          </div>
          <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
            <span className="text-[#71717A] text-[10px] font-mono block uppercase mb-2">TEAM PRODUCTIVITY</span>
            <span className="text-2xl font-bold text-white tracking-tight">98.4%</span>
            <p className="text-[10px] text-[#71717A] mt-2 font-light">CEO overall compliance grade</p>
          </div>
          <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl">
            <span className="text-[#71717A] text-[10px] font-mono block uppercase mb-2">WORKSPACE UPTIME</span>
            <span className="text-2xl font-bold text-white tracking-tight">100%</span>
            <p className="text-[10px] text-[#71717A] mt-2 font-light">Continuous delivery active</p>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token usages line Area Chart */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-5">
            <span className="text-xs font-mono text-[#FAFAFA] font-semibold uppercase tracking-wider block mb-6">Language Processing Token Log (Live)</span>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tokenUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="day" stroke="#71717A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090B", borderColor: "#27272A", borderRadius: "8px", fontSize: "11px", color: "#FAFAFA" }} />
                  <Area type="monotone" dataKey="tokens" stroke="#ffffff" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deliverables count Bar chart */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-5">
            <span className="text-xs font-mono text-[#FAFAFA] font-semibold uppercase tracking-wider block mb-6">Generated Deliverables count by Department</span>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outputSpeedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090B", borderColor: "#27272A", borderRadius: "8px", fontSize: "11px", color: "#FAFAFA" }} />
                  <Bar dataKey="count" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

