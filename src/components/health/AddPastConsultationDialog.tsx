"use client";

import { useState } from "react";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Plus } from "lucide-react";
import { AddPrescriptionForm } from "./AddPrescriptionForm";

export function AddPastConsultationDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl gap-2">
            <Plus className="w-4 h-4" /> Ajouter un antécédent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#020617] border-white/10 text-white rounded-[2rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-4 text-left">
            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/10">
              <History className="size-6 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-tight">Historique Médical</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium text-xs md:text-sm italic">
                Ajoutez manuellement un acte passé (ordonnance, radio, suivi) à votre carnet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <AddPrescriptionForm
                patientId="" // Will be resolved by the server action using authenticated user
                onSuccess={async () => {
                    setOpen(false);
                    window.location.reload();
                }}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
