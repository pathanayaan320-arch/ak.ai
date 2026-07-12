import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Plus, 
  Calendar,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Project, FileAsset } from "../types";

interface ProjectsViewProps {
  projects: Project[];
  files: FileAsset[];
  onNavigate: (page: string) => void;
}

export default function ProjectsView({ projects, files, onNavigate }: ProjectsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProj = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]" id="projects-view">
      {/* Left Column: Projects List */}
      <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-4 flex flex-col justify-between h-full overflow-hidden">
        <div className="space-y-4 overflow-y-auto pr-1">
          <span className="text-xs font-mono text-[#FAFAFA] font-semibold uppercase tracking-wider block">PROJECT PORTFOLIO</span>

          {projects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#27272A] rounded-xl space-y-3 p-4">
              <Building2 className="w-8 h-8 text-[#71717A] mx-auto" />
              <h4 className="text-xs font-bold text-[#A1A1AA]">Portfolio Empty</h4>
              <p className="text-[10px] text-[#71717A] font-light leading-relaxed">No projects exist yet. Start a conversation with Elena (CEO) to kick off your first autonomous startup.</p>
              <button 
                onClick={() => onNavigate("ceo-chat")}
                className="bg-white text-black hover:bg-neutral-200 transition-colors text-[10px] font-bold px-3.5 py-2 rounded-lg"
              >
                Launch CEO Briefing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => {
                const isSelected = selectedProjectId ? selectedProjectId === proj.id : projects[0].id === proj.id;
                return (
                  <div 
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all ${isSelected ? "bg-[#27272A] border-[#27272A] text-[#FAFAFA]" : "bg-[#09090B]/40 border-[#27272A] hover:border-neutral-500 text-[#A1A1AA]"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-xs truncate max-w-[70%]">{proj.name}</h4>
                      <span className="text-[8px] font-mono uppercase bg-[#18181B] px-2 py-0.5 rounded border border-[#27272A] text-white">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] font-light line-clamp-1 mb-3">{proj.description}</p>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[8px] font-mono text-[#71717A]">
                        <span>Speed completion</span>
                        <span>{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#09090B] rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#27272A] pt-3 mt-3">
          <span className="text-[9px] font-mono text-[#71717A] block uppercase">Continuous telemetry tracking active</span>
        </div>
      </div>

      {/* Middle & Right: Selected Project Tracker Details */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Project timeline tracker */}
        <div className="md:col-span-2 border border-[#27272A] bg-[#18181B] rounded-xl p-4 flex flex-col justify-between h-full overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-1">
            <span className="text-xs font-mono text-[#FAFAFA] font-semibold uppercase tracking-wider block">PROJECT TIMELINE TIMETABLE</span>

            {selectedProj ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedProj.name}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-1.5 leading-relaxed font-light">{selectedProj.description}</p>
                </div>

                <div className="space-y-4 relative pl-0.5">
                  <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-[#27272A]" />
                  
                  {selectedProj.timeline?.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 text-xs pl-0.5">
                      <div className="w-6 h-6 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center shrink-0 z-10 font-mono text-[9px]">
                        {event.type === "task_complete" ? (
                          <span className="text-white">✓</span>
                        ) : event.type === "ceo_decision" ? (
                          <span className="text-white">★</span>
                        ) : (
                          <span className="text-[#71717A]">•</span>
                        )}
                      </div>
                      <div className="flex-1 bg-[#09090B]/60 border border-[#27272A] p-3.5 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">{event.title}</span>
                          <span className="text-[9px] text-[#71717A] font-mono">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A1A1AA] font-light leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-[#71717A] text-xs font-mono">Standby. No active selection.</div>
            )}
          </div>

          <div className="border-t border-[#27272A] pt-3 mt-4">
            <span className="text-[9px] font-mono text-[#71717A] block uppercase">Continuous audit timelines</span>
          </div>
        </div>

        {/* Generated files list for the project */}
        <div className="border border-[#27272A] bg-[#18181B] rounded-xl p-4 flex flex-col justify-between h-full overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-1">
            <span className="text-xs font-mono text-[#FAFAFA] font-semibold uppercase tracking-wider block">DELIVERED FILE ASSETS</span>

            {(() => {
              if (!selectedProj) return null;
              const projectFiles = files.filter(f => f.projectId === selectedProj.id);
              
              if (projectFiles.length === 0) {
                return (
                  <div className="text-center py-12 text-[#71717A] text-[10px] border border-dashed border-[#27272A] rounded-xl p-4">
                    No files generated yet. Standby as agents compile assets.
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {projectFiles.map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => onNavigate("files")}
                      className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] hover:border-neutral-500 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-white shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-medium text-[#FAFAFA] truncate block">{file.name}</span>
                          <span className="text-[9px] text-[#71717A] font-mono block uppercase">{file.type}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#71717A]" />
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="border-t border-[#27272A] pt-3 mt-4">
            <button 
              onClick={() => onNavigate("files")}
              className="w-full py-2 bg-[#09090B] text-[#A1A1AA] hover:text-white border border-[#27272A] rounded-lg text-[10px] font-mono text-center uppercase block transition-colors"
            >
              Open File Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
