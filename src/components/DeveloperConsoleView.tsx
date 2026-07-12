import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  setDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile, Project, Task, FileAsset, ActivityLog } from "../types";
import { 
  Shield, 
  Cpu, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Database, 
  FileText, 
  RefreshCw, 
  Edit, 
  Coins, 
  Eye, 
  Search, 
  Check, 
  X,
  Sparkles,
  Ticket,
  Copy,
  Key
} from "lucide-react";

interface DeveloperConsoleViewProps {
  inspectedUid: string | null;
  setInspectedUid: (uid: string | null) => void;
  currentUserUid: string;
}

export default function DeveloperConsoleView({ 
  inspectedUid, 
  setInspectedUid,
  currentUserUid
}: DeveloperConsoleViewProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allFiles, setAllFiles] = useState<FileAsset[]>([]);
  const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);
  
  // Tabs & Key Generator State
  const [activeTab, setActiveTab] = useState<"users" | "keys">("users");
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [genPlan, setGenPlan] = useState<string>("Scale-Up Company");
  const [genCustomCode, setGenCustomCode] = useState<string>("");
  const [genIsDev, setGenIsDev] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Search & Filter state
  const [userSearch, setUserSearch] = useState<string>("");
  const [logSearch, setLogSearch] = useState<string>("");

  // Edit Credits modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newBalance, setNewBalance] = useState<number>(0);
  const [newPlan, setNewPlan] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    totalFiles: 0,
    totalCredits: 0
  });

  // Load all system data
  const loadSystemData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, "users"));
      const loadedUsers: UserProfile[] = [];
      let totalCredits = 0;
      usersSnap.forEach((doc) => {
        const u = { uid: doc.id, ...doc.data() } as UserProfile;
        loadedUsers.push(u);
        totalCredits += u.balance || 0;
      });
      setUsers(loadedUsers);

      // 2. Fetch Projects
      const projectsSnap = await getDocs(collection(db, "projects"));
      const loadedProjects: Project[] = [];
      projectsSnap.forEach((doc) => {
        loadedProjects.push({ id: doc.id, ...doc.data() } as Project);
      });
      setAllProjects(loadedProjects);

      // 3. Fetch Tasks
      const tasksSnap = await getDocs(collection(db, "tasks"));
      const loadedTasks: Task[] = [];
      tasksSnap.forEach((doc) => {
        loadedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      setAllTasks(loadedTasks);

      // 4. Fetch Files
      const filesSnap = await getDocs(collection(db, "files"));
      const loadedFiles: FileAsset[] = [];
      filesSnap.forEach((doc) => {
        loadedFiles.push({ id: doc.id, ...doc.data() } as FileAsset);
      });
      setAllFiles(loadedFiles);

      // 5. Fetch Activity Logs (Limit to last 100 for performance)
      const logsSnap = await getDocs(collection(db, "activity_logs"));
      const loadedLogs: ActivityLog[] = [];
      logsSnap.forEach((doc) => {
        loadedLogs.push({ id: doc.id, ...doc.data() } as ActivityLog);
      });
      // Sort logs by timestamp desc
      loadedLogs.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
      setAllLogs(loadedLogs);

      // 6. Fetch Promo Codes
      const promoSnap = await getDocs(collection(db, "promo_codes"));
      const loadedPromo: any[] = [];
      promoSnap.forEach((docSnap) => {
        loadedPromo.push({ code: docSnap.id, ...docSnap.data() });
      });
      loadedPromo.sort((a, b) => (b.generatedAt || "").localeCompare(a.generatedAt || ""));
      setPromoCodes(loadedPromo);

      setStats({
        totalUsers: loadedUsers.length,
        totalProjects: loadedProjects.length,
        totalTasks: loadedTasks.length,
        totalFiles: loadedFiles.length,
        totalCredits
      });
    } catch (error) {
      console.error("Error loading system developer state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const handleGenerateKey = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setLastGeneratedKey(null);

    try {
      let codeToUse = genCustomCode.trim();
      if (!codeToUse) {
        const prefix = genPlan.toLowerCase().includes("venture") ? "VENTURE" : "SCALEUP";
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        codeToUse = `${prefix}-AK-${randomHex}`;
      } else {
        codeToUse = codeToUse.toUpperCase();
      }

      const codeRef = doc(db, "promo_codes", codeToUse);
      await setDoc(codeRef, {
        code: codeToUse,
        plan: genPlan,
        isDev: genIsDev,
        isUsed: false,
        generatedAt: new Date().toISOString(),
        generatedBy: currentUserUid
      });

      // Log action to activity logs
      await addDoc(collection(db, "activity_logs"), {
        uid: currentUserUid,
        action: "DEV_PROMO_GENERATE",
        details: `Superuser generated a new activation key "${codeToUse}" for the "${genPlan}" plan.`,
        timestamp: new Date().toISOString()
      });

      setLastGeneratedKey(codeToUse);
      setGenCustomCode("");
      setGenIsDev(false);

      await loadSystemData();
    } catch (err: any) {
      console.error("Error generating code:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handle Edit Action
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setNewBalance(user.balance || 0);
    setNewPlan(user.plan || "Free Tier");
  };

  // Save changes to Firestore
  const handleSaveChanges = async () => {
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", editingUser.uid);
      await updateDoc(userRef, {
        balance: Number(newBalance),
        plan: newPlan
      });

      // Log activity
      await addDoc(collection(db, "activity_logs"), {
        uid: currentUserUid,
        action: "DEV_USER_MODIFY",
        details: `Developer modified user ${editingUser.email}: Set Balance to ${Number(newBalance).toLocaleString()} Cr, Set Plan to ${newPlan}.`,
        timestamp: new Date().toISOString()
      });

      // Refresh data
      await loadSystemData();
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user details:", error);
      alert("Failed to update user details.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle user workspace inspection
  const handleInspectUser = (targetUid: string) => {
    if (inspectedUid === targetUid) {
      // Exit inspection
      setInspectedUid(null);
    } else {
      // Enter inspection
      setInspectedUid(targetUid);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uid?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.plan?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = allLogs.filter(log => 
    log.details?.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.uid?.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.projectName?.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="developer-console-view">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            Core System Developer Operator Console
          </h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">
            Superuser privileges unlocked via code <code className="text-rose-400 font-mono">ak.ai82833.9</code>. Live administrative data inspection & cross-workspace delegation.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={loadSystemData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#18181B] border border-[#27272A] rounded-xl hover:bg-[#27272A] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            REFRESH METRICS
          </button>
        </div>
      </div>

      {/* Inspection Mode Alert Banner */}
      {inspectedUid && (
        <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-xs">
              ⚠️
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">ACTIVE WORKSPACE IMPERSONATION SESSION</h4>
              <p className="text-[10px] text-amber-400/80 mt-0.5">
                Currently displaying and modifying workspace state for User UID: <span className="font-mono text-white select-all font-semibold">{inspectedUid}</span>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setInspectedUid(null)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-mono text-[10px] rounded-lg tracking-wider transition-colors shrink-0"
          >
            EXIT INSPECT MODE
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="border border-[#27272A] bg-[#18181B] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-[#71717A] mb-1.5">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{loading ? '...' : stats.totalUsers}</p>
          <span className="text-[9px] text-[#A1A1AA] font-mono mt-1 block">REGISTERED ACCOUNTS</span>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-[#71717A] mb-1.5">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Active Projects</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{loading ? '...' : stats.totalProjects}</p>
          <span className="text-[9px] text-[#A1A1AA] font-mono mt-1 block">CROSS-PLATFORM</span>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-[#71717A] mb-1.5">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Tasks Completed</span>
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{loading ? '...' : stats.totalTasks}</p>
          <span className="text-[9px] text-[#A1A1AA] font-mono mt-1 block">AGENT DELIVERABLES</span>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-[#71717A] mb-1.5">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">Hosted Assets</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{loading ? '...' : stats.totalFiles}</p>
          <span className="text-[9px] text-[#A1A1AA] font-mono mt-1 block">GENERATED FILES</span>
        </div>

        <div className="border border-[#27272A] bg-[#18181B] p-4 rounded-2xl col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#71717A] mb-1.5">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">System Quotas</span>
            <Coins className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{loading ? '...' : stats.totalCredits.toLocaleString()}</p>
          <span className="text-[9px] text-[#A1A1AA] font-mono mt-1 block">TOTAL SYSTEM CREDITS</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272A] gap-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 px-1 transition-all ${
            activeTab === "users"
              ? "border-rose-500 text-rose-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Live Directory & Operations Feed
          </span>
        </button>
        <button
          onClick={() => setActiveTab("keys")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider border-b-2 px-1 transition-all ${
            activeTab === "keys"
              ? "border-rose-500 text-rose-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" />
            Promo & Activation Key Generator
          </span>
        </button>
      </div>

      {activeTab === "users" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: User Directory */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-2xl p-6 xl:col-span-2 flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272A]/40 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-400" />
                  Live User Registry & Identity Management
                </h3>
                <p className="text-[11px] text-[#A1A1AA] font-light mt-0.5">
                  Real-time connection to isolated user collections. Use inspection keys to audit workspace states.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative max-w-xs w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search user profile, plan, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:border-[#71717A] outline-none"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">SYNCHRONIZING USERS INDEX...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs font-mono">
                  No matching system users found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#27272A]/40 text-[#71717A] font-mono text-[10px] uppercase">
                      <th className="pb-3 font-medium">User Profile / UID</th>
                      <th className="pb-3 font-medium">Subscription Plan</th>
                      <th className="pb-3 font-medium">Credit Balance</th>
                      <th className="pb-3 font-medium text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]/30">
                    {filteredUsers.map((user) => {
                      const isCurrentUser = user.uid === currentUserUid;
                      const isCurrentlyInspecting = inspectedUid === user.uid;

                      return (
                        <tr key={user.uid} className={`hover:bg-[#1f1f23]/40 transition-colors ${isCurrentlyInspecting ? 'bg-amber-500/5' : ''}`}>
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-rose-950 flex items-center justify-center text-rose-300 font-bold border border-rose-500/10 shrink-0">
                                {user.displayName?.slice(0, 2).toUpperCase() || "VIP"}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                                  {user.displayName || "Unknown Founder"}
                                  {isCurrentUser && (
                                    <span className="text-[8px] font-mono text-rose-400 bg-rose-500/5 border border-rose-500/20 px-1 py-0.2 rounded">YOU</span>
                                  )}
                                  {user.isDev && (
                                    <span className="text-[8px] font-mono text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 px-1 py-0.2 rounded">DEV CODE</span>
                                  )}
                                </span>
                                <span className="text-[10px] text-[#A1A1AA] font-mono select-all mt-0.5">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                              user.plan?.toLowerCase().includes("venture") 
                                ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-400 font-bold"
                                : user.plan?.toLowerCase().includes("scale")
                                ? "bg-blue-500/5 border-blue-500/20 text-blue-400"
                                : "bg-[#09090B] border-[#27272A] text-slate-400"
                            }`}>
                              {user.plan || "Free Tier"}
                            </span>
                          </td>
                          <td className="py-3.5 pr-2 font-mono text-slate-300">
                            {user.plan?.toLowerCase().includes("venture") ? (
                              <span className="text-indigo-400 font-bold">Unlimited</span>
                            ) : (
                              <span className="font-bold text-slate-200">{(user.balance ?? 0).toLocaleString()} <span className="text-[9px] text-slate-500 font-light">Cr</span></span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit state button */}
                              <button 
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#27272A] border border-[#27272A] rounded-lg transition-colors"
                                title="Modify Quotas / Balance"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Inspection Toggle Button */}
                              <button 
                                onClick={() => handleInspectUser(user.uid)}
                                className={`px-2.5 py-1.5 border font-mono text-[9px] rounded-lg tracking-wide flex items-center gap-1 transition-all ${
                                  isCurrentlyInspecting
                                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-amber-500/40"
                                    : "text-slate-300 hover:text-white hover:bg-[#27272A] border-[#27272A]"
                                }`}
                                title={isCurrentlyInspecting ? "Currently Inspecting" : "Inspect Workspace"}
                              >
                                <Eye className="w-3 h-3" />
                                {isCurrentlyInspecting ? "INSPECTING" : "INSPECT"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column: Global Activity Log Stream */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-2xl p-6 flex flex-col space-y-4">
            <div className="border-b border-[#27272A]/40 pb-4 space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-rose-400" />
                  Global Live Operations Feed
                </h3>
                <p className="text-[11px] text-[#A1A1AA] font-light mt-0.5">
                  Chronological ledger of tasks, updates, and corporate transactions.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search live actions, logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:border-[#71717A] outline-none"
                />
              </div>
            </div>

            {/* Logs Feed container */}
            <div className="overflow-y-auto max-h-[400px] xl:max-h-[500px] space-y-3 scrollbar-thin pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-[10px]">
                  No operations logs found matching search.
                </div>
              ) : (
                filteredLogs.slice(0, 50).map((log) => {
                  const isAuthUpgrade = log.action?.includes("UPGRADE");
                  const isCreditsDeduction = log.action?.includes("DEDUCTION");
                  
                  return (
                    <div 
                      key={log.id} 
                      className={`p-3 border rounded-xl text-[11px] space-y-1.5 transition-all bg-[#09090B] ${
                        isAuthUpgrade 
                          ? 'border-indigo-500/25 bg-indigo-500/2' 
                          : isCreditsDeduction 
                          ? 'border-rose-500/20 bg-rose-500/2'
                          : 'border-[#27272A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold border uppercase ${
                          isAuthUpgrade 
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                            : isCreditsDeduction 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-[9px] text-[#71717A] font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-normal font-light">
                        {log.details}
                      </p>

                      <div className="flex items-center justify-between text-[9px] font-mono text-[#71717A] border-t border-[#27272A]/40 pt-1.5">
                        <span className="truncate max-w-[120px]" title={`User: ${log.uid}`}>UID: {log.uid.slice(0, 8)}...</span>
                        {log.projectName && (
                          <span className="text-slate-400">Project: {log.projectName}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          {/* Key Generator Form */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-2xl p-6 flex flex-col space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-rose-400" />
                Generate Activation Keys
              </h3>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                Create new subscription and quota voucher codes for distribution.
              </p>
            </div>

            <div className="space-y-4 text-xs pt-2">
              {/* Select Target Plan */}
              <div className="space-y-1.5">
                <label className="text-[#71717A] font-mono uppercase text-[9px]">Target Subscription Plan</label>
                <select 
                  value={genPlan}
                  onChange={(e) => setGenPlan(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] text-slate-200 rounded-lg p-2.5 outline-none focus:border-[#71717A] font-sans"
                >
                  <option value="Scale-Up Company">Scale-Up Company ($5,000,000 Credits)</option>
                  <option value="Venture Corporate">Venture Corporate (Unlimited Credits)</option>
                </select>
              </div>

              {/* Toggle Developer Console access */}
              <div className="flex items-center justify-between p-3 bg-[#09090B] border border-[#27272A] rounded-lg">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-slate-200">Include Superuser Privileges</span>
                  <span className="text-[9px] text-[#71717A]">Unlocks the developer console upon redemption</span>
                </div>
                <input 
                  type="checkbox"
                  checked={genIsDev}
                  onChange={(e) => setGenIsDev(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              {/* Custom Promo Code (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[#71717A] font-mono uppercase text-[9px]">Custom Code / Key Value (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. VIP-SCALE-UP-2026 (Leave empty to auto-generate)"
                  value={genCustomCode}
                  onChange={(e) => setGenCustomCode(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] text-slate-200 rounded-lg p-2.5 outline-none focus:border-[#71717A] font-mono uppercase"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleGenerateKey}
                disabled={isGenerating}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    GENERATE ACTIVATION KEY
                  </>
                )}
              </button>

              {/* Last Generated Code Banner */}
              {lastGeneratedKey && (
                <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">KEY GENERATED SUCCESSFULLY</span>
                    <span className="text-[9px] text-slate-500 font-mono">100% UNUSED</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#09090B] border border-[#27272A] px-3 py-2 rounded-lg mt-1">
                    <span className="font-mono text-white font-extrabold select-all tracking-wider text-sm">{lastGeneratedKey}</span>
                    <button 
                      onClick={() => handleCopyCode(lastGeneratedKey)}
                      className="p-1 text-[#71717A] hover:text-white transition-colors"
                      title="Copy Key to Clipboard"
                    >
                      {copiedCode === lastGeneratedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#A1A1AA] leading-normal font-light">
                    Share this activation code with founders. Redeeming this on the Billing view instantly upgrades their account!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Key Log / Inventory Ledger Table */}
          <div className="border border-[#27272A] bg-[#18181B] rounded-2xl p-6 xl:col-span-2 flex flex-col space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Activation Key Inventory & Ledger
              </h3>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                Interactive register of active and redeemed voucher keys in Firestore database.
              </p>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              {promoCodes.length === 0 ? (
                <div className="text-center py-24 text-slate-500 font-mono text-xs">
                  No generated keys present in system ledger. Use the generator on the left to spawn codes.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#27272A]/40 text-[#71717A] font-mono text-[10px] uppercase">
                      <th className="pb-3 font-medium">Activation Code</th>
                      <th className="pb-3 font-medium">Target Plan Tier</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 font-medium">Redeemed By</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]/30">
                    {promoCodes.map((item) => {
                      const redeemer = users.find(u => u.uid === item.usedBy);
                      return (
                        <tr key={item.code} className="hover:bg-[#1f1f23]/40 transition-colors">
                          <td className="py-3 font-mono font-bold text-slate-100 tracking-wider">
                            {item.code}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                              item.plan?.toLowerCase().includes("venture") 
                                ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-400 font-semibold"
                                : "bg-blue-500/5 border-blue-500/20 text-blue-400"
                            }`}>
                              {item.plan}
                              {item.isDev && <span className="text-[7px] text-rose-400 font-bold bg-rose-500/10 px-1 border border-rose-500/20 rounded ml-1">DEV</span>}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono ${
                              item.isUsed 
                                ? "bg-[#09090B] border border-[#27272A] text-[#71717A]" 
                                : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold"
                            }`}>
                              {item.isUsed ? "REDEEMED" : "ACTIVE"}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[10px] text-[#A1A1AA] max-w-[150px] truncate">
                            {item.isUsed ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-300">{redeemer?.displayName || "Founder"}</span>
                                <span className="text-[9px] text-[#71717A]">{redeemer?.email || item.usedBy}</span>
                              </div>
                            ) : (
                              <span className="text-[#71717A] italic">—</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleCopyCode(item.code)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#27272A] border border-[#27272A] rounded-lg transition-colors inline-flex items-center justify-center"
                              title="Copy Code"
                            >
                              {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="border border-rose-500/25 bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[8px] font-mono text-rose-400 bg-rose-500/5 px-2 py-0.5 border border-rose-500/15 rounded-md">
                <Shield className="w-2.5 h-2.5" /> SYSTEM ADMINISTRATOR
              </span>
              <h3 className="font-bold text-base text-white tracking-tight mt-1">
                Edit Subscription & Quotas
              </h3>
              <p className="text-[11px] text-[#A1A1AA] font-light">
                Manually overriding account records for <span className="font-bold text-slate-300">{editingUser.displayName || "VIP Founder"}</span>.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* User Email View */}
              <div className="space-y-1">
                <label className="text-[#71717A] font-mono uppercase text-[9px]">Account Email Address</label>
                <div className="w-full bg-[#18181B] border border-[#27272A] rounded-lg p-2.5 text-slate-300 font-mono select-all">
                  {editingUser.email}
                </div>
              </div>

              {/* Edit Subscription Plan Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[#71717A] font-mono uppercase text-[9px]">Subscription Plan Tier</label>
                <select 
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] text-slate-200 rounded-lg p-2.5 outline-none focus:border-[#71717A] font-sans"
                >
                  <option value="Free Tier">Free Tier</option>
                  <option value="Scale-Up Company">Scale-Up Company</option>
                  <option value="Venture Corporate">Venture Corporate</option>
                  <option value="Venture Corporate (Developer)">Venture Corporate (Developer)</option>
                </select>
              </div>

              {/* Edit Credits Balance Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[#71717A] font-mono uppercase text-[9px]">Execution Credit Balance</label>
                  <span className="text-[9px] text-[#71717A] font-mono">Current: {(editingUser.balance ?? 0).toLocaleString()} Cr</span>
                </div>
                <input 
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(Number(e.target.value))}
                  className="w-full bg-[#18181B] border border-[#27272A] text-slate-200 rounded-lg p-2.5 outline-none focus:border-[#71717A] font-mono"
                />
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#27272A]/40 mt-6">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 border border-[#27272A] bg-transparent text-[#A1A1AA] hover:text-white rounded-xl transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  {isUpdating ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Overrides
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
