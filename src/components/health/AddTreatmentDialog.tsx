"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddPrescriptionForm } from "@/components/health/AddPrescriptionForm";

interface AddTreatmentDialogProps {
  patientId: string;
}

export function AddTreatmentDialog({ patientId }: AddTreatmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg hover:shadow-primary/20">
          <Plus className="w-4 h-4" /> Ajouter un traitement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un traitement</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle prescription ou un traitement a votre carnet de sante.
          </DialogDescription>
        </DialogHeader>
        <AddPrescriptionForm
          patientId={patientId}
          onSuccess={async () => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
