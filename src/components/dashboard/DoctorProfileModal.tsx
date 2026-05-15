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

        <div className="pt-12 px-6 pb-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <h2 className="text-xl font-black italic">Dr. {doctor.name}</h2>
            <p className="text-primary text-xs font-bold uppercase tracking-widest">{doctor.speciality}</p>
          </div>

          <div className="text-sm text-slate-300 leading-relaxed">
            Le Dr. {doctor.name} souhaite accéder à votre carnet de santé digital pour assurer votre suivi médical.
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            <p className="text-[10px] text-amber-200/80 leading-relaxed">
              En autorisant, le praticien pourra consulter vos données de santé pendant 24 heures.
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
