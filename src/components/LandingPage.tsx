import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  ChevronRight, 
  Shield, 
  Zap, 
  Users, 
  Cpu, 
  Sparkles, 
  Layers, 
  Clock, 
  ArrowRight, 
  BarChart3, 
  Play, 
  HelpCircle, 
  MessageSquare,
  Lock,
  GitBranch,
  Star
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ onGetStarted, onLoginClick }: LandingPageProps) {
  const [selectedDemo, setSelectedDemo] = useState<"startup" | "brand">("startup");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeStoryPhase, setActiveStoryPhase] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const storyPhases = [
    {
      title: "Phase 1: The Spark",
      subtitle: "The Founder's Vision",
      avatar: "💡",
      color: "from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20",
      description: "You type a simple, high-level business vision. No detailed code specifications, tech stack choices, or system designs required.",
      log: 'Founder prompt: "Build an automated micro-SaaS for fitness habit tracking with streak rewards."',
      previewTitle: "Founder Command",
      previewContent: [
        { label: "Concept", value: "Fitness Habit Tracker" },
        { label: "Core Feature", value: "Multi-day streaks & custom achievement badges" },
        { label: "Premium Touch", value: "Frictionless minimalist styling" }
      ]
    },
    {
      title: "Phase 2: The Blueprint",
      subtitle: "CEO Strategic Engineering",
      avatar: "🤖",
      color: "from-teal-500/20 to-emerald-500/5 text-teal-400 border-teal-500/20",
      description: "AI CEO Elena instantly wakes up. She analyzes your requirements, selects a 4-agent team of custom developers, and builds a 5-step Kanban roadmap with exact specifications.",
      log: 'Elena (CEO): "Instruction received. Initiating planning. Recruiting Sarah (Full-Stack Dev), Julian (Designer), and Sofia (Marketer). Created project plan \'FitStreak SaaS\'."',
      previewTitle: "Elena's CEO Directive",
      previewContent: [
        { label: "Assigned Team", value: "Sarah Chen, Julian Rivera, Sofia Rodriguez" },
        { label: "Priority Level", value: "High (Autonomous execution sequence)" },
        { label: "Tasks Generated", value: "5 critical deliverable milestones" }
      ]
    },
    {
      title: "Phase 3: The Collaboration",
      subtitle: "Deep Multi-Agent Execution",
      avatar: "👥",
      color: "from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/20",
      description: "Your employees collaborate in real-time. Julian Rivera designs beautiful minimalist dark grids, while Sarah Chen builds typescript React components and Firestore schemas in complete synergy.",
      log: 'Sarah: "Coding habit streak logic with request.time verification rules." \nJulian: "Grids completed with elegant off-white text and rich slates."',
      previewTitle: "Workspace Active Sync",
      previewContent: [
        { label: "Design Spec", value: "Neutral slates, high-contrast text, 8px grid alignment" },
        { label: "Code Logic", value: "Streak calculation + Firestore real-time snapshot listeners" },
        { label: "Marketing Copy", value: "High-converting sales copies authored by Mark" }
      ]
    },
    {
      title: "Phase 4: The Audit",
      subtitle: "Lead Code Review & QC",
      avatar: "🛡️",
      color: "from-purple-500/20 to-fuchsia-500/5 text-purple-400 border-purple-500/20",
      description: "Elena coordinates a rigorous review block. She parses Julian's design, compiles Sarah's code, tests for vulnerabilities, and re-executes if any errors are encountered.",
      log: 'Elena (CEO): "Reviewing code submission. Linter checks passed successfully. DB schemas align with user permissions. Asset validated for shipment."',
      previewTitle: "Autonomous Review Board",
      previewContent: [
        { label: "Compile Check", value: "SUCCESS (0 errors)" },
        { label: "Vulnerability Scan", value: "PASSED (Relational database constraints active)" },
        { label: "Asset Validation", value: "STRICT compliance verified" }
      ]
    },
    {
      title: "Phase 5: The Ship",
      subtitle: "Finished Venture Shipped",
      avatar: "🚀",
      color: "from-pink-500/20 to-rose-500/5 text-pink-400 border-pink-500/20",
      description: "In minutes, your product is ready. All finished code files, designs, and launch campaigns are populated inside your secure vault. You can review, download, or launch immediately.",
      log: 'System Status: "FitStreak project completed. 12 files created, 4 logs generated. Shipped securely to client\'s Files Vault."',
      previewTitle: "Delivered Artifact Bundle",
      previewContent: [
        { label: "Full Codebase", value: "Available in Files Vault (TypeScript & React)" },
        { label: "Design Tokens", value: "Tailwind CSS theme ready" },
        { label: "Launch Strategy", value: "Complete Organic and Meta Ads campaign template" }
      ]
    }
  ];

  const demoWorkflow = {
    startup: {
      prompt: "Create my food delivery AI startup.",
      title: "QuickSpark Delivery App",
      steps: [
        { role: "CEO", name: "Elena", action: "Analyzing market, building 5-agent team, creating timeline.", status: "completed", color: "border-teal-500/30 text-teal-400 bg-teal-500/10" },
        { role: "Product Manager", name: "Aria", action: "Drafting PRD, mapping user journeys, scope definitions.", status: "completed", color: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
        { role: "UI Designer", name: "Julian", action: "Creating 8-screen wireframe system & custom Figma design system.", status: "working", color: "border-purple-500/30 text-purple-400 bg-purple-500/10" },
        { role: "Software Engineer", name: "Sarah", action: "Coding React Native login flows & API gateway endpoints.", status: "pending", color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
        { role: "Marketing Lead", name: "Sofia", action: "Preparing launch ad campaigns & pricing calculators.", status: "pending", color: "border-rose-500/30 text-rose-400 bg-rose-500/10" }
      ]
    },
    brand: {
      prompt: "Launch my sustainable luxury clothing brand.",
      title: "Verde Threads Co.",
      steps: [
        { role: "CEO", name: "Elena", action: "Drafting brand guidelines, selecting 4-agent team, assigning tasks.", status: "completed", color: "border-teal-500/30 text-teal-400 bg-teal-500/10" },
        { role: "Brand Architect", name: "Aria", action: "Sourcing bamboo linen options, mapping high-end pricing structure.", status: "completed", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" },
        { role: "Copywriter", name: "Mark", action: "Writing high-converting landing page headlines & video sales letters.", status: "working", color: "border-orange-500/30 text-orange-400 bg-orange-500/10" },
        { role: "Ad Specialist", name: "Leo", action: "Setting up Meta Ads campaign structure & targeting definitions.", status: "pending", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" }
      ]
    }
  };

  const departments = [
    { name: "Executive Suite", icon: Building2, employees: ["CEO", "COO", "CTO", "CFO", "CMO"] },
    { name: "Engineering Core", icon: Cpu, employees: ["Full Stack Dev", "Frontend Dev", "DevOps Engineer", "QA Automation"] },
    { name: "Aesthetic Design", icon: Layers, iconColor: "text-purple-400", employees: ["UI Designer", "UX Architect", "Motion Expert", "Logo Artist"] },
    { name: "Growth Marketing", icon: BarChart3, employees: ["SEO Guru", "Facebook Ads Specialist", "YouTube Growth", "Email Copywriter"] },
    { name: "Operations & Legal", icon: Shield, employees: ["Legal Advisor", "Contract Specialist", "Financial Analyst", "Tax Advisor"] }
  ];

  const pricingPlans = [
    {
      name: "Starter Company",
      price: "$149",
      period: "month",
      desc: "Perfect for solopreneurs launching their first AI-backed product.",
      features: [
        "1 AI CEO & 4 Standard Employees",
        "Active execution of 1 project at a time",
        "Stateless workspace history preservation",
        "100K standard tokens per month included",
        "Standard file exports (JSON, Markdown, TXT)"
      ],
      isPopular: false,
      cta: "Hire Starter Company"
    },
    {
      name: "Autonomous Scale-Up",
      price: "$499",
      period: "month",
      desc: "The standard for serious operators, digital agencies, and startups.",
      features: [
        "1 AI CEO & Unlimited Custom Employees",
        "3 concurrent active multi-agent projects",
        "Super Memory company knowledge database",
        "Full Kanban task boards & live timelines",
        "2.5M premium Gemini tokens included",
        "Complete source code exports (.TS / .JS / JSON)"
      ],
      isPopular: true,
      cta: "Hire Scale-Up Company"
    },
    {
      name: "Enterprise Venture",
      price: "$1,499",
      period: "month",
      desc: "An entire corporate division running autonomously 24/7/365.",
      features: [
        "Multiple CEOs + 500+ Employee Roles",
        "Unlimited concurrent project delivery",
        "Dedicated isolated multi-user workspace database",
        "Custom fine-tuned Gemini model permissions",
        "Unlimited tokens with fair usage limits",
        "Priority live executive Slack channel",
        "White-glove custom employee drafting"
      ],
      isPopular: false,
      cta: "Draft Venture Company"
    }
  ];

  const faqs = [
    {
      q: "How does AK.AI differ from simple chatbot overlays?",
      a: "AK.AI is not a wrapper where you talk back and forth. You communicate solely with your AI CEO. The CEO automatically acts as the director of resources—translating your instructions, drafting project scopes, launching specialized sub-agents, executing tasks, performing review cycles, and assembling downloadable code, marketing assets, and spreadsheets. You observe their work in real-time on your dashboard."
    },
    {
      q: "Can I create custom employees with unique personalities?",
      a: "Absolutely. Under the Employees configuration, you can specify an unlimited number of custom employees. Give them names, specify roles, design specific skill tags, adjust temperatures, select target Gemini models, and write highly customized system prompts. Your CEO automatically recruits them when a project aligns with their expertise."
    },
    {
      q: "What is the 'Super Memory' feature?",
      a: "Super Memory allows you to upload documents, corporate guidelines, or saved prompts directly to your company database. All recruited employees—from the frontend coder to the legal advisor—have access to this shared context, ensuring your company outputs align with your exact brand voice, standards, and technical stacks."
    },
    {
      q: "How is user data isolation guaranteed?",
      a: "We prioritize complete cryptographic and physical user data isolation. Built on Firebase Firestore security rules, your workspace—including Chats, Employees, Projects, Files, and Memories—is fully bound to your User ID. No shared caches, and no data leak risks. Your corporate secrets stay entirely yours."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-neutral-800 selection:text-neutral-200 overflow-x-hidden" id="landing-page">
      {/* Header with Liquid Transparent Floating Capsule Effect */}
      <header className={`fixed z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? "top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl bg-[#09090b]/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] py-3 px-4 sm:px-6"
          : "top-0 left-0 right-0 w-full bg-[#09090b]/20 backdrop-blur-md border-b border-[#27272a]/20 py-5 px-4 sm:px-6 lg:px-8"
      }`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md transition-transform duration-300 hover:rotate-6">
              <Building2 className="w-5 h-5 text-black stroke-[2]" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-white">AK.AI</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#employees" className="hover:text-white transition-colors duration-200">Meet the Team</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
              id="login-btn-nav"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-semibold bg-white text-black hover:bg-neutral-100 transition-all active:scale-95 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md"
              id="get-started-btn-nav"
            >
              Launch Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle, non-slop background grid layout instead of chaotic gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        {/* Tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-[#18181B] border border-[#27272A] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-[#A1A1AA] mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>AUTONOMOUS ENTERPRISE FRAMEWORK</span>
        </motion.div>

        {/* High impact Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-sans font-bold tracking-tight text-white max-w-5xl leading-[1.1] mb-8"
        >
          Don't chat with AI.<br />
          <span className="text-white">Hire an entire AI Company.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#A1A1AA] max-w-3xl leading-relaxed mb-12 font-light"
        >
          Stop writing single-response chatbot prompts. Hire an expert **AI CEO** who builds detailed project pipelines, coordinates specialized software engineers, UI designers, SEO marketers, and legal advisors to deliver finished business deliverables automatically.
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20 z-10"
        >
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-white hover:bg-neutral-200 text-black font-bold px-8 py-4 rounded-lg shadow-sm transition-colors text-base"
          >
            <span>Launch Your AI Company</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a 
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] px-8 py-4 rounded-lg transition-colors font-semibold"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>Watch Demorun</span>
          </a>
        </motion.div>

        {/* Dashboard preview frame */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative w-full max-w-5xl rounded-xl border border-[#27272A] bg-[#18181B] p-4 shadow-2xl"
        >
          {/* Mock title bar */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#27272A]" />
              <span className="w-3 h-3 rounded-full bg-[#27272A]" />
              <span className="w-3 h-3 rounded-full bg-[#27272A]" />
              <span className="text-xs text-[#71717A] font-mono pl-3">WORKSPACE // AK.AI CLIENT PORTAL</span>
            </div>
            <div className="bg-[#09090B] border border-[#27272A] px-3 py-1 rounded text-[10px] text-white font-mono tracking-wider">
              CEO ENGINE ONLINE
            </div>
          </div>

          {/* Grid representing active company dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="md:col-span-2 border border-[#27272A] bg-[#09090B] rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 bg-neutral-100 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold tracking-tight text-white">Active CEO Delegation Flow</span>
                </div>
                <span className="text-[11px] text-[#71717A] font-mono">15.0s elapsed</span>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start space-x-3 text-xs bg-[#18181B] border border-[#27272A] p-3 rounded-lg">
                  <span className="font-mono text-white font-bold">CEO</span>
                  <p className="text-slate-300">"Elena here. Instruction recognized: Launch SaaS App. Provisioning 4 specialized engineers, designers, and ad strategists. Planning complete."</p>
                </div>
                <div className="flex items-center justify-between bg-[#18181B] border border-[#27272A]/40 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="text-[#A1A1AA] font-mono">🎨 Julian (UI Designer):</span>
                    <span className="text-slate-300">"Structuring core dashboard architecture wireframes..."</span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#09090B] text-[#A1A1AA] border border-[#27272A] px-1.5 py-0.5 rounded">62% working</span>
                </div>
                <div className="flex items-center justify-between bg-[#18181B] border border-[#27272A]/20 p-2.5 rounded-lg text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full" />
                    <span className="text-[#A1A1AA] font-mono">💻 Sarah (Dev):</span>
                    <span className="text-slate-300">"Awaiting Julian's grid config to bootstrap schemas..."</span>
                  </div>
                  <span className="font-mono text-[10px] bg-[#09090B] text-[#71717A] border border-[#27272A] px-1.5 py-0.5 rounded">Waiting</span>
                </div>
              </div>
            </div>

            <div className="border border-[#27272A] bg-[#09090B] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#71717A] font-mono block mb-1">COMPANY METRICS</span>
                <h4 className="text-2xl font-bold text-white tracking-tight">4,810+ Completed Assets</h4>
                <p className="text-xs text-[#A1A1AA] mt-2">Continuous delivery pipeline with average quality score of 98.7% across 140 client agencies.</p>
              </div>
              <div className="border-t border-[#27272A] pt-4 mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#71717A]">Active Agents</span>
                  <span className="text-white font-bold">12 On-Duty</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#71717A]">Weekly Output</span>
                  <span className="text-white font-bold">142,501 lines</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section with Scroll Animation */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A] relative"
      >
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono tracking-widest text-white font-semibold block mb-3 uppercase">COMPANY POWERHOUSE</span>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">The ultimate corporate powerhouse.</h2>
          <p className="text-[#A1A1AA] text-lg font-light">Forget writing prompts for individual bots. AK.AI provides an entire enterprise working simultaneously under your leadership.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl hover:border-neutral-500 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#09090B] flex items-center justify-center text-white border border-[#27272A] mb-6 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI CEO Coordinator</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">Talk only to your CEO. The CEO automatically plans, assigns, checks code/designs, retries failures, and delivers your projects.</p>
          </div>

          {/* Feature 2 */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl hover:border-neutral-500 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#09090B] flex items-center justify-center text-white border border-[#27272A] mb-6 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Custom AI Employees</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">Draft unlimited specialized employees with customized system prompts, goals, skills, temperatures, and memories.</p>
          </div>

          {/* Feature 3 */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl hover:border-neutral-500 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#09090B] flex items-center justify-center text-white border border-[#27272A] mb-6 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Super Memory Database</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">Keep knowledge persistent. Save system architecture rules or business guidelines so all employees understand your context.</p>
          </div>

          {/* Feature 4 */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl hover:border-neutral-500 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#09090B] flex items-center justify-center text-white border border-[#27272A] mb-6 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Kanban Boards</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">Watch tasks progress visually on Kanban columns: To Do, In Progress, Review, and Completed, with real-time status updates.</p>
          </div>

          {/* Feature 5 */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl hover:border-neutral-500 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#09090B] flex items-center justify-center text-white border border-[#27272A] mb-6 group-hover:scale-105 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Isolated User Workspace</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">Complete data separation. Every user session registers private rows on Firestore so workspace analytics are completely isolated.</p>
          </div>

          {/* Feature 6 */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl hover:border-neutral-500 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-[#09090B] flex items-center justify-center text-white border border-[#27272A] mb-6 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Generated Asset Files</h3>
            <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">Download real files produced by engineers (TypeScript/React code), designers (wireframe specs), and copywriters directly.</p>
          </div>
        </div>
      </motion.section>

      {/* How AK.AI Works Section with Scroll Animation */}
      <motion.section 
        id="how-it-works" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 bg-[#09090B] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-mono tracking-widest text-[#71717A] font-semibold block mb-3 uppercase">OPERATING TIMELINE</span>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-6">How AK.AI structures, coordinates, and executes.</h2>
            <p className="text-[#A1A1AA] font-light mb-10 leading-relaxed text-base">When you communicate your corporate instruction to the CEO, an advanced multi-agent orchestrator wakes up, drafts assignments, checks quality specs, and saves everything in your cloud vault.</p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#18181B] text-white border border-[#27272A] flex items-center justify-center text-sm font-bold font-mono shrink-0">1</div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Strategic Breakdown</h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">The CEO digests your startup concept, runs target analytics, and structures a custom timeline of up to 5 project tasks.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#18181B] text-white border border-[#27272A] flex items-center justify-center text-sm font-bold font-mono shrink-0">2</div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Recruitment & Delegation</h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">The CEO scans default and custom employees, selecting the finest engineers, copywriters, or marketers based on matching skills.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#18181B] text-white border border-[#27272A] flex items-center justify-center text-sm font-bold font-mono shrink-0">3</div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Autonomous Execution & Quality Control</h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">Selected agents build files autonomously. The CEO reviews each draft, rejects weak submissions, and logs actions securely.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demo Workflow simulation */}
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-6">
              <span className="text-xs text-[#71717A] font-mono">DEMO SYSTEM WORKFLOW</span>
              <div className="flex space-x-1.5">
                <button 
                  onClick={() => setSelectedDemo("startup")}
                  className={`px-3 py-1 text-xs rounded-md border font-mono transition-colors ${selectedDemo === "startup" ? "bg-white text-black border-white" : "bg-[#09090B] border-[#27272A] text-[#A1A1AA]"}`}
                  id="workflow-tab-startup"
                >
                  Startup App
                </button>
                <button 
                  onClick={() => setSelectedDemo("brand")}
                  className={`px-3 py-1 text-xs rounded-md border font-mono transition-colors ${selectedDemo === "brand" ? "bg-white text-black border-white" : "bg-[#09090B] border-[#27272A] text-[#A1A1AA]"}`}
                  id="workflow-tab-brand"
                >
                  Clothing Brand
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#09090B] border border-[#27272A] p-4 rounded-lg">
                <span className="text-[10px] text-[#71717A] font-mono block mb-1">USER INPUT</span>
                <p className="text-xs font-mono text-white">"{demoWorkflow[selectedDemo].prompt}"</p>
              </div>

              <div className="space-y-3.5 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[#27272A]" />
                {demoWorkflow[selectedDemo].steps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs pl-0.5">
                    <div className="w-7 h-7 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center shrink-0 z-10 font-mono text-[10px] font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-[#09090B]/60 border border-[#27272A]/80 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{step.name}</span>
                          <span className="text-[9px] text-[#71717A] font-mono">({step.role})</span>
                        </div>
                        <span className="text-[9px] font-mono capitalize px-1.5 py-0.5 rounded bg-[#18181B] text-white border border-[#27272A]">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] font-light leading-relaxed">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Interactive Storytelling Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A] relative bg-[#09090B]"
        id="story-section"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-teal-400 font-semibold block mb-3 uppercase">FOUNDER CHRONICLES</span>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">From Spark to Ship: An Autonomous Journey</h2>
          <p className="text-[#A1A1AA] text-lg font-light leading-relaxed">
            Take a deep, high-fidelity look into how a single founder's simple vision transforms into a fully-designed, fully-developed application. Click each step to audit the collaboration logs.
          </p>
        </div>

        {/* Timeline Track & Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
          {storyPhases.map((phase, idx) => {
            const isActive = activeStoryPhase === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStoryPhase(idx)}
                className={`flex items-center space-x-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  isActive 
                    ? "bg-[#18181B] border-teal-500 text-white shadow-lg" 
                    : "bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:bg-[#18181B] hover:text-white"
                }`}
                id={`story-tab-${idx}`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-lg shadow-inner">
                  {phase.avatar}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-teal-400 font-bold">STEP 0{idx + 1}</span>
                  <span className="text-xs font-semibold truncate">{phase.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Narrative Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStoryPhase}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-[#27272A] bg-[#18181B]/60 p-8 rounded-2xl relative overflow-hidden"
          >
            {/* Soft glowing accent */}
            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br ${storyPhases[activeStoryPhase].color} opacity-10 blur-[80px] pointer-events-none`} />

            {/* Left Story Details */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono tracking-wider text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md">
                  {storyPhases[activeStoryPhase].title}
                </span>
                <h3 className="text-2xl font-bold text-white mt-6 mb-4">{storyPhases[activeStoryPhase].subtitle}</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed font-light mb-8">
                  {storyPhases[activeStoryPhase].description}
                </p>
              </div>

              <div className="bg-[#09090B] border border-[#27272A] p-4.5 rounded-xl">
                <span className="text-[9px] text-[#71717A] font-mono block mb-1.5 uppercase tracking-wider">LIVE WORKSPACE CHRONICLES</span>
                <p className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line">
                  {storyPhases[activeStoryPhase].log}
                </p>
              </div>
            </div>

            {/* Right Live Visual Simulation Board */}
            <div className="lg:col-span-5 border border-[#27272A] bg-[#09090B] p-6 rounded-xl flex flex-col justify-between shadow-2xl relative z-10">
              <div>
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3 mb-4">
                  <span className="text-[10px] text-[#71717A] font-mono uppercase tracking-widest">{storyPhases[activeStoryPhase].previewTitle}</span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                </div>

                <div className="space-y-3.5">
                  {storyPhases[activeStoryPhase].previewContent.map((item, keyIdx) => (
                    <div key={keyIdx} className="bg-[#18181B]/60 border border-[#27272A]/50 p-3 rounded-lg text-xs">
                      <span className="font-mono text-[10px] text-[#71717A] uppercase block mb-1">{item.label}</span>
                      <span className="font-semibold text-white leading-relaxed">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {activeStoryPhase === 4 && (
                <div className="mt-6">
                  <button 
                    onClick={onGetStarted}
                    className="w-full py-3 bg-teal-500 text-slate-950 font-bold rounded-xl shadow-lg hover:brightness-110 transition-all text-xs flex items-center justify-center space-x-2 animate-bounce"
                  >
                    <span>Try Launching Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Meet Your AI Company Section with Scroll Animation */}
      <motion.section 
        id="employees" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A]"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-white font-semibold block mb-3 uppercase">ON-DUTY STAFF</span>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Meet your corporate team of AI experts.</h2>
          <p className="text-[#A1A1AA] text-lg font-light">Recruit from our database of 500+ specialized AI employee roles, or draft your own custom employees in seconds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {departments.map((dept, idx) => (
            <div key={idx} className="border border-[#27272A] bg-[#18181B] p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#09090B] flex items-center justify-center text-white mb-5 border border-[#27272A]">
                <dept.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-3 text-sm tracking-tight">{dept.name}</h3>
              <ul className="space-y-2">
                {dept.employees.map((emp, eIdx) => (
                  <li key={eIdx} className="text-xs text-[#A1A1AA] font-mono flex items-center space-x-2">
                    <span className="w-1 h-1 bg-white rounded-full" />
                    <span>{emp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Pricing Tier Section with Scroll Animation */}
      <motion.section 
        id="pricing" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A]"
      >
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono tracking-widest text-white font-semibold block mb-3 uppercase">COMPANY SUBSCRIPTIONS</span>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Pricing scaled to your execution speed.</h2>
          <p className="text-[#A1A1AA] text-lg font-light">Flexible corporate tiers designed to support initial launches, scale-ups, and massive enterprise ventures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`border rounded-xl p-8 flex flex-col justify-between relative overflow-hidden ${plan.isPopular ? "border-neutral-400 bg-[#18181B] shadow-sm" : "border-[#27272A] bg-[#18181B]"}`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4 bg-white text-black text-[10px] font-bold font-mono px-2.5 py-1 rounded uppercase tracking-wider">
                  RECOMMENDED
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-[#A1A1AA] font-light mb-6 leading-relaxed">{plan.desc}</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-[#71717A] font-mono ml-2">/ {plan.period}</span>
                </div>
                <div className="border-t border-[#27272A] my-6" />
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3 text-xs text-slate-300 font-light">
                      <Sparkles className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className={`w-full py-3.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-colors ${plan.isPopular ? "bg-white hover:bg-neutral-200 text-black font-bold" : "bg-[#09090B] border border-[#27272A] hover:bg-[#27272A] text-white"}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials with Scroll Animation */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A]"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-white font-semibold block mb-3 uppercase">FOUNDERS VOICE</span>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4 font-sans">Unanimously loved by global creators.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl shadow-sm">
            <div className="flex items-center space-x-1.5 mb-5 text-white">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-light mb-6">"Hiring AK.AI felt like instantly raising a seed round. I gave the CEO my product roadmap, and within minutes, my tasks board was populated with actual React code and full marketing plans. Absolutely stellar."</p>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center font-mono text-xs font-bold text-white">AM</div>
              <div>
                <h4 className="text-xs font-bold text-white">Alex Mercer</h4>
                <span className="text-[10px] text-[#71717A] font-mono">Founder, SparkBase</span>
              </div>
            </div>
          </div>

          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl shadow-sm">
            <div className="flex items-center space-x-1.5 mb-5 text-white">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-light mb-6">"I created a custom employee role called Rahul, a YouTube Growth Expert, and wrote a specialized prompt. The CEO automatically recruited Rahul alongside my marketing managers to design a viral ad sequence."</p>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center font-mono text-xs font-bold text-white">SK</div>
              <div>
                <h4 className="text-xs font-bold text-white">Sonia Kapoor</h4>
                <span className="text-[10px] text-[#71717A] font-mono">VP Content, ByteScale</span>
              </div>
            </div>
          </div>

          <div className="border border-[#27272A] bg-[#18181B] p-8 rounded-xl shadow-sm">
            <div className="flex items-center space-x-1.5 mb-5 text-white">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-light mb-6">"Super Memory changed how we build tools. We loaded our internal design guidelines, and now Sarah and Julian write and design elements that look completely native. The row-level data isolation gives me peace of mind."</p>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center font-mono text-xs font-bold text-white">DL</div>
              <div>
                <h4 className="text-xs font-bold text-white">David Lin</h4>
                <span className="text-[10px] text-[#71717A] font-mono">CTO, HyperLoop Labs</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Accordion FAQ with Scroll Animation */}
      <motion.section 
        id="faq" 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A]"
      >
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-white font-semibold block mb-3 uppercase">INTELLIGENCE BRIEFING</span>
          <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-[#27272A] bg-[#18181B] rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <HelpCircle className={`w-4 h-4 text-white transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-[#27272A]"
                  >
                    <p className="p-6 text-xs text-[#A1A1AA] font-light leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-[#27272A] py-16 bg-[#09090B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Building2 className="w-4 h-4 text-black stroke-[2]" />
              </div>
              <span className="font-bold tracking-tight text-white text-lg">AK.AI</span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed font-light">The World's First Autonomous AI Company. Built with precision for the next wave of founders.</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-widest mb-4">PRODUCT</h4>
            <ul className="space-y-2 text-xs text-[#71717A]">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Options</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-widest mb-4">RESOURCES</h4>
            <ul className="space-y-2 text-xs text-[#71717A]">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Security Standards</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">API Integration Docs</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-widest mb-4">SECURITY CERTIFICATION</h4>
            <div className="flex items-center space-x-2 border border-[#27272A] bg-[#18181B] px-3.5 py-2 rounded-lg text-[#A1A1AA] text-[10px] font-mono">
              <Shield className="w-3.5 h-3.5 text-white shrink-0" />
              <span>AES-256 Cloud isolation active</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#27272A] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A]">
          <span>&copy; {new Date().getFullYear()} AK.AI Corp. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-light">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
