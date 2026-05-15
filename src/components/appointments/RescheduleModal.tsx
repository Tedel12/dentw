"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, MessageSquare } from "lucide-react";
import { requestReschedule } from "@/lib/actions/appointments";
import { toast } from "sonner";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  currentDate: Date;
  currentTime: string;
  proposedBy: "PATIENT" | "DOCTOR";
}

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30"
];

export function RescheduleModal({ 
  isOpen, 
  onClose, 
  appointmentId, 
  currentDate, 
  currentTime,
  proposedBy 
}: RescheduleModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time || !reason.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    const res = await requestReschedule({
      appointmentId,
      newDate: date.toISOString(),
      newTime: time,
      reason: reason.trim(),
      proposedBy
    });

    if (res.success) {
      toast.success("Demande de report envoyée !");
      onClose(); // This will close the modal
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card border-primary/20 rounded-[2rem] p-0 shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
            <CalendarIcon className="text-primary w-6 h-6" /> Reporter le RDV
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Proposez un nouvel horaire pour votre consultation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6">
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-white font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" /> Nouvelle Date
              </Label>
              <div className="flex justify-center bg-primary/5 p-2 rounded-2xl border border-primary/10">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Nouvel Horaire
                </Label>
                <Select onValueChange={setTime} value={time}>
                  <SelectTrigger className="bg-primary/5 border-primary/10 text-white rounded-xl h-11">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/20 text-white">
                    {TIME_SLOTS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-black tracking-widest block mb-1">Actuel</Label>
                <div className="h-11 flex items-center px-4 bg-muted/20 rounded-xl border border-white/5 text-muted-foreground text-sm italic">
                  {format(currentDate, "dd/MM")} à {currentTime}
                </div>
              </div>
            </div>

            <div className="space-y-2 pb-4">
              <Label className="text-white font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Motif du report
              </Label>
              <Textarea 
                placeholder="Ex: Urgence imprévue, changement d'emploi du temps..." 
                className="bg-primary/5 border-primary/10 text-white rounded-xl resize-none h-24"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2 gap-2 border-t border-white/5">
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/5 rounded-xl font-bold">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 shadow-lg shadow-primary/20"
          >
            {loading ? "Envoi..." : "Envoyer la proposition"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
