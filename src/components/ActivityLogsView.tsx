import { useState } from "react";
import { Search, Database, Calendar } from "lucide-react";
import { ActivityLog } from "../types";

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

export default function ActivityLogsView({ logs }: ActivityLogsViewProps) {
  const [logSearch, setLogSearch] = useState("");

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
    (l.employeeName && l.employeeName.toLowerCase().includes(logSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="activity-logs-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Corporate Activity Logs</h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">A real-time tamper-proof audit trail documenting all actions taken by the CEO and hired AI employees.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#71717A]" />
          <input 
            type="text" 
            placeholder="Search audit trail..." 
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] focus:border-neutral-500 focus:outline-none pl-9 pr-4 py-2 rounded-lg text-xs text-white font-sans transition-colors"
          />
        </div>
      </div>

      <div className="border border-[#27272A] bg-[#18181B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272A] bg-[#09090B] font-mono text-[#71717A] uppercase text-[10px] tracking-wider">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Agent</th>
                <th className="p-4 font-bold">Action</th>
                <th className="p-4 font-bold">Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#71717A] font-mono text-[10px]">
                    No corporate actions logged. Initiate a project plan first.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#27272A]/40 hover:bg-[#09090B]/30 transition-colors">
                    <td className="p-4 font-mono text-[#71717A] text-[10px] shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-[#FAFAFA] block">{log.employeeName || "Executive Suite"}</span>
                        {log.employeeRole && <span className="text-[9px] text-[#71717A] font-mono block">{log.employeeRole}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[10px] bg-[#09090B] border border-[#27272A] px-2 py-0.5 rounded text-white">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-[#A1A1AA] font-light leading-relaxed max-w-sm">
                      {log.details}
                      {log.projectName && <span className="text-[9px] text-[#71717A] font-mono block mt-1">Project: {log.projectName}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
