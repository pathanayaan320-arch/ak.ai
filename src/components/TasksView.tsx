import { useState } from "react";
import { motion } from "motion/react";
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Search,
  Users,
  Briefcase
} from "lucide-react";
import { Task } from "../types";

interface TasksViewProps {
  tasks: Task[];
}

export default function TasksView({ tasks }: TasksViewProps) {
  const [taskSearch, setTaskSearch] = useState("");

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
    t.employeeName.toLowerCase().includes(taskSearch.toLowerCase())
  );

  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const progressTasks = filteredTasks.filter(t => t.status === "inprogress");
  const reviewTasks = filteredTasks.filter(t => t.status === "review");
  const completedTasks = filteredTasks.filter(t => t.status === "completed");
  const failedTasks = filteredTasks.filter(t => t.status === "failed");

  const columns = [
    { title: "To Do", tasks: todoTasks, bg: "bg-[#18181B]", border: "border-[#27272A]", icon: Clock, iconColor: "text-white" },
    { title: "In Progress", tasks: progressTasks, bg: "bg-[#18181B]", border: "border-[#27272A]", icon: Briefcase, iconColor: "text-white" },
    { title: "Review Cycle", tasks: reviewTasks, bg: "bg-[#18181B]", border: "border-[#27272A]", icon: Users, iconColor: "text-white" },
    { title: "Completed", tasks: completedTasks, bg: "bg-[#18181B]", border: "border-[#27272A]", icon: CheckCircle, iconColor: "text-white" },
    { title: "Failed", tasks: failedTasks, bg: "bg-[#18181B]", border: "border-[#27272A]", icon: AlertCircle, iconColor: "text-white" }
  ];

  return (
    <div className="space-y-6" id="tasks-view">
      {/* Header & search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Autonomous Tasks Kanban Board</h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">Watch employees pull, review, and complete workspace deliverables automatically under the CEO's command.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#71717A]" />
          <input 
            type="text" 
            placeholder="Filter tasks/assignees..." 
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] focus:border-neutral-500 focus:outline-none pl-9 pr-4 py-2 rounded-lg text-xs text-white font-sans transition-colors"
          />
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {columns.map((col, idx) => (
          <div 
            key={idx} 
            className={`rounded-xl border ${col.border} ${col.bg} p-4 min-h-[450px] flex flex-col space-y-3 shrink-0 lg:shrink w-full min-w-[220px]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2 mb-1 shrink-0">
              <div className="flex items-center space-x-2">
                <col.icon className={`w-4 h-4 ${col.iconColor}`} />
                <span className="text-xs font-bold text-[#FAFAFA]">{col.title}</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#09090B] border border-[#27272A] px-2 py-0.5 rounded text-white">
                {col.tasks.length}
              </span>
            </div>

            {/* Column cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 max-h-[60vh] scrollbar-thin">
              {col.tasks.length === 0 ? (
                <div className="text-center py-12 text-[#71717A] text-[10px] font-mono border border-dashed border-[#27272A] rounded-xl">
                  Empty column
                </div>
              ) : (
                col.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="border border-[#27272A] bg-[#09090B] p-3.5 rounded-lg space-y-3 hover:border-neutral-500 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-[#71717A] block uppercase mb-1">{task.projectName}</span>
                      <h4 className="font-bold text-white text-xs leading-snug">{task.title}</h4>
                      <p className="text-[10px] text-[#A1A1AA] font-light mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
                    </div>

                    {/* Progress tracking */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[8px] font-mono text-[#71717A]">
                        <span>Task progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#18181B] rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>

                    {/* Assignee Footer */}
                    <div className="flex items-center space-x-2 border-t border-[#27272A] pt-2.5 mt-1">
                      <img 
                        src={task.employeeAvatar} 
                        alt={task.employeeName} 
                        className="w-5.5 h-5.5 rounded-full object-cover border border-[#27272A]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <span className="text-[10px] font-semibold text-[#FAFAFA] block truncate">{task.employeeName}</span>
                        <span className="text-[8px] text-[#71717A] font-mono block truncate">{task.employeeRole}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
