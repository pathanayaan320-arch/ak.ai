import { Bell, Sparkles, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import { SystemNotification } from "../types";

interface NotificationsViewProps {
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onNavigate: (page: string) => void;
}

export default function NotificationsView({ 
  notifications, 
  onMarkAsRead,
  onDeleteNotification,
  onNavigate
}: NotificationsViewProps) {
  return (
    <div className="space-y-6" id="notifications-view">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Workspace Alerts & Updates</h2>
        <p className="text-xs text-[#A1A1AA] font-light mt-1">Stay updated with structural project deliveries, task progress reports, and automated CEO updates.</p>
      </div>

      <div className="border border-[#27272A] bg-[#18181B] rounded-xl overflow-hidden p-6">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-[#71717A] font-mono text-[10px] space-y-2">
              <Bell className="w-8 h-8 text-[#71717A] mx-auto" />
              <span>Inbox empty. No new notifications.</span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`flex items-start justify-between p-4 rounded-xl border transition-all ${notif.isRead ? "bg-[#09090B]/40 border-[#27272A]/80" : "bg-[#27272A]/40 border-neutral-400 shadow-sm"}`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-white">
                    {notif.type === "task_completed" ? (
                      <CheckCircle className="w-4.5 h-4.5 text-white" />
                    ) : notif.type === "ceo_alert" ? (
                      <AlertTriangle className="w-4.5 h-4.5 text-white" />
                    ) : (
                      <Sparkles className="w-4.5 h-4.5 text-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-xs font-bold text-white ${notif.isRead ? "" : "text-white"}`}>{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] font-light mt-1 max-w-xl leading-relaxed">{notif.description}</p>
                    <span className="text-[9px] text-[#71717A] font-mono mt-1.5 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-4 self-start">
                  {!notif.isRead && (
                    <button 
                      onClick={() => onMarkAsRead(notif.id)}
                      className="p-1.5 text-[#71717A] hover:text-white rounded-lg transition-colors text-[10px] font-mono border border-transparent hover:border-[#27272A] bg-[#09090B]/30"
                    >
                      Mark read
                    </button>
                  )}
                  <button 
                    onClick={() => onDeleteNotification(notif.id)}
                    className="p-1.5 text-[#71717A] hover:text-red-400 hover:bg-[#27272A]/40 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
