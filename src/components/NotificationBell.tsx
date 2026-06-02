"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, Calendar, Shield, Info, HeartPulse, Clock, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from "@/lib/actions/notifications";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";

export function NotificationBell() {
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    const res = await getNotifications();
    if (res.success) {
      setNotifications(res.notifications || []);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead();
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications marquées comme lues");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const res = await deleteNotification(id);
    if (res.success) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleAction = async (notif: any, action: "ACCEPT" | "REJECT") => {
    try {
      if (notif.type === "RESCHEDULE_REQUEST") {
        toast.info("Redirection...");
        router.push(notif.link || "/appointments");
      }
      await handleMarkAsRead(notif.id);
      setIsOpen(false);
    } catch (error) {
      toast.error("Erreur");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT_CONFIRMED": return <Calendar className="size-4 text-emerald-500" />;
      case "APPOINTMENT_CANCELLED": return <X className="size-4 text-red-500" />;
      case "HEALTH_ACCESS": return <Shield className="size-4 text-primary" />;
      case "RESCHEDULE_REQUEST": return <RotateCcw className="size-4 text-amber-500" />;
      default: return <Info className="size-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/5 size-9 md:size-10">
          <Bell className="size-5 md:size-6 text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[8px] md:text-[10px] font-black text-white ring-2 ring-[#020617] animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[90vw] xs:w-[350px] md:w-[400px] p-0 bg-slate-900 border-white/10 shadow-2xl rounded-[1.5rem] md:rounded-[2rem] overflow-hidden text-left">
        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <h3 className="font-black italic text-sm md:text-lg text-white uppercase tracking-tighter">Notifications</h3>
              {unreadCount > 0 && <Badge className="bg-primary/20 text-primary border-none text-[8px] md:text-[10px] px-2">{unreadCount} NOUVELLES</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllRead}
                className="text-[9px] md:text-[10px] font-black uppercase text-primary hover:bg-primary/10 h-7 md:h-8"
            >
              Tout lire
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px] md:h-[450px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 space-y-3 opacity-20">
              <Bell className="size-12 text-slate-500" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 md:p-5 transition-all cursor-pointer relative group ${!n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}
                  onClick={() => {
                    handleMarkAsRead(n.id);
                    if (n.link) {
                        router.push(n.link);
                        setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex gap-3 md:gap-4">
                    <div className={`size-9 md:size-11 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${!n.isRead ? 'bg-primary/20 shadow-lg shadow-primary/10' : 'bg-slate-800'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className={`text-xs md:text-sm leading-tight uppercase font-black tracking-tighter ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                            {n.title}
                            </p>
                            <p className={`text-[11px] md:text-xs leading-snug mt-1 ${!n.isRead ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                            {n.content}
                            </p>
                        </div>
                        <button 
                            onClick={(e) => handleDelete(e, n.id)}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-all md:opacity-0 group-hover:opacity-100 shrink-0"
                        >
                            <X className="size-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                          <Clock className="size-2.5 text-slate-500" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {format(new Date(n.createdAt), "dd MMM, HH:mm", { locale: fr })}
                          </span>
                      </div>
                      
                      {n.type === "RESCHEDULE_REQUEST" && !n.isRead && (
                         <div className="pt-3 flex gap-2">
                            <Button 
                                size="sm" 
                                className="h-7 md:h-8 flex-1 bg-primary hover:bg-primary/90 rounded-lg text-[9px] font-black uppercase italic"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(n, "ACCEPT");
                                }}
                            >
                                Détails & Répondre
                            </Button>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
