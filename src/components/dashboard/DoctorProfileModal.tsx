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
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Stethoscope, 
  Phone, 
  Mail, 
  Info,
  Calendar,
  Clock,
  UserCheck
} from "lucide-react";
import { formatGenderFr } from "@/lib/utils";

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export function DoctorProfileModal({ 
  isOpen, 
  onClose, 
  doctor, 
  onApprove, 
  onReject,
  isProcessing 
}: DoctorProfileModalProps) {
  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-slate-900 border-white/10 text-white p-0 rounded-3xl">
        {/* Header avec Photo */}
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-blue-600/20 shrink-0 rounded-t-3xl">
          <div className="absolute -bottom-8 left-6">
            <div className="relative">
              <img 
                src={doctor.imageUrl || "/hero.png"} 
                alt={doctor.name} 
                className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl"
              />
            </div>
          </div>
        </div>

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

        <DialogFooter className="px-6 pb-6 gap-2 sm:justify-center bg-slate-900 shrink-0">
          <Button 
            variant="ghost" 
            className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-10 text-xs font-bold"
            onClick={onReject}
            disabled={isProcessing}
          >
            REFUSER
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-xs font-black italic shadow-lg shadow-primary/20"
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
