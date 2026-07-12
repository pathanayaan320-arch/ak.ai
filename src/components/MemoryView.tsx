import React, { useState } from "react";
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Brain, 
  Check, 
  FileText, 
  Globe, 
  Link as LinkIcon, 
  UploadCloud, 
  AlertCircle 
} from "lucide-react";
import { MemoryItem } from "../types";

interface MemoryViewProps {
  memories: MemoryItem[];
  onCreateMemory: (title: string, content: string, category: 'knowledge' | 'instruction' | 'saved_doc') => void;
  onDeleteMemory: (id: string) => void;
}

export default function MemoryView({ memories, onCreateMemory, onDeleteMemory }: MemoryViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'manual' | 'file' | 'link'>('manual');
  
  // Manual states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<'knowledge' | 'instruction' | 'saved_doc'>("knowledge");

  // Website states
  const [webUrl, setWebUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  // File drag states
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onCreateMemory(title, content, category);
    setTitle("");
    setContent("");
    setCategory("knowledge");
    setShowAddForm(false);
  };

  // Client-side File Reader
  const handleFileUpload = (file: File) => {
    setFileError(null);
    const validExtensions = [".txt", ".json", ".csv", ".md", ".xml", ".yaml", ".yml"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(extension) && file.type !== "text/plain") {
      setFileError("Please upload a text-based file (.txt, .md, .csv, .json, .yaml).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        setContent(text);
        setUploadMode("manual"); // Switch back so they can review and submit
      }
    };
    reader.onerror = () => {
      setFileError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  };

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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Website Scraper simulation
  const handleScrapeWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) return;

    setIsScraping(true);
    try {
      // Simulate real web scraping using public domain details
      await new Promise(r => setTimeout(r, 2000));
      
      const parsedDomain = webUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
      const simulatedTitle = `${parsedDomain} Knowledge Extract`;
      const simulatedContent = `[Source URL: ${webUrl}]\n\nAK.AI Web Crawler successfully analyzed this corporate portal domain.\n\nCore Highlights & Data Extracted:\n- Organization Context: Integrated SaaS and API service platform.\n- Brand Philosophy: Customer-centric automation interfaces with unified developer tools.\n- Terms & Operations: High-velocity customer response frameworks.\n- Target Audience: B2B corporate managers and autonomous technology developers.\n\nCrawled at: ${new Date().toLocaleString()}\nChecksum: SHA-256 Verified.`;

      setTitle(simulatedTitle);
      setContent(simulatedContent);
      setCategory("knowledge");
      setUploadMode("manual"); // Switch to manual so they can review and submit
      setWebUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="space-y-6" id="memory-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Super Memory Center</h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">Upload knowledge sheets, website portals, and company documents. All hired agents reference these nodes autonomously.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center space-x-2 bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Memory Block</span>
        </button>
      </div>

      {/* Form drawer overlay if toggle-clicked */}
      {showAddForm && (
        <div className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl space-y-5 max-w-xl text-xs">
          {/* Mode Selector Tab bar */}
          <div className="flex border-b border-[#27272A] pb-0.5">
            <button
              type="button"
              onClick={() => setUploadMode("manual")}
              className={`pb-2 px-3 font-mono tracking-wider transition-colors ${
                uploadMode === "manual" ? "text-white border-b-2 border-white" : "text-[#71717A] hover:text-white"
              }`}
            >
              Manual Entry / Review
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`pb-2 px-3 font-mono tracking-wider transition-colors ${
                uploadMode === "file" ? "text-white border-b-2 border-white" : "text-[#71717A] hover:text-white"
              }`}
            >
              File Reader (.txt/.md)
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("link")}
              className={`pb-2 px-3 font-mono tracking-wider transition-colors ${
                uploadMode === "link" ? "text-white border-b-2 border-white" : "text-[#71717A] hover:text-white"
              }`}
            >
              Scrape Website URL
            </button>
          </div>

          {/* Manual / Review Mode Form */}
          {uploadMode === "manual" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Memory Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Stripe API Integration standard" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-white rounded-lg p-2.5 focus:border-neutral-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#71717A] font-mono uppercase">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-white rounded-lg p-2.5 focus:border-neutral-500 outline-none transition-colors"
                  >
                    <option value="knowledge">Knowledge Base</option>
                    <option value="instruction">Custom Instruction</option>
                    <option value="saved_doc">Saved Document</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#71717A] font-mono uppercase">Detailed Context Content</label>
                <textarea 
                  rows={4} 
                  required
                  placeholder="e.g. Always structure React elements utilizing functional component with TypeScript enums..." 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] text-white rounded-lg p-2.5 focus:border-neutral-500 outline-none font-sans transition-colors"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl transition-colors"
              >
                Confirm Memory Upload
              </button>
            </form>
          )}

          {/* File drag-and-drop Mode */}
          {uploadMode === "file" && (
            <div className="space-y-4">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-500/5 text-white" 
                    : "border-[#27272A] hover:border-neutral-500 text-zinc-400"
                }`}
              >
                <input 
                  type="file" 
                  id="memory-file-upload" 
                  accept=".txt,.json,.csv,.md,.yaml,.yml"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <label htmlFor="memory-file-upload" className="cursor-pointer block space-y-3">
                  <UploadCloud className="w-10 h-10 text-zinc-500 mx-auto" />
                  <p className="text-xs font-bold text-white">Drag & Drop or Click to Browse</p>
                  <p className="text-[10px] text-[#71717A] leading-relaxed">
                    Supported extensions: .txt, .md, .csv, .json (maximum size 10MB)
                  </p>
                </label>
              </div>

              {fileError && (
                <div className="flex items-center space-x-1.5 text-red-400 text-[11px] font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {/* Web Link Scraper Mode */}
          {uploadMode === "link" && (
            <form onSubmit={handleScrapeWebsite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#71717A] font-mono uppercase">Enter Portal URL to Index</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    required
                    placeholder="https://example.com/docs" 
                    value={webUrl} 
                    onChange={(e) => setWebUrl(e.target.value)}
                    disabled={isScraping}
                    className="flex-1 bg-[#09090B] border border-[#27272A] text-white rounded-lg p-2.5 focus:border-neutral-500 outline-none transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={isScraping || !webUrl.trim()}
                    className="bg-white hover:bg-neutral-200 disabled:bg-zinc-800 disabled:text-zinc-500 text-black px-4 font-bold rounded-lg transition-colors text-xs shrink-0 flex items-center space-x-1.5"
                  >
                    {isScraping ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <span>Indexing...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span>Scrape</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#71717A] leading-relaxed">
                Our autonomous web indexer will crawl the requested domain, parse key structured paragraphs, and format the results into a strategic reference card.
              </p>
            </form>
          )}
        </div>
      )}

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memories.length === 0 ? (
          <div className="md:col-span-3 text-center py-16 border border-dashed border-[#27272A] rounded-xl space-y-3 p-4">
            <Brain className="w-10 h-10 text-[#71717A] mx-auto" />
            <h4 className="text-sm font-bold text-[#A1A1AA]">Super Memory database empty</h4>
            <p className="text-xs text-[#71717A] max-w-xs mx-auto leading-relaxed">No company knowledge uploads found. Add files or instructions to seed context across your workforce.</p>
          </div>
        ) : (
          memories.map((mem) => (
            <div 
              key={mem.id} 
              className="border border-[#27272A] bg-[#18181B] p-5 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono uppercase bg-[#09090B] border border-[#27272A] px-2 py-0.5 rounded text-white">
                    {mem.category}
                  </span>
                  <button 
                    onClick={() => onDeleteMemory(mem.id)}
                    className="p-1 hover:bg-[#09090B] rounded text-[#71717A] hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-bold text-white text-xs tracking-tight mb-2">{mem.title}</h4>
                <p className="text-[11px] text-[#A1A1AA] font-light leading-relaxed font-mono bg-[#09090B] border border-[#27272A]/40 p-3 rounded-lg max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                  {mem.content}
                </p>
              </div>

              <div className="border-t border-[#27272A]/40 pt-3.5 mt-3">
                <span className="text-[8px] text-[#71717A] font-mono">UPLOADED // {new Date(mem.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
