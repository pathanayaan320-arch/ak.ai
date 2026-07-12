import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Pin, 
  Paperclip, 
  Mic, 
  Image as ImageIcon,
  Building2,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  ChevronDown,
  ExternalLink,
  ChevronRight,
  User,
  ArrowRight,
  ChevronUp,
  Copy,
  Check,
  Eye
} from "lucide-react";
import { Chat, ChatMessage, Employee, Task } from "../types";

interface CeoChatViewProps {
  chats: Chat[];
  messages: ChatMessage[];
  employees: Employee[];
  tasks: Task[];
  activeChatId: string | null;
  ceoIsTyping: boolean;
  onSelectChat: (id: string) => void;
  onNewChat: (title?: string) => void;
  onDeleteChat: (id: string) => void;
  onTogglePin: (id: string, currentPin: boolean) => void;
  onSendMessage: (text: string) => void;
  onStartEmployeeChat?: (emp: Employee) => void;
}

export default function CeoChatView({
  chats,
  messages,
  employees,
  tasks,
  activeChatId,
  ceoIsTyping,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin,
  onSendMessage,
  onStartEmployeeChat
}: CeoChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleCopyOutput = (text: string, taskId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTaskId(taskId);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  // Scroll to bottom when messages list changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ceoIsTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simulated handlers for voice, attachment, images
  const triggerVoiceInput = () => {
    setInputText("Launching clothing line...");
    setUploadStatus("Simulated Voice input: 'Launching clothing line...'");
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const triggerFileUpload = () => {
    setUploadStatus("Uploading file attachment...");
    setTimeout(() => {
      setUploadStatus("Attached: system_spec.json (12 KB)");
      setInputText(prev => prev + " [File: system_spec.json] ");
    }, 1500);
  };

  const triggerImageUpload = () => {
    setUploadStatus("Uploading company design references...");
    setTimeout(() => {
      setUploadStatus("Attached: branding_moodboard.png");
      setInputText(prev => prev + " [Image: branding_moodboard.png] ");
    }, 1500);
  };

  // Drag and drop simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadStatus(`Uploaded via Drag-and-Drop: ${file.name}`);
      setInputText(prev => prev + ` [Dropped File: ${file.name}] `);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  // Custom simple Markdown-to-HTML formatter to keep things beautiful and version compliant
  const renderMarkdown = (text: string) => {
    if (!text) return "";
    
    // Replace headers
    let formatted = text
      .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-[#FAFAFA] mt-3 mb-1.5">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-[#FAFAFA] mt-4 mb-2">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-[#FAFAFA] mt-5 mb-3">$1</h2>');

    // Replace bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-400">$1</strong>');
    
    // Replace bullet points
    formatted = formatted.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="text-xs text-[#A1A1AA] ml-4 list-disc my-1">$1</li>');

    // Replace linebreaks for paragraphs
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
  };

  // Filter conversations
  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned);

  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] relative"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#09090B]/95 border-2 border-dashed border-[#27272A] rounded-2xl flex flex-col items-center justify-center space-y-4"
          >
            <Paperclip className="w-12 h-12 text-white animate-bounce" />
            <h3 className="text-xl font-bold text-white">Drop attachments to the AI CEO</h3>
            <p className="text-xs text-[#A1A1AA] font-light">Upload logs, assets, or memory files instantly</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Column: Sidebar Chats list */}
      <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-4 flex flex-col justify-between h-full shadow-sm">
        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#71717A] font-semibold uppercase tracking-wider">CONVERSATIONS</span>
            <button 
              onClick={onNewChat}
              className="p-1.5 rounded-lg border border-[#27272A] bg-[#09090B] text-[#A1A1AA] hover:text-white transition-colors"
              id="new-chat-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#71717A]" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] focus:border-neutral-500 focus:outline-none pl-9 pr-4 py-2 rounded-lg text-xs text-slate-300 font-sans"
            />
          </div>

          <div className="space-y-5">
            {/* Pinned chats */}
            {pinnedChats.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#71717A] font-mono flex items-center space-x-1.5">
                  <Pin className="w-3 h-3 fill-current" />
                  <span>PINNED</span>
                </span>
                {pinnedChats.map(c => (
                  <div 
                    key={c.id} 
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${activeChatId === c.id ? "bg-[#27272A] text-white border border-[#27272A]" : "hover:bg-[#09090B] text-[#A1A1AA]"}`}
                    onClick={() => onSelectChat(c.id)}
                  >
                    <span className="text-xs font-medium truncate flex-1">{c.title}</span>
                    <div className="flex items-center space-x-1">
                      <button onClick={(e) => { e.stopPropagation(); onTogglePin(c.id, true); }} className="text-[#A1A1AA] hover:text-white">
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }} className="text-[#71717A] hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unpinned chats */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#71717A] font-mono">CONVERSATION INBOX</span>
              {unpinnedChats.length === 0 && pinnedChats.length === 0 ? (
                <div className="text-[10px] text-[#71717A] font-mono py-4 text-center">Empty inbox.</div>
              ) : (
                unpinnedChats.map(c => (
                  <div 
                    key={c.id} 
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${activeChatId === c.id ? "bg-[#27272A] text-white border border-[#27272A]" : "hover:bg-[#09090B] text-[#A1A1AA]"}`}
                    onClick={() => onSelectChat(c.id)}
                  >
                    <span className="text-xs font-medium truncate flex-1">{c.title}</span>
                    <div className="flex items-center space-x-1">
                      <button onClick={(e) => { e.stopPropagation(); onTogglePin(c.id, false); }} className="text-[#71717A] hover:text-white">
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }} className="text-[#71717A] hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Employees direct chat list */}
            <div className="space-y-1.5 pt-3 border-t border-[#27272A]/50">
              <span className="text-[10px] text-[#71717A] font-mono flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>AI TEAM MEMBERS</span>
              </span>
              <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                {employees.map(emp => {
                  const activeChat = chats.find(c => c.employeeId === emp.id);
                  const isCurrent = activeChatId && activeChat && activeChatId === activeChat.id;
                  
                  return (
                    <div 
                      key={emp.id}
                      onClick={() => onStartEmployeeChat?.(emp)}
                      className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all ${isCurrent ? 'bg-[#27272A] text-white border border-[#27272A]' : 'hover:bg-[#09090B] text-[#A1A1AA]'}`}
                    >
                      <img 
                        src={emp.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                        alt={emp.name} 
                        className="w-6 h-6 rounded-full object-cover border border-[#27272A]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate leading-tight">{emp.name}</div>
                        <div className="text-[9px] text-[#71717A] truncate font-mono uppercase leading-none mt-0.5">{emp.role}</div>
                      </div>
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#27272A] pt-3 mt-3">
          <div className="flex items-center space-x-2 text-[10px] text-[#71717A] font-mono">
            <Building2 className="w-3.5 h-3.5" />
            <span>SESSION RUNTIME SECURE</span>
          </div>
        </div>
      </div>

      {/* Middle & Right: Active Chat Area & Live Visualisation panel */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Main Conversation Thread Column */}
        <div className="md:col-span-2 border border-[#27272A] bg-[#18181B] rounded-xl p-4 flex flex-col justify-between h-full overflow-hidden shadow-sm">
          {/* Chat header */}
          {(() => {
            const activeChat = chats.find(c => c.id === activeChatId);
            const employee = activeChat?.employeeId ? employees.find(e => e.id === activeChat.employeeId) : null;

            return (
              <div className="border-b border-[#27272A] pb-3 mb-3 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#27272A] flex items-center justify-center border border-[#27272A] overflow-hidden text-white">
                    {employee ? (
                      <img 
                        src={employee.avatar} 
                        alt={employee.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#FAFAFA]">{employee ? employee.name : "Elena (AI CEO)"}</h4>
                    <span className="text-[9px] text-[#71717A] font-mono uppercase tracking-tight">{employee ? employee.role : "CHIEF EXECUTIVE OFFICER"}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-[#A1A1AA] font-mono bg-[#09090B] px-2.5 py-1 border border-[#27272A] rounded-md">
                    MODEL: {employee ? employee.model || "GEMINI-3.5-FLASH" : "GEMINI-3.5-FLASH"}
                  </span>
                  {activeChatId && (
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this chat conversation? This will clear all its messages and disappear from the sidebar, but your projects and files will remain intact.")) {
                          onDeleteChat(activeChatId);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-[#27272A] bg-[#09090B] text-[#71717A] hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                      title="Delete Chat Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Messages listing */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#09090B] flex items-center justify-center border border-[#27272A] text-white">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">Launch Your Autonomous Project</h4>
                <p className="text-xs text-[#71717A] font-light max-w-sm leading-relaxed">
                  Give instructions like "Launch my tech newsletter" or "Create a fitness app". Elena will plan the workload, assign files, and deliver files.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl p-4 ${m.sender === "user" ? "bg-[#27272A] text-[#FAFAFA] border border-[#27272A]" : "bg-[#09090B] border border-[#27272A]"}`}>
                    <div className="flex items-center justify-between text-[10px] text-[#71717A] font-mono mb-2">
                      <span className="flex items-center space-x-1.5">
                        {m.sender === "user" ? (
                          <User className="w-3.5 h-3.5" />
                        ) : m.sender === "ceo" ? (
                          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-teal-400" />
                        )}
                        <span>
                          {m.sender === "user" 
                            ? "VIP Founder" 
                            : m.sender === "ceo" 
                            ? "Elena (CEO)" 
                            : (() => {
                                const activeChat = chats.find(c => c.id === m.chatId);
                                const emp = activeChat?.employeeId ? employees.find(e => e.id === activeChat.employeeId) : null;
                                return emp ? `${emp.name} (${emp.role})` : "Employee";
                              })()
                          }
                        </span>
                      </span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div 
                      className="text-xs leading-relaxed text-slate-300 font-sans space-y-2 markdown-body"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                    />

                    {/* Render Interactive Live Production Board under CEO message with project metadata */}
                    {m.sender === "ceo" && m.metadata?.projectId && (() => {
                      const projId = m.metadata.projectId;
                      const projectTasks = tasks.filter(t => t.projectId === projId);
                      const displayTasks = projectTasks.length > 0 ? projectTasks : (m.metadata.activeTasks || []);
                      
                      // Calculate overall progress
                      const overallProgress = displayTasks.length > 0 
                        ? Math.round(displayTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / displayTasks.length)
                        : 0;
                        
                      const isCompleted = overallProgress === 100;

                      return (
                        <div className="mt-4 border border-[#27272A] bg-[#09090B] rounded-xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-[#27272A]/60 pb-3">
                            <div className="flex items-center space-x-2">
                              <span className="flex h-2 w-2 relative">
                                {!isCompleted && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isCompleted ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                              </span>
                              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                                {isCompleted ? "Delivered Startup Specs & Code" : "Live Production Execution"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-white bg-[#18181B] px-2 py-0.5 rounded border border-[#27272A]">
                              {overallProgress}% COMPLETE
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] text-[#71717A] font-light">
                              <span>AGENTS DEPLOYMENT STATUS</span>
                              <span>{displayTasks.filter(t => t.status === "completed").length} / {displayTasks.length} DONE</span>
                            </div>
                            <div className="w-full bg-[#18181B] h-1.5 rounded-full overflow-hidden border border-[#27272A]/40">
                              <div 
                                className={`h-full transition-all duration-500 rounded-full bg-gradient-to-r ${isCompleted ? 'from-blue-500 to-indigo-600' : 'from-teal-500 to-emerald-400'}`}
                                style={{ width: `${overallProgress}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            {displayTasks.map((task: any) => {
                              // Live link to task state
                              const liveT = tasks.find(t => t.id === task.taskId || t.id === task.id);
                              const tStatus = liveT ? liveT.status : task.status;
                              const tProgress = liveT ? liveT.progress : (task.progress || 0);
                              const tOutput = liveT ? liveT.output : (task.output || "");
                              const tId = liveT ? liveT.id : (task.taskId || task.id);

                              return (
                                <div key={tId} className="bg-[#18181B] border border-[#27272A] rounded-lg p-3 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2.5">
                                      <img 
                                        src={task.employeeAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                                        alt={task.employeeName} 
                                        className="w-7 h-7 rounded-full object-cover border border-[#27272A]"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div>
                                        <h5 className="text-[11px] font-bold text-white leading-tight">{task.employeeName}</h5>
                                        <span className="text-[9px] text-[#71717A] font-mono uppercase tracking-tight block">{task.employeeRole || task.role}</span>
                                      </div>
                                    </div>

                                    {/* Status Badge */}
                                    {tStatus === "completed" ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/15 rounded-md">
                                        <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                                        DELIVERED
                                      </span>
                                    ) : tStatus === "review" ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-amber-500/5 px-2 py-0.5 border border-amber-500/15 rounded-md animate-pulse">
                                        <span className="w-1 h-1 bg-amber-400 rounded-full" />
                                        CEO REVIEW
                                      </span>
                                    ) : tStatus === "inprogress" ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/15 rounded-md">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping shrink-0" />
                                        COMPILING... {tProgress}%
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-slate-500/5 px-2 py-0.5 border border-slate-500/10 rounded-md">
                                        <span className="w-1 h-1 bg-slate-500 rounded-full" />
                                        SCHEDULED
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-1.5">
                                    <p className="text-[10px] text-slate-300 font-light leading-relaxed">
                                      <span className="font-semibold text-white">Deliverable:</span> {task.title}
                                    </p>
                                    
                                    {/* Small micro progress bar for the agent */}
                                    {tStatus !== "completed" && (
                                      <div className="w-full bg-[#09090B] h-1 rounded-full overflow-hidden border border-[#27272A]/20">
                                        <div 
                                          className={`h-full transition-all duration-300 rounded-full ${tStatus === 'inprogress' ? 'bg-blue-500 animate-pulse' : tStatus === 'review' ? 'bg-amber-500' : 'bg-slate-700'}`}
                                          style={{ width: `${tProgress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Inspect Result Button */}
                                  {tStatus === "completed" && tOutput && (
                                    <div className="pt-1">
                                      <button 
                                        onClick={() => setExpandedTaskId(expandedTaskId === tId ? null : tId)}
                                        className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 hover:border-blue-500/20"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>{expandedTaskId === tId ? "Hide Deliverable" : "Inspect Code / Results"}</span>
                                        {expandedTaskId === tId ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                                      </button>

                                      <AnimatePresence>
                                        {expandedTaskId === tId && (
                                          <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2.5 overflow-hidden border border-[#27272A] bg-[#09090B] rounded-lg"
                                          >
                                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#27272A] bg-[#18181B] text-[9px] font-mono text-[#71717A]">
                                              <span>DELIVERABLE OUTPUT</span>
                                              <button 
                                                onClick={() => handleCopyOutput(tOutput, tId)}
                                                className="inline-flex items-center gap-1 text-[#71717A] hover:text-white transition-colors cursor-pointer"
                                              >
                                                {copiedTaskId === tId ? (
                                                  <>
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied!</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy Output</span>
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                            <pre className="p-3 text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap select-text">
                                              {tOutput}
                                            </pre>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {isCompleted && (
                            <div className="bg-blue-950/20 border border-blue-500/10 p-3 rounded-xl flex items-start gap-2.5">
                              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-bounce" />
                              <div className="space-y-1">
                                <h6 className="text-[11px] font-bold text-white">Startup Assets Delivered!</h6>
                                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                                  CEO Elena has validated and closed the production. 10,000 Credits successfully consumed. Code, designs, and specifications are saved securely in your <span className="font-mono text-blue-400 font-semibold bg-[#18181B] px-1 py-0.5 rounded border border-[#27272A]">Files Vault</span>.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}

            {/* Typing status indicator */}
            {ceoIsTyping && (
              <div className="flex justify-start">
                <div className="bg-[#09090B] border border-[#27272A] max-w-[80%] rounded-xl p-4 flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] text-[#71717A] font-mono tracking-widest uppercase">
                    {(() => {
                      const activeChat = chats.find(c => c.id === activeChatId);
                      const emp = activeChat?.employeeId ? employees.find(e => e.id === activeChat.employeeId) : null;
                      return emp ? `${emp.name} IS TYPING...` : "CEO IS DELEGATING WORKLOAD...";
                    })()}
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Prompt inputs and uploads actions row */}
          <div className="border-t border-[#27272A] pt-3 mt-3 shrink-0 space-y-3">
            {uploadStatus && (
              <div className="text-[10px] font-mono text-emerald-400 bg-[#09090B] px-2.5 py-1.5 border border-[#27272A] rounded-lg flex items-center justify-between">
                <span>{uploadStatus}</span>
                <button onClick={() => setUploadStatus(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
            )}

            <div className="flex items-center space-x-2 bg-[#09090B] border border-[#27272A] px-3 py-2.5 rounded-xl focus-within:border-neutral-500">
              <button 
                onClick={triggerFileUpload}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#18181B] transition-colors"
                title="Attach file spec"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button 
                onClick={triggerImageUpload}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#18181B] transition-colors"
                title="Attach mood board"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={triggerVoiceInput}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#18181B] transition-colors"
                title="Simulate Voice command"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input 
                type="text" 
                placeholder={(() => {
                  const activeChat = chats.find(c => c.id === activeChatId);
                  const emp = activeChat?.employeeId ? employees.find(e => e.id === activeChat.employeeId) : null;
                  return emp ? `Send a message to ${emp.name}...` : "Give instruction to the CEO...";
                })()}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 bg-transparent border-none text-xs text-slate-300 outline-none focus:ring-0 font-sans"
              />

              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-white disabled:bg-[#18181B] disabled:text-[#71717A] text-black hover:bg-neutral-200 rounded-lg shadow-md transition-colors"
                id="send-msg-btn"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Workload & Coordination Panel */}
        <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-4 flex flex-col justify-between h-full overflow-hidden shadow-sm">
          <div className="space-y-4 overflow-y-auto pr-1">
            <span className="text-xs font-mono text-[#71717A] font-semibold uppercase tracking-wider block">COORDINATION MONITOR</span>

            {/* Check for active project simulation in messages */}
            {(() => {
              const lastMsgWithMeta = [...messages].reverse().find(m => m.sender === "ceo" && m.metadata?.projectId);
              if (!lastMsgWithMeta || !lastMsgWithMeta.metadata) {
                return (
                  <div className="text-center py-16 border border-dashed border-[#27272A] rounded-xl p-4 space-y-2">
                    <Building2 className="w-8 h-8 text-slate-700 mx-auto" />
                    <h5 className="text-xs font-bold text-[#A1A1AA]">Idle Standby</h5>
                    <p className="text-[10px] text-[#71717A] font-light leading-relaxed">No active project simulation. Elena is ready to delegate once your instruct her.</p>
                  </div>
                );
              }

              const { projectName, activeTasks, ceoThoughts } = lastMsgWithMeta.metadata;

              return (
                <div className="space-y-4">
                  <div className="border-b border-[#27272A] pb-3">
                    <span className="text-[10px] text-[#71717A] font-mono">ACTIVE DELEGATION PROJECT</span>
                    <h5 className="font-bold text-[#FAFAFA] text-xs tracking-tight mt-1">{projectName}</h5>
                  </div>

                  {ceoThoughts && (
                    <div className="bg-[#09090B] border border-[#27272A] p-3 rounded-lg text-[10px] text-[#A1A1AA] font-light leading-relaxed">
                      <span className="font-bold text-blue-400 font-mono uppercase text-[9px] block mb-1">CEO THOUGHTS</span>
                      {ceoThoughts}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <span className="text-[9px] text-[#71717A] font-mono uppercase">ACTIVE AI EMPLOYEES</span>
                    {activeTasks?.map((at: any) => {
                      const liveT = tasks.find(t => t.id === at.taskId || t.id === at.id);
                      const tStatus = liveT ? liveT.status : at.status;
                      const tProgress = liveT ? liveT.progress : (at.progress || 0);

                      return (
                        <div key={at.taskId || at.id} className="bg-[#09090B] border border-[#27272A] p-3 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-200 text-xs">{at.employeeName}</span>
                              <span className="text-[9px] text-[#71717A] block">{at.role || at.employeeRole}</span>
                            </div>
                            {tStatus === "completed" ? (
                              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                                DONE
                              </span>
                            ) : tStatus === "inprogress" ? (
                              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10 animate-pulse">
                                WORK {tProgress}%
                              </span>
                            ) : tStatus === "review" ? (
                              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/5 text-amber-400 border border-amber-500/10">
                                REVIEW
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#18181B] text-slate-500 border border-[#27272A]">
                                WAIT
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-[#A1A1AA] font-light line-clamp-1">{at.title}</p>
                            {tStatus !== "completed" && (
                              <div className="w-full bg-[#18181B] h-1 rounded-full overflow-hidden border border-[#27272A]/20">
                                <div 
                                  className={`h-full transition-all duration-300 rounded-full ${tStatus === 'inprogress' ? 'bg-blue-500' : tStatus === 'review' ? 'bg-amber-500' : 'bg-slate-700'}`}
                                  style={{ width: `${tProgress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="border-t border-[#27272A] pt-3 mt-4">
            <span className="text-[9px] font-mono text-[#71717A] block uppercase">Super Memory integration active.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
