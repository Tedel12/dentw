"use client";

import { useUser } from "@clerk/nextjs";
import { 
  HeartPulse, ShieldCheck, MapPin, 
  Phone, UserCheck, Info, Calendar, Clock,
  Stethoscope, Mail, ShieldAlert
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/brand";

interface DoctorProfileModalProps {
  doctor: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export function DoctorProfileModal({
  doctor,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}: DoctorProfileModalProps) {
  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-white/10 bg-[#020617] text-white rounded-[2.5rem] shadow-2xl">
        <div className="pt-12 px-6 pb-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic tracking-tighter">Dr. {doctor.name}</h2>
            <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                    {doctor.speciality}
                </Badge>
                {doctor.verificationStatus === 'VERIFIED' && (
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                        <ShieldCheck className="size-3" /> CERTIFIÉ
                    </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Téléphone</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Phone className="size-3 text-primary" />
                    {doctor.phone}
                </div>
             </div>
             <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Honoraires de base</p>
                <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                    <Stethoscope className="size-3" />
                    {doctor.basePrice ? `${doctor.basePrice} FCFA` : "À définir"}
                </div>
             </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
                <Calendar className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Disponibilités</p>
                    <p className="font-medium text-slate-200 text-xs">{doctor.availableDays || "Lundi - Vendredi"}</p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">
                        <Clock className="size-3 inline mr-1" />
                        {doctor.workingHoursStart} - {doctor.workingHoursEnd}
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cabinet / Lieu de travail</p>
                    <p className="font-medium text-slate-200">{doctor.practiceAddress || "Adresse non renseignée"}</p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">{doctor.workplaceType || "Pratique libérale"}</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <UserCheck className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Numéro d'Ordre / Licence</p>
                    <p className="font-mono font-bold text-slate-200">{doctor.licenseNumber}</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">À propos du praticien</p>
                    <p className="italic leading-relaxed">
                        {doctor.bio || "Aucune description fournie par le praticien."}
                    </p>
                </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200/90 leading-relaxed font-medium">
              <strong>Sécurité :</strong> En autorisant, ce praticien pourra consulter vos antécédents, traitements et constantes pendant <strong>24 heures</strong>. L'accès sera automatiquement révoqué ensuite.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white/5 gap-3">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl h-12 font-bold text-slate-400 hover:text-white hover:bg-white/5"
            onClick={onReject}
            disabled={isProcessing}
          >
            REFUSER
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-black italic rounded-xl h-12 shadow-lg shadow-primary/20"
            onClick={onApprove}
            disabled={isProcessing}
          >
            {isProcessing ? "TRAITEMENT..." : "AUTORISER"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
