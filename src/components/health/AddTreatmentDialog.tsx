"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Activity, Pill, History, Microscope, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddPrescriptionForm } from "./AddPrescriptionForm";

interface AddTreatmentDialogProps {
  patientId: string;
}

export function AddTreatmentDialog({ patientId }: AddTreatmentDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white font-black italic rounded-xl gap-2 shadow-lg shadow-primary/20">
          <Plus className="size-4" />
          AJOUTER UN ACTE
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#020617] border-white/10 text-white rounded-[2rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-4 text-left">
            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/10">
              <Activity className="size-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-tight">Nouvel Acte Médical</DialogTitle>
              <DialogDescription className="text-slate-400 font-medium text-xs md:text-sm italic">
                Enregistrez une ordonnance, un examen ou une note de suivi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <AddPrescriptionForm
            patientId={patientId}
            onSuccess={async () => {
                setOpen(false);
                router.refresh();
            }}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
