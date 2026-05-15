"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, Calendar, Shield, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllAsRead 
} from "@/lib/actions/notifications";
import { respondToReschedule } from "@/lib/actions/appointments";
import { respondToAccessRequest } from "@/lib/actions/health";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    const res = await getNotifications();
    if (res.success) {
      setNotifications(res.notifications || []);
      setUnreadCount(res.notifications?.filter((n: any) => !n.isRead).length || 0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleAction = async (notif: any, action: "ACCEPT" | "REJECT") => {
    try {
      if (notif.type === "RESCHEDULE_REQUEST") {
        // On suppose que le link contient l'ID du RDV ou qu'on peut l'extraire
        // Pour faire simple ici, on va rediriger vers la page dédiée si besoin
        // Mais l'idéal est d'avoir l'ID direct. 
        // Amélioration: Stocker l'ID de la ressource dans la notification
        toast.info("Redirection vers le rendez-vous...");
        router.push(notif.link || "/dashboard");
      } else if (notif.type === "HEALTH_ACCESS") {
        router.push("/dashboard/health");
      }
      await handleMarkAsRead(notif.id);
      setIsOpen(false);
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "RESCHEDULE_REQUEST":
      case "RESCHEDULE_RESPONSE":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "HEALTH_ACCESS":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "APPOINTMENT_CONFIRMED":
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold border-2 border-background animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl rounded-2xl" align="end">
        <div className="p-4 border-b border-primary/10 flex justify-between items-center">
          <h3 className="font-black text-lg uppercase tracking-tighter text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs text-primary hover:text-primary/80 font-bold">
              Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 transition-colors hover:bg-primary/5 cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => {
                    if (!n.isRead) handleMarkAsRead(n.id);
                    if (n.link) router.push(n.link);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-primary/20' : 'bg-muted'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-bold leading-none ${!n.isRead ? 'text-white' : 'text-muted-foreground'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.content}
                      </p>
                      
                      {n.type === "RESCHEDULE_REQUEST" && !n.isRead && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm" 
                            className="h-7 text-[10px] font-bold bg-green-500 hover:bg-green-600"
                            onClick={() => handleAction(n, "ACCEPT")}
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
