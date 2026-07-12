import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Users, 
  Briefcase, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Database, 
  Bell, 
  Settings, 
  Brain, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  User,
  Sparkles,
  Lock,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Shield,
  UserPlus,
  Workflow
} from "lucide-react";

// Store and views imports
import { useCompanyStore } from "./lib/store";
import LandingPage from "./components/LandingPage";
import DashboardView from "./components/DashboardView";
import CeoChatView from "./components/CeoChatView";
import EmployeesView from "./components/EmployeesView";
import ProjectsView from "./components/ProjectsView";
import TasksView from "./components/TasksView";
import AnalyticsView from "./components/AnalyticsView";
import FilesView from "./components/FilesView";
import ActivityLogsView from "./components/ActivityLogsView";
import NotificationsView from "./components/NotificationsView";
import MemoryView from "./components/MemoryView";
import BillingView from "./components/BillingView";
import SettingsView from "./components/SettingsView";
import DeveloperConsoleView from "./components/DeveloperConsoleView";
import TeamChatView from "./components/TeamChatView";
import IntegrationsView from "./components/IntegrationsView";
import PrivacyPolicyView from "./components/PrivacyPolicyView";
import TermsView from "./components/TermsView";

export default function App() {
  const store = useCompanyStore();
  const {
    user,
    profile,
    loading,
    employees,
    projects,
    tasks,
    chats,
    messages,
    logs,
    files,
    notifications,
    memories,
    integrations,
    automationRuns,
    activeChatId,
    setActiveChatId,
    ceoIsTyping,
    sendCeoInstruction,
    createNewChat,
    startEmployeeChat,
    deleteChatConversation,
    togglePinChatConversation,
    createCustomEmployee,
    deleteEmployee,
    updateEmployee,
    createMemoryItem,
    deleteMemoryItem,
    createFileAsset,
    createCollaborationProject,
    markNotificationAsRead,
    deleteNotification,
    createNotification,
    addIntegration,
    deleteIntegration,
    triggerAutomationAction,
    redeemPromoCode,
    handleSignUp,
    handleSignIn,
    handleDemoSignIn,
    handleGoogleSignIn,
    handleSignOut,
    isDeveloper,
    inspectedUid,
    setInspectedUid
  } = store;

  // Navigation and auth state
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared import states
  const [sharedImportEmployee, setSharedImportEmployee] = useState<any>(null);
  const [showSharedImportModal, setShowSharedImportModal] = useState(false);
  const [sharedImportLoading, setSharedImportLoading] = useState(false);
  const [sharedImportError, setSharedImportError] = useState<string | null>(null);

  // Form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(false);

    const translateError = (errMessage: string) => {
      if (errMessage.includes("auth/admin-restricted-operation") || errMessage.includes("restricted") || errMessage.includes("restricted-operation")) {
        return "Email/Password signups are restricted by default in newly provisioned projects. Please use the pre-configured 'Sign In with Google' or 'One-click Demo Guest Access' below!";
      }
      return errMessage;
    };

    if (authMode === "signup") {
      const result = await handleSignUp(authEmail, authPassword, authName);
      if (result.success) {
        setAuthSuccess(true);
        setShowAuthModal(false);
      } else {
        setAuthError(translateError(result.error || "Sign up failed."));
      }
    } else {
      const result = await handleSignIn(authEmail, authPassword);
      if (result.success) {
        setAuthSuccess(true);
        setShowAuthModal(false);
      } else {
        setAuthError(translateError(result.error || "Sign in failed."));
      }
    }
  };

  const handleGoogleAccess = async () => {
    setAuthError(null);
    const result = await handleGoogleSignIn();
    if (result.success) {
      setShowAuthModal(false);
    } else {
      const err = result.error || "";
      if (err.includes("auth/unauthorized-domain") || err.includes("unauthorized-domain")) {
        setAuthError(
          `UNAUTHORIZED DOMAIN DETECTED\n\n` +
          `Firebase blocks Google Sign-In on this custom URL until it is explicitly whitelisted in your console.\n\n` +
          `👉 HOW TO RESOLVE IN 30 SECONDS:\n` +
          `1. Open Firebase Console: https://console.firebase.google.com\n` +
          `2. Select your Firebase Project.\n` +
          `3. Navigate to Authentication -> Settings tab.\n` +
          `4. Click on "Authorized Domains" (under the domains section).\n` +
          `5. Click "Add Domain" and add these hostnames:\n` +
          `   • ais-dev-y3sqirnqpyh5sc3weanefi-744846676105.asia-east1.run.app\n` +
          `   • ais-pre-y3sqirnqpyh5sc3weanefi-744846676105.asia-east1.run.app\n\n` +
          `💡 IN THE MEANTIME: Click "One-click Demo Guest Access" below to inspect the full premium dashboard immediately without any login!`
        );
      } else if (err.includes("auth/admin-restricted-operation") || err.includes("restricted")) {
        setAuthError("Google Sign-In requires active project authentication. Please try Guest Access if Google Sign-In is restricted, or ensure your config is set up.");
      } else {
        setAuthError(err || "Google sign in failed.");
      }
    }
  };

  const handleDemoAccess = async () => {
    setAuthError(null);
    const result = await handleDemoSignIn();
    if (result.success) {
      setShowAuthModal(false);
    } else {
      setAuthError(result.error || "Demo authentication failed.");
    }
  };

  // Automatic URL parameter loader for shared employee configurations
  useEffect(() => {
    const checkImportParam = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const importId = urlParams.get("importEmployee");
      if (!importId) return;

      // Ensure user is signed in to import
      if (!user) {
        setAuthError("You must be logged in to import a shared AI Employee. Please sign in first.");
        setAuthMode("signin");
        setShowAuthModal(true);
        return;
      }

      setSharedImportLoading(true);
      try {
        const data = await store.fetchPublishedEmployee(importId);
        if (data) {
          setSharedImportEmployee(data);
          setShowSharedImportModal(true);
        } else {
          console.warn("Could not load published employee spec.");
        }
      } catch (err) {
        console.error("Failed to fetch shared employee:", err);
      } finally {
        setSharedImportLoading(false);
      }
    };

    if (user && !loading) {
      checkImportParam();
    }
  }, [user, loading]);

  // Helper to send instant pre-configured prompts
  const handleQuickPrompt = async (promptText: string) => {
    if (!user) {
      setAuthMode("signin");
      setShowAuthModal(true);
      return;
    }
    setCurrentPage("ceo-chat");
    // Ensure active chat exists or create one
    let targetChatId = activeChatId;
    if (!targetChatId) {
      targetChatId = await createNewChat("Active Startup Plan");
    }
    if (targetChatId) {
      sendCeoInstruction(promptText);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Sidebar navigation items list
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Building2 },
    { id: "ceo-chat", label: "CEO Chat", icon: Sparkles, highlight: true },
    { id: "team-chat", label: "Team Collaboration", icon: Users, highlight: true },
    { id: "employees", label: "Employees", icon: Users },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "tasks", label: "Tasks Kanban", icon: CheckSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "files", label: "Files Vault", icon: FileText },
    { id: "integrations", label: "Agent Automation", icon: Workflow },
    { id: "logs", label: "Activity Logs", icon: Database },
    { id: "memory", label: "Super Memory", icon: Brain },
    { id: "billing", label: "Billing Plans", icon: CreditCard },
    ...(isDeveloper ? [{ id: "developer-console", label: "Developer Console", icon: Shield }] : []),
    { id: "settings", label: "Settings", icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center animate-spin">
          <Building2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">LOADING WORKSPACE...</span>
      </div>
    );
  }

  // Render Landing Page if no user authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30">
        {currentPage === "privacy" ? (
          <PrivacyPolicyView onBack={() => setCurrentPage("dashboard")} />
        ) : currentPage === "terms" ? (
          <TermsView onBack={() => setCurrentPage("dashboard")} />
        ) : (
          <LandingPage 
            onGetStarted={() => { setAuthMode("signup"); setShowAuthModal(true); }}
            onLoginClick={() => { setAuthMode("signin"); setShowAuthModal(true); }}
            onNavigate={(page) => setCurrentPage(page)}
          />
        )}

        {/* Unified Authentication dialog Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-slate-900 bg-slate-950 w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden relative"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  </div>
                  <h3 className="font-bold text-xl text-white tracking-tight">
                    {authMode === "signup" ? "Draft Your AI Company" : "Enter Executive Suite"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-light">
                    Every user account is encrypted and isolated with private Firestore rows.
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 text-xs font-mono text-red-400 bg-red-500/5 px-3.5 py-3 border border-red-500/10 rounded-lg whitespace-pre-line text-left leading-relaxed">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-sans">
                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-mono uppercase">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Richard Hendricks" 
                        value={authName} 
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2.5 focus:border-slate-700 outline-none"
                        id="auth-name-input"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-mono uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="richard@piedpiper.com" 
                      value={authEmail} 
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2.5 focus:border-slate-700 outline-none"
                      id="auth-email-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-mono uppercase">Password</label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={authPassword} 
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2.5 focus:border-slate-700 outline-none"
                      id="auth-password-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-teal-500 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs"
                    id="auth-submit-btn"
                  >
                    {authMode === "signup" ? "Confirm Registration" : "Sign In"}
                  </button>
                </form>

                <div className="mt-3">
                  <button 
                    type="button"
                    onClick={handleGoogleAccess}
                    className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl shadow-md active:scale-95 transition-all text-xs flex items-center justify-center gap-2 border border-slate-200"
                    id="google-signin-btn"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-900" /></div>
                  <span className="relative bg-slate-950 px-3.5 text-[10px] text-slate-600 font-mono">OR REVIEW WITHOUT LOGGING IN</span>
                </div>

                {/* One click access */}
                <button 
                  onClick={handleDemoAccess}
                  className="w-full py-3 border border-slate-900 hover:border-slate-800 bg-slate-900/10 text-teal-400 font-bold rounded-xl transition-all text-xs flex items-center justify-center space-x-2"
                  id="auth-demo-btn"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>One-click Demo Guest Access</span>
                </button>

                {/* Toggle auth mode */}
                <div className="mt-6 text-center text-[11px] text-slate-400 font-light">
                  {authMode === "signup" ? (
                    <span>Already drafted your company? <button onClick={() => setAuthMode("signin")} className="text-teal-400 font-semibold hover:underline">Sign In</button></span>
                  ) : (
                    <span>First venture? <button onClick={() => setAuthMode("signup")} className="text-teal-400 font-semibold hover:underline">Draft Now</button></span>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render Post-Login isolated Dashboard Workspace
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans flex overflow-hidden">
      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#09090B] border-r border-[#27272A] flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Brand header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#27272A] shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-white to-neutral-400 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">AK.AI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items list */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {inspectedUid && (
              <div className="mb-4 mx-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
                <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold font-mono">Impersonation Session</div>
                <div className="text-[10px] text-slate-300 font-light truncate">UID: {inspectedUid.slice(0, 10)}...</div>
                <button 
                  onClick={() => setInspectedUid(null)}
                  className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold font-mono text-[9px] rounded transition-colors"
                >
                  Exit Inspection
                </button>
              </div>
            )}
            <div className="text-[10px] uppercase tracking-widest text-[#71717A] font-semibold mb-4 ml-2">Enterprise Workspace</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium tracking-wide transition-colors cursor-pointer rounded-md ${isActive ? "bg-[#27272A] text-white" : "text-[#A1A1AA] hover:bg-[#18181B] hover:text-white"}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#71717A]"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.id === "ceo-chat" && ceoIsTyping && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Credits Counter directly under workspace navigation */}
            <div className="pt-5 mt-5 border-t border-[#27272A]/55 px-2">
              <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-mono font-bold block">Enterprise Balance</span>
              <div className="flex items-center justify-between mt-2 bg-[#18181B] px-3 py-2.5 rounded-lg border border-[#27272A] shadow-sm">
                <span className="text-xs font-mono font-bold text-white">
                  {profile?.plan?.toLowerCase().includes("venture") ? "Unlimited" : `${profile?.balance?.toLocaleString() ?? "0"} Cr`}
                </span>
                <span className="text-[9px] text-[#A1A1AA] font-mono uppercase bg-[#09090B] px-2 py-0.5 rounded border border-[#27272A] font-semibold shrink-0">
                  {profile?.plan?.toLowerCase().includes("venture") ? "Venture Plan" : (profile?.plan || "Free Plan")}
                </span>
              </div>
            </div>
          </nav>
        </div>

        {/* User profile details & Sign Out trigger */}
        <div className="p-4 border-t border-[#27272A] bg-[#09090B] shrink-0 space-y-4">
          <div className="flex justify-center space-x-3 text-[10px] text-[#71717A] font-light pb-2 border-b border-[#27272A]/30">
            <button onClick={() => { setCurrentPage("privacy"); setSidebarOpen(false); }} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none">Privacy Policy</button>
            <span className="text-[#27272A]">•</span>
            <button onClick={() => { setCurrentPage("terms"); setSidebarOpen(false); }} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none">Terms of Service</button>
          </div>

          <div className="flex items-center gap-3 p-2 bg-[#18181B] rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {profile?.displayName?.slice(0, 2).toUpperCase() || "VIP"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#FAFAFA] truncate">{profile?.displayName || "VIP Founder"}</span>
              <span className="text-[10px] text-[#71717A] truncate">{profile?.email || "founder@example.com"}</span>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full inline-flex items-center justify-center space-x-2 p-2 rounded-lg text-xs font-medium bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors border border-[#27272A]"
            id="signout-btn-sidebar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header bar */}
        <header className="h-16 border-b border-[#27272A] flex items-center justify-between px-8 bg-[#09090B]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-white border border-[#27272A] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[#71717A] text-sm font-light">Workspace /</span>
              <span className="text-sm font-medium text-white">{currentPage.toUpperCase().replace("-", " ")}</span>
            </div>
          </div>

          {/* Quick actions header */}
          <div className="flex items-center space-x-4">
            {/* Quick telemetry secure indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-[#18181B] px-3 py-1.5 rounded-full border border-[#27272A]">
              <span className="text-[10px] font-bold text-emerald-400">● LIVE OPS</span>
              <span className="text-xs text-[#A1A1AA]">Secure TLS Session</span>
            </div>

            {/* Notification triggers */}
            <button 
              onClick={() => setCurrentPage("notifications")}
              className="p-2 border border-[#27272A] rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#18181B] hover:bg-[#27272A] transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Central Workspace view renderer */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentPage === "dashboard" && (
                <DashboardView 
                  profile={profile}
                  employees={employees}
                  projects={projects}
                  tasks={tasks}
                  logs={logs}
                  onNavigate={setCurrentPage}
                  onSendPrompt={handleQuickPrompt}
                />
              )}

              {currentPage === "ceo-chat" && (
                <CeoChatView 
                  chats={chats}
                  messages={messages}
                  employees={employees}
                  tasks={tasks}
                  activeChatId={activeChatId}
                  ceoIsTyping={ceoIsTyping}
                  onSelectChat={setActiveChatId}
                  onNewChat={createNewChat}
                  onDeleteChat={deleteChatConversation}
                  onTogglePin={togglePinChatConversation}
                  onSendMessage={sendCeoInstruction}
                  onStartEmployeeChat={startEmployeeChat}
                />
              )}

              {currentPage === "team-chat" && (
                <TeamChatView 
                  employees={employees}
                  memories={memories}
                  onTriggerIntegration={async (title, content, platform) => {
                    await createNotification(
                      "Webhook Triggered",
                      `Successfully routed deliverable ("${title}") via ${platform.toUpperCase()} integration!`,
                      "success"
                    );
                  }}
                  onAddDeliverableToFileSystem={createFileAsset}
                  onCreateCollaborationProject={createCollaborationProject}
                />
              )}

              {currentPage === "employees" && (
                <EmployeesView 
                  profile={profile}
                  employees={employees}
                  onCreateCustomEmployee={createCustomEmployee}
                  onDeleteEmployee={deleteEmployee}
                  onUpdateEmployee={updateEmployee}
                  publishEmployee={store.publishEmployee}
                  fetchPublishedEmployee={store.fetchPublishedEmployee}
                />
              )}

              {currentPage === "projects" && (
                <ProjectsView 
                  projects={projects}
                  files={files}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === "tasks" && (
                <TasksView 
                  tasks={tasks}
                />
              )}

              {currentPage === "analytics" && (
                <AnalyticsView 
                  employees={employees}
                  tasks={tasks}
                  projects={projects}
                />
              )}

              {currentPage === "files" && (
                <FilesView 
                  files={files}
                />
              )}

              {currentPage === "logs" && (
                <ActivityLogsView 
                  logs={logs}
                />
              )}

              {currentPage === "notifications" && (
                <NotificationsView 
                  notifications={notifications}
                  onMarkAsRead={markNotificationAsRead}
                  onDeleteNotification={deleteNotification}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === "memory" && (
                <MemoryView 
                  memories={memories}
                  onCreateMemory={createMemoryItem}
                  onDeleteMemory={deleteMemoryItem}
                />
              )}

              {currentPage === "integrations" && (
                <IntegrationsView 
                  integrations={integrations}
                  automationRuns={automationRuns}
                  onAddIntegration={addIntegration}
                  onDeleteIntegration={deleteIntegration}
                  onTriggerAutomation={triggerAutomationAction}
                  user={user}
                />
              )}

              {currentPage === "billing" && (
                <BillingView 
                  profile={profile}
                  onNavigate={setCurrentPage}
                  onRedeemPromoCode={redeemPromoCode}
                />
              )}

              {currentPage === "settings" && (
                <SettingsView 
                  profile={profile}
                />
              )}

              {currentPage === "privacy" && (
                <PrivacyPolicyView onBack={() => setCurrentPage("settings")} />
              )}

              {currentPage === "terms" && (
                <TermsView onBack={() => setCurrentPage("settings")} />
              )}

              {currentPage === "developer-console" && isDeveloper && user && (
                <DeveloperConsoleView 
                  inspectedUid={inspectedUid}
                  setInspectedUid={setInspectedUid}
                  currentUserUid={user.uid}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Share Link Auto Import Modal */}
      <AnimatePresence>
        {showSharedImportModal && sharedImportEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[#27272A] bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-[#FAFAFA] text-base">New AI Employee Shared!</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowSharedImportModal(false);
                    setSharedImportEmployee(null);
                    // Clear the query parameter
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }} 
                  className="text-[#71717A] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={sharedImportEmployee.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                    alt={sharedImportEmployee.name} 
                    className="w-14 h-14 rounded-xl object-cover border border-[#27272A]" 
                  />
                  <div>
                    <h4 className="font-bold text-white text-lg leading-tight">{sharedImportEmployee.name}</h4>
                    <span className="text-xs text-blue-400 font-mono block mt-0.5">{sharedImportEmployee.role}</span>
                  </div>
                </div>

                <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl space-y-2.5">
                  <div>
                    <span className="text-[10px] text-[#71717A] font-mono block uppercase">Division Department</span>
                    <span className="text-xs text-zinc-200 block mt-0.5">{sharedImportEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] font-mono block uppercase">Core Goal</span>
                    <span className="text-xs text-zinc-300 block mt-0.5 font-light leading-relaxed">{sharedImportEmployee.goal}</span>
                  </div>
                  {sharedImportEmployee.skills && sharedImportEmployee.skills.length > 0 && (
                    <div>
                      <span className="text-[10px] text-[#71717A] font-mono block uppercase">Skills</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {sharedImportEmployee.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="text-[9px] font-mono bg-[#09090B] border border-[#27272A] text-[#A1A1AA] px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cost/Price indicator */}
                <div className="bg-[#18181B] border border-[#27272A] p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-[#71717A] uppercase text-[9px]">Import Hiring Cost</span>
                  <span className={`font-bold ${employees.length < 4 ? "text-teal-400" : "text-amber-400"}`}>
                    {employees.length < 4 ? "0 Credits (Free Slot)" : "6,000 Credits"}
                  </span>
                </div>

                {sharedImportError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-relaxed font-sans">
                    {sharedImportError}
                  </div>
                )}

                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Would you like to hire this AI employee into your corporate directory workspace? Once added, they will be available to complete tasks and respond to CEO commands.
                </p>

                <div className="flex items-center space-x-2.5">
                  <button 
                    onClick={() => {
                      setShowSharedImportModal(false);
                      setSharedImportEmployee(null);
                      setSharedImportError(null);
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                    className="flex-1 py-2.5 bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      setSharedImportError(null);
                      const res = await createCustomEmployee({
                        name: sharedImportEmployee.name,
                        role: sharedImportEmployee.role,
                        avatar: sharedImportEmployee.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
                        department: sharedImportEmployee.department || "Engineering",
                        goal: sharedImportEmployee.goal,
                        skills: sharedImportEmployee.skills || [],
                        systemPrompt: sharedImportEmployee.systemPrompt,
                        model: sharedImportEmployee.model || "gemini-2.5-flash",
                        temperature: sharedImportEmployee.temperature ?? 0.2,
                        description: sharedImportEmployee.description || `${sharedImportEmployee.role} within the ${sharedImportEmployee.department} division.`,
                      }, false); // false = custom employee rate

                      if (res && res.success === false) {
                        setSharedImportError(res.error || "Failed to hire shared employee.");
                      } else {
                        setShowSharedImportModal(false);
                        setSharedImportEmployee(null);
                        setSharedImportError(null);
                        // Navigate to employees view to see the newly added employee
                        setCurrentPage("employees");
                        // Clear the URL query parameters cleanly
                        window.history.replaceState({}, document.title, window.location.pathname);
                      }
                    }}
                    className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Confirm Hire Contract
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
