import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Briefcase, 
  Award, 
  Cpu, 
  Check, 
  HelpCircle,
  X,
  UserPlus,
  Download,
  Upload,
  Globe,
  Link2,
  Copy,
  Share2
} from "lucide-react";
import { Employee } from "../types";

interface EmployeesViewProps {
  profile: any;
  employees: Employee[];
  onCreateCustomEmployee: (data: any, isTemplate?: boolean) => Promise<{ success: boolean; error?: string } | any>;
  onDeleteEmployee: (id: string) => void;
  onUpdateEmployee: (id: string, data: any) => void;
  publishEmployee: (emp: Employee) => Promise<string | null>;
  fetchPublishedEmployee: (id: string) => Promise<any>;
}

export default function EmployeesView({
  profile,
  employees,
  onCreateCustomEmployee,
  onDeleteEmployee,
  onUpdateEmployee,
  publishEmployee,
  fetchPublishedEmployee
}: EmployeesViewProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'marketplace'>('directory');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const readyMadeTemplates = [
    {
      id: "tmpl_copywriter",
      name: "Sarah Jenkins",
      role: "Conversion Copywriter",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Marketing",
      goal: "Maximize conversion rates on landing pages, ads, and cold outreach copy.",
      skills: ["SEO Content", "Ad Copy", "AIDA copywriting", "Direct Response"],
      systemPrompt: "Write high-impact, persuasive copy using AIDA/PAS frameworks, focusing on customer pain points and clear calls-to-action.",
      model: "gemini-3.5-flash",
      temperature: 0.3,
      description: "Pre-configured SEO & persuasive content architect focused on sales-ready conversions.",
      performance: 98,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_sales",
      name: "Marcus Vance",
      role: "B2B Outreach Specialist",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Sales",
      goal: "Generate qualified B2B interest and book calendar demo calls.",
      skills: ["Cold Pitching", "LinkedIn Outreach", "Email Sequences", "Handle Objections"],
      systemPrompt: "Draft hyper-personalized, short, and objective B2B cold emails. Keep them friendly and direct with quick interest CTA.",
      model: "gemini-3.5-flash",
      temperature: 0.4,
      description: "Outbound sales prospector specialized in calendar booking and high open rates.",
      performance: 96,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_eng",
      name: "Devon Patel",
      role: "Full-Stack Developer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Engineering",
      goal: "Code robust schemas, build functional API endpoints, and design clean React screens.",
      skills: ["React 18", "Node.js", "TypeScript", "PostgreSQL", "API Security"],
      systemPrompt: "Deliver clean, self-documented, highly performant code modules. Handle edge cases defensively with explicit TypeScript types.",
      model: "gemini-3.5-flash",
      temperature: 0.2,
      description: "Senior technical architect specialized in modular Node.js servers, Drizzle and React layouts.",
      performance: 99,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_support",
      name: "Elena Rostova",
      role: "Customer Success Lead",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Operations",
      goal: "Maintain 100% CSAT, draft FAQ answers, and resolve customer complaints gracefully.",
      skills: ["Customer Empathy", "Resolve Disputes", "FAQ Documentation", "Ticket Triaging"],
      systemPrompt: "Address all customer queries with maximum empathy, detailed step-by-step guidance, and pristine professional decorum.",
      model: "gemini-3.5-flash",
      temperature: 0.5,
      description: "Empathetic customer success and support lead trained on defusing tickets and FAQs.",
      performance: 97,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_seo",
      name: "Aanya Patel",
      role: "SEO Growth Manager",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Marketing",
      goal: "Identify high-volume keywords and draft optimized content clusters to rank page #1.",
      skills: ["Keyword Audits", "Competitor Analysis", "Content Briefs", "Link Building"],
      systemPrompt: "Generate data-driven SEO content strategies. Provide keyword density guidelines and highly-scannable headings structure.",
      model: "gemini-3.5-flash",
      temperature: 0.3,
      description: "Organic search growth hacker trained on semantic keyword clustering techniques.",
      performance: 95,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_finance",
      name: "Leo Sterling",
      role: "Financial Analyst",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Finance",
      goal: "Analyze runway metrics, prepare pitch decks, and compile standard financial models.",
      skills: ["SaaS Metrics", "Projections", "Investor Relations", "Cap Table Management"],
      systemPrompt: "Be precise, analytical, and direct. Model SaaS KPIs like LTV, CAC, MRR, and runway with complete mathematical rigor.",
      model: "gemini-3.5-flash",
      temperature: 0.1,
      description: "Strategic investment CFO specialized in early-stage SaaS financial projection.",
      performance: 98,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_ai_dev",
      name: "Hiroshi Tanaka",
      role: "AI Integration Engineer",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Engineering",
      goal: "Develop cutting-edge AI integrations, construct fine-tuning pipelines, and integrate state-of-the-art LLMs.",
      skills: ["Gemini API", "FastAPI", "Vector DBs", "LangChain", "Prompt Engineering"],
      systemPrompt: "Write highly specialized, production-ready AI integration handlers, backend configurations, and prompt evaluation systems.",
      model: "gemini-3.5-flash",
      temperature: 0.2,
      description: "AI specialist expert in prompt tuning, retrieval-augmented generation (RAG) setups, and API optimization.",
      performance: 99,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_pm",
      name: "Camila Alvarez",
      role: "Technical Product Manager",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Operations",
      goal: "Design technical specifications, map PRDs, and optimize user experience flows.",
      skills: ["PRD Writing", "Roadmapping", "UX Wireframing", "Scrum Coordination"],
      systemPrompt: "Analyze the product vision and output structured PRDs, release timelines, and clear user story maps.",
      model: "gemini-3.5-flash",
      temperature: 0.3,
      description: "Seasoned coordinator expert in distilling user stories, creating agile roadmaps, and mapping product delivery pipelines.",
      performance: 97,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_sm",
      name: "Chloe Dubois",
      role: "Viral Loop Strategist",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Marketing",
      goal: "Devise viral social media loops, optimize content calendars, and write highly shareable short-form hook templates.",
      skills: ["TikTok Reels Hooking", "Viral Growth Loops", "Community Building", "Meme Marketing"],
      systemPrompt: "Analyze trends and produce high-converting hook templates, community guidelines, and viral content calendars.",
      model: "gemini-3.5-flash",
      temperature: 0.5,
      description: "Growth marketer specialized in organic loops, short-form video hooks, and digital community engineering.",
      performance: 96,
      workload: 0,
      isCustom: true
    },
    {
      id: "tmpl_legal",
      name: "Jonathan Vance",
      role: "SaaS Compliance Counsel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      department: "Finance",
      goal: "Draft ironclad Terms of Service, Privacy Policies, GDPR/CCPA audits, and SaaS vendor contracts.",
      skills: ["GDPR/CCPA Compliance", "TOS Drafting", "Privacy Audits", "IP Protection"],
      systemPrompt: "Provide direct, rigorously formatted compliance advice, legal drafts, and risk assessment checklists.",
      model: "gemini-3.5-flash",
      temperature: 0.1,
      description: "Compliance expert expert in SaaS regulatory frameworks, data protection audits, and vendor agreements.",
      performance: 98,
      workload: 0,
      isCustom: true
    }
  ];

  // Error / Success Banners
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states for drafting new custom employees
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newDept, setNewDept] = useState("Engineering");
  const [newGoal, setNewGoal] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newSystemPrompt, setNewSystemPrompt] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newModel, setNewModel] = useState("gemini-2.5-flash");
  const [newTemp, setNewTemp] = useState(0.2);

  // Edit employee form states
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editDept, setEditDept] = useState("Engineering");
  const [editGoal, setEditGoal] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editSystemPrompt, setEditSystemPrompt] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editModel, setEditModel] = useState("gemini-2.5-flash");
  const [editTemp, setEditTemp] = useState(0.2);

  // Share & Link states
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [showImportCodeModal, setShowImportCodeModal] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");

  // Export JSON function
  const handleExportEmployee = (emp: Employee) => {
    const exportData = {
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar,
      department: emp.department || "Engineering",
      goal: emp.goal,
      skills: emp.skills || [],
      systemPrompt: emp.systemPrompt,
      model: emp.model || "gemini-2.5-flash",
      temperature: emp.temperature ?? 0.2,
      description: emp.description || ""
    };
    
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${emp.name.toLowerCase().replace(/\s+/g, "_")}_employee.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file function
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!data.name || !data.role) {
          alert("Invalid employee JSON file. It must contain 'name' and 'role'.");
          return;
        }

        // Populate draft fields
        setNewName(data.name || "");
        setNewRole(data.role || "");
        setNewAvatar(data.avatar || "");
        setNewDept(data.department || "Engineering");
        setNewGoal(data.goal || "");
        setNewSkills(Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""));
        setNewSystemPrompt(data.systemPrompt || "");
        setNewDesc(data.description || "");
        setNewModel(data.model || "gemini-2.5-flash");
        setNewTemp(data.temperature ?? 0.2);

        // Open draft modal
        setShowDraftModal(true);
        
        // Clear input
        e.target.value = "";
      } catch (err) {
        alert("Failed to parse JSON file. Ensure it is a valid JSON document.");
      }
    };
    reader.readAsText(file);
  };

  // Publish to Firestore for direct link sharing
  const handlePublishEmployee = async (emp: Employee) => {
    setIsPublishing(emp.id);
    try {
      const pubId = await publishEmployee(emp);
      if (pubId) {
        setPublishingId(pubId);
      } else {
        alert("Failed to publish employee. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(null);
    }
  };

  // Import using shared link/code input
  const handleImportByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCode.trim()) return;

    setImportLoading(true);
    setImportError("");

    try {
      // Extract code if user entered a full URL
      let targetCode = importCode.trim();
      if (targetCode.includes("importEmployee=")) {
        const urlParams = new URLSearchParams(targetCode.split("?")[1]);
        const parsedCode = urlParams.get("importEmployee");
        if (parsedCode) {
          targetCode = parsedCode;
        }
      }

      const importedData = await fetchPublishedEmployee(targetCode);
      if (!importedData) {
        setImportError("No published employee found with this code or URL.");
        setImportLoading(false);
        return;
      }

      // Populate draft fields
      setNewName(importedData.name || "");
      setNewRole(importedData.role || "");
      setNewAvatar(importedData.avatar || "");
      setNewDept(importedData.department || "Engineering");
      setNewGoal(importedData.goal || "");
      setNewSkills(Array.isArray(importedData.skills) ? importedData.skills.join(", ") : (importedData.skills || ""));
      setNewSystemPrompt(importedData.systemPrompt || "");
      setNewDesc(importedData.description || "");
      setNewModel(importedData.model || "gemini-2.5-flash");
      setNewTemp(importedData.temperature ?? 0.2);

      // Open draft modal
      setShowDraftModal(true);
      setShowImportCodeModal(false);
      setImportCode("");
    } catch (err) {
      setImportError("Error resolving share code. Please try again.");
    } finally {
      setImportLoading(false);
    }
  };

  const copyShareLink = (id: string) => {
    const link = `${window.location.origin}?importEmployee=${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.name || "");
    setEditRole(emp.role || "");
    setEditAvatar(emp.avatar || "");
    setEditDept(emp.department || "Engineering");
    setEditGoal(emp.goal || "");
    setEditSkills(emp.skills?.join(", ") || "");
    setEditSystemPrompt(emp.systemPrompt || "");
    setEditDesc(emp.description || "");
    setEditModel(emp.model || "gemini-2.5-flash");
    setEditTemp(emp.temperature ?? 0.2);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const skillsArray = editSkills.split(",").map(s => s.trim()).filter(Boolean);

    onUpdateEmployee(editingEmployee.id, {
      name: editName,
      role: editRole,
      avatar: editAvatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
      department: editDept,
      goal: editGoal,
      skills: skillsArray,
      systemPrompt: editSystemPrompt || `You are ${editName}, a highly skilled ${editRole}. You complete all assigned startup files meticulously.`,
      model: editModel,
      temperature: editTemp,
      description: editDesc || `${editRole} within the ${editDept} division.`,
    });

    setEditingEmployee(null);
  };

  const handleDraftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newGoal) return;

    const skillsArray = newSkills.split(",").map(s => s.trim()).filter(Boolean);
    const avatarFallback = newAvatar.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";

    const res = await onCreateCustomEmployee({
      name: newName,
      role: newRole,
      avatar: avatarFallback,
      department: newDept,
      goal: newGoal,
      skills: skillsArray,
      systemPrompt: newSystemPrompt || `You are ${newName}, a highly skilled ${newRole}. You complete all assigned startup files meticulously.`,
      model: newModel,
      temperature: newTemp,
      description: newDesc || `${newRole} within the ${newDept} division.`,
    }, false); // false means custom agent!

    if (res && res.success === false) {
      setModalError(res.error || "Failed to draft custom employee.");
    } else {
      setGeneralSuccess(`Successfully drafted custom agent ${newName}!`);
      // Reset Form
      setNewName("");
      setNewRole("");
      setNewAvatar("");
      setNewDept("Engineering");
      setNewGoal("");
      setNewSkills("");
      setNewSystemPrompt("");
      setNewDesc("");
      setModalError(null);
      setShowDraftModal(false);
      setActiveTab("directory");
    }
  };

  const departments = ["Engineering", "Design", "Content", "Marketing", "Legal", "Operations"];

  return (
    <div className="space-y-8" id="employees-view">
      {/* Header section with drafting, importing, and link capability */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272A] pb-6 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Corporate AI Employee Directory</h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">Manage, draft, export, and import your autonomous workforce. Each employee operates within their private secure row context.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hidden file input */}
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImportFile} 
            className="hidden" 
            id="import-employee-file" 
          />
          <label 
            htmlFor="import-employee-file"
            className="inline-flex items-center space-x-2 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            id="import-employee-label"
          >
            <Upload className="w-4 h-4 text-zinc-400" />
            <span>Import Employee JSON</span>
          </label>

          <button 
            onClick={() => setShowImportCodeModal(true)}
            className="inline-flex items-center space-x-2 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            id="import-link-btn"
          >
            <Link2 className="w-4 h-4 text-zinc-400" />
            <span>Import via Link/Code</span>
          </button>

          <button 
            onClick={() => { setModalError(null); setShowDraftModal(true); }}
            className="inline-flex items-center space-x-2 bg-white text-black hover:bg-neutral-200 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
            id="draft-agent-btn"
          >
            <UserPlus className="w-4 h-4" />
            <span>Draft Custom Agent</span>
          </button>
        </div>
      </div>

      {/* Directory Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#18181B]/60 border border-[#27272A]/80 rounded-xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[9px] text-[#71717A] font-mono uppercase block">Active Workspace Staff</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-white font-mono">{employees.length}</span>
            <span className="text-[10px] text-[#71717A]">hired agents</span>
          </div>
        </div>
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#27272A] pt-3 md:pt-0 md:pl-4">
          <span className="text-[9px] text-[#71717A] font-mono uppercase block">Free Slots Allocation</span>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-lg font-bold font-mono ${employees.length < 4 ? "text-teal-400" : "text-amber-400"}`}>
              {employees.length < 4 ? `${4 - employees.length} Left` : "None"}
            </span>
            <span className="text-[10px] text-[#71717A]">{employees.length < 4 ? "free slots remaining" : "limit reached (billable)"}</span>
          </div>
        </div>
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#27272A] pt-3 md:pt-0 md:pl-4">
          <span className="text-[9px] text-[#71717A] font-mono uppercase block">Corporate Credit Balance</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {profile?.plan?.toLowerCase().includes("venture") 
                ? "Unlimited" 
                : (profile?.balance ?? 50000).toLocaleString()}
            </span>
            <span className="text-[10px] text-[#71717A]">credits available</span>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {generalError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center justify-between">
          <span>{generalError}</span>
          <button onClick={() => setGeneralError(null)} className="text-red-400 hover:text-white font-mono text-[10px] font-bold">Dismiss</button>
        </div>
      )}
      {generalSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center justify-between">
          <span>{generalSuccess}</span>
          <button onClick={() => setGeneralSuccess(null)} className="text-emerald-400 hover:text-white font-mono text-[10px] font-bold">Dismiss</button>
        </div>
      )}

      {/* Tabs navigation for Directory and Marketplace */}
      <div className="flex border-b border-[#27272A] mb-6">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider border-b-2 transition-all ${
            activeTab === "directory"
              ? "border-white text-white"
              : "border-transparent text-[#71717A] hover:text-white"
          }`}
        >
          Hired Workspace Directory ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider border-b-2 transition-all ${
            activeTab === "marketplace"
              ? "border-white text-white"
              : "border-transparent text-[#71717A] hover:text-white"
          }`}
        >
          Ready-Made AI Templates (Marketplace)
        </button>
      </div>

      {activeTab === "directory" ? (
        <>
          {employees.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#27272A] rounded-2xl space-y-3">
              <Users className="w-10 h-10 text-[#71717A] mx-auto" />
              <h4 className="text-sm font-bold text-[#A1A1AA]">No AI Employees in Corporate Directory</h4>
              <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed">
                You have not hired any AI staff yet. Head over to the **Ready-Made AI Templates** tab above or click **Draft Custom Agent** to write a prompt and deploy your first worker.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => (
                <div 
                  key={emp.id} 
                  className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl hover:border-neutral-500 transition-colors flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          className="w-11 h-11 rounded-xl object-cover border border-[#27272A]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-[#FAFAFA] text-sm tracking-tight">{emp.name}</h4>
                          <span className="text-[10px] text-[#71717A] font-mono block mt-0.5">{emp.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${emp.status === "working" ? "bg-amber-400 animate-pulse" : "bg-blue-400"}`} />
                        <span className="text-[9px] font-mono uppercase text-[#71717A]">{emp.status}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#A1A1AA] font-light leading-relaxed mb-4">{emp.description}</p>

                    <div className="space-y-3.5 border-t border-[#27272A] pt-4 mt-4">
                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {emp.skills?.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[9px] font-mono bg-[#09090B] border border-[#27272A] text-[#A1A1AA] px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Efficiency bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#71717A]">Quality Grade Efficiency</span>
                          <span className="text-white font-bold">{emp.performance}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#09090B] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${emp.performance}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[#27272A] pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <button 
                          onClick={() => setSelectedEmployee(emp)}
                          className="text-[#A1A1AA] hover:text-white font-mono transition-colors"
                        >
                          Inspect
                        </button>
                        <span className="text-[#27272A] font-mono">|</span>
                        <button 
                          onClick={() => startEditing(emp)}
                          className="text-blue-400 hover:text-blue-300 font-mono transition-colors font-medium"
                        >
                          Customize
                        </button>
                        <span className="text-[#27272A] font-mono">|</span>
                        <button 
                          onClick={() => handleExportEmployee(emp)}
                          className="text-zinc-400 hover:text-white font-mono flex items-center gap-0.5 transition-colors"
                          title="Export Employee to JSON"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </button>
                        <span className="text-[#27272A] font-mono">|</span>
                        <button 
                          onClick={() => handlePublishEmployee(emp)}
                          disabled={isPublishing === emp.id}
                          className="text-zinc-400 hover:text-white font-mono flex items-center gap-0.5 transition-colors disabled:opacity-50"
                          title="Publish Employee for share link"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{isPublishing === emp.id ? "Publishing..." : "Publish"}</span>
                        </button>
                      </div>
                      {emp.isCustom && (
                        <button 
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-[#09090B] transition-colors"
                          title="Delete custom agent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readyMadeTemplates.map((tmpl) => {
            const isAlreadyHired = employees.some(emp => emp.name.toLowerCase() === tmpl.name.toLowerCase());
            return (
              <div 
                key={tmpl.id}
                className={`border bg-[#18181B] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden ${
                  isAlreadyHired ? "border-emerald-500/30" : "border-[#27272A]"
                }`}
              >
                {/* Department badge accent */}
                <div className="absolute top-0 right-0 bg-indigo-500/10 border-b border-l border-[#27272A] px-3 py-1 text-[8px] font-mono text-indigo-400 uppercase rounded-bl-xl font-bold">
                  {tmpl.department}
                </div>

                {isAlreadyHired && (
                  <div className="absolute top-0 left-0 bg-emerald-500/10 border-b border-r border-[#27272A]/40 px-3 py-1 text-[8px] font-mono text-emerald-400 uppercase rounded-br-xl font-bold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>Hired & Active</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-3.5 mb-4 mt-2">
                    <img 
                      src={tmpl.avatar} 
                      alt={tmpl.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-[#27272A]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight">{tmpl.name}</h4>
                      <span className="text-[10px] text-blue-400 font-mono block mt-0.5">{tmpl.role}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#A1A1AA] font-light leading-relaxed mb-4 min-h-[50px]">{tmpl.description}</p>

                  <div className="space-y-3 bg-[#09090B] border border-[#27272A] p-3.5 rounded-xl text-[10px] leading-relaxed text-zinc-300">
                    <div>
                      <span className="text-[8px] text-[#71717A] font-mono uppercase block">Core Corporate Goal</span>
                      <span className="text-[11px] font-light text-zinc-200 mt-0.5 block leading-relaxed">{tmpl.goal}</span>
                    </div>

                    <div className="border-t border-[#27272A]/40 pt-2.5">
                      <span className="text-[8px] text-[#71717A] font-mono uppercase block mb-1">Expertise Stack</span>
                      <div className="flex flex-wrap gap-1">
                        {tmpl.skills.map((skill, idx) => (
                          <span key={idx} className="text-[8px] font-mono bg-[#18181B] border border-[#27272A] text-zinc-400 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost indicator */}
                <div className="mt-4 flex items-center justify-between border-t border-[#27272A]/40 pt-3 text-[10px]">
                  <span className="text-[#71717A] font-mono uppercase">Hiring Price</span>
                  <span className={`font-mono font-bold ${employees.length < 4 ? "text-teal-400" : "text-amber-400"}`}>
                    {employees.length < 4 ? "0 Credits (Free Slot)" : "5,000 Credits"}
                  </span>
                </div>

                <button
                  disabled={isAlreadyHired}
                  onClick={async () => {
                    if (isAlreadyHired) return;
                    const res = await onCreateCustomEmployee({
                      name: tmpl.name,
                      role: tmpl.role,
                      avatar: tmpl.avatar,
                      department: tmpl.department,
                      goal: tmpl.goal,
                      skills: tmpl.skills,
                      systemPrompt: tmpl.systemPrompt,
                      model: tmpl.model,
                      temperature: tmpl.temperature,
                      description: tmpl.description,
                    }, true); // true = template hiring cost

                    if (res && res.success === false) {
                      setGeneralError(res.error || "Failed to hire ready-made employee.");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      setGeneralSuccess(`Successfully hired ${tmpl.name} into your directory!`);
                      setActiveTab("directory");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`w-full mt-3 py-2.5 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-1.5 ${
                    isAlreadyHired 
                      ? "bg-[#18181B] border border-[#27272A] text-[#71717A] cursor-not-allowed" 
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {isAlreadyHired ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Hired (Active in Workspace)</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Hire Contract (1-Click)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Draft agent Dialog modal */}
      <AnimatePresence>
        {showDraftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[#27272A] bg-[#09090B] w-full max-w-xl rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-[#FAFAFA] text-base">Draft Corporate AI Employee</h3>
                </div>
                <button onClick={() => setShowDraftModal(false)} className="text-[#71717A] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDraftSubmit} className="space-y-4 text-xs font-sans">
                {modalError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs leading-relaxed">
                    {modalError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Elena Rostova" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Professional Role</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Flutter Developer" 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Division Department</label>
                    <select 
                      value={newDept} 
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    >
                      {departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Avatar Image URL</label>
                    <input 
                      type="text" 
                      placeholder="Optional URL" 
                      value={newAvatar} 
                      onChange={(e) => setNewAvatar(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Core Objectives Goal</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Design secure contract models and evaluate corporate risk compliance checks." 
                    value={newGoal} 
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Skills Tags (Comma Separated)</label>
                  <input 
                    type="text" 
                    placeholder="TypeScript, React, Jest" 
                    value={newSkills} 
                    onChange={(e) => setNewSkills(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Description Biography</label>
                  <textarea 
                    rows={2} 
                    placeholder="Ex-Linear architect with 10 years experience building scalable SaaS web structures." 
                    value={newDesc} 
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">System Prompt (AI Directives)</label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="You are an expert Flutter dev. You output responsive clean dart scripts." 
                    value={newSystemPrompt} 
                    onChange={(e) => setNewSystemPrompt(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">LLM Model</label>
                    <select 
                      value={newModel} 
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Analytical)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Temperature: {newTemp}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={newTemp} 
                      onChange={(e) => setNewTemp(parseFloat(e.target.value))}
                      className="w-full accent-white mt-2 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Cost / Price indicator */}
                <div className="border-t border-[#27272A]/60 pt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#71717A] font-mono block uppercase">Employment Cost</span>
                    <span className="text-[10px] text-[#A1A1AA] block mt-0.5">
                      {employees.length < 4 ? "AK.AI offers 4 free employees. You are currently in a free slot!" : "4 Free limit reached. Drafting costs 6,000 credits."}
                    </span>
                  </div>
                  <span className={`text-sm font-mono font-bold ${employees.length < 4 ? "text-teal-400" : "text-amber-400"}`}>
                    {employees.length < 4 ? "0 Credits" : "6,000 Credits"}
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 font-bold rounded-lg shadow-sm transition-colors text-xs cursor-pointer mt-1"
                >
                  Confirm Employment Contract
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspector modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[#27272A] bg-[#09090B] w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
                <span className="text-xs font-mono text-[#71717A]">AGENTS SPECIFICATION BRIEF</span>
                <button onClick={() => setSelectedEmployee(null)} className="text-[#71717A] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-12 h-12 rounded-xl object-cover border border-[#27272A]" />
                  <div>
                    <h4 className="font-bold text-white text-base">{selectedEmployee.name}</h4>
                    <span className="text-xs text-[#A1A1AA] font-mono">{selectedEmployee.role}</span>
                  </div>
                </div>

                <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl space-y-3 shadow-sm">
                  <div>
                    <span className="text-[10px] text-[#71717A] font-mono block uppercase">Objectives Scope</span>
                    <p className="text-xs text-slate-300 font-light leading-relaxed mt-1">{selectedEmployee.goal}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] font-mono block uppercase">LLM Directives Prompt</span>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed mt-1 p-2 bg-[#09090B] border border-[#27272A] rounded overflow-y-auto max-h-[150px] whitespace-pre-wrap">
                      {selectedEmployee.systemPrompt}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customize/Edit employee Dialog modal */}
      <AnimatePresence>
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[#27272A] bg-[#09090B] w-full max-w-xl rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-[#FAFAFA] text-base">Customize AI Employee: {editingEmployee.name}</h3>
                </div>
                <button onClick={() => setEditingEmployee(null)} className="text-[#71717A] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Elena Rostova" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Professional Role</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Flutter Developer" 
                      value={editRole} 
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Division Department</label>
                    <select 
                      value={editDept} 
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    >
                      {departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Avatar Image URL</label>
                    <input 
                      type="text" 
                      placeholder="Optional URL" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Core Objectives Goal</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Design secure contract models and evaluate corporate risk compliance checks." 
                    value={editGoal} 
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Skills Tags (Comma Separated)</label>
                  <input 
                    type="text" 
                    placeholder="TypeScript, React, Jest" 
                    value={editSkills} 
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Description Biography</label>
                  <textarea 
                    rows={2} 
                    placeholder="Ex-Linear architect with 10 years experience building scalable SaaS web structures." 
                    value={editDesc} 
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">System Prompt (AI Directives)</label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="You are an expert Flutter dev. You output responsive clean dart scripts." 
                    value={editSystemPrompt} 
                    onChange={(e) => setEditSystemPrompt(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">LLM Model</label>
                    <select 
                      value={editModel} 
                      onChange={(e) => setEditModel(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2.5 focus:border-neutral-500 outline-none"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Analytical)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[#71717A] font-mono uppercase">Temperature: {editTemp}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={editTemp} 
                      onChange={(e) => setEditTemp(parseFloat(e.target.value))}
                      className="w-full accent-white mt-2 cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 font-bold rounded-lg shadow-sm transition-colors text-xs cursor-pointer"
                >
                  Save Workspace Customization
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import share code / URL Modal */}
      <AnimatePresence>
        {showImportCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[#27272A] bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Link2 className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-[#FAFAFA] text-base">Import via Code or URL</h3>
                </div>
                <button onClick={() => { setShowImportCodeModal(false); setImportCode(""); setImportError(""); }} className="text-[#71717A] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleImportByCode} className="space-y-4">
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Paste the <strong>Published Share URL</strong> or <strong>Employee Code</strong> shared by another founder to load their customized bot specifications.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] font-mono uppercase">Share Link or Code</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. ?importEmployee=publishedId or just publishedId" 
                    value={importCode} 
                    onChange={(e) => setImportCode(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] text-slate-200 rounded-lg p-2.5 text-xs focus:border-neutral-500 outline-none"
                  />
                </div>

                {importError && (
                  <p className="text-red-400 text-xs font-mono">{importError}</p>
                )}

                <button 
                  type="submit" 
                  disabled={importLoading}
                  className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {importLoading ? "Fetching Agent Specs..." : "Load Agent Specification"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Published share link display Modal */}
      <AnimatePresence>
        {publishingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border border-[#27272A] bg-[#09090B] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-[#FAFAFA] text-base">AI Employee Published!</h3>
                </div>
                <button onClick={() => setPublishingId(null)} className="text-[#71717A] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Your AI employee configuration has been published to our global cloud registry. Share this direct import link with anyone in the workspace!
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#71717A] font-mono uppercase">Shareable Import Link</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}?importEmployee=${publishingId}`} 
                      className="flex-1 bg-[#18181B] border border-[#27272A] text-slate-300 rounded-lg p-2 text-xs outline-none font-mono"
                    />
                    <button 
                      onClick={() => copyShareLink(publishingId)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#18181B] p-3 border border-[#27272A] rounded-lg">
                  <span className="text-[10px] text-[#71717A] font-mono block uppercase">Employee Registry Code</span>
                  <span className="text-xs font-mono text-zinc-300 select-all mt-1 block">{publishingId}</span>
                </div>

                <button 
                  onClick={() => setPublishingId(null)}
                  className="w-full py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white border border-[#27272A] font-bold rounded-lg text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
