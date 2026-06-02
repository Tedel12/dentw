"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logTreatmentTake } from "@/lib/actions/health";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface MarkTreatmentTakenButtonProps {
  treatmentId: string;
}

export function MarkTreatmentTakenButton({ treatmentId }: MarkTreatmentTakenButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTaken, setIsTaken] = useState(false);

  const handleMarkTaken = async () => {
    if (loading || isTaken) return;
    setLoading(true);
    const result = await logTreatmentTake(treatmentId);

    if (result.success) {
      toast.success("Traitement marqué comme terminé");
      setIsTaken(true);
      setTimeout(() => {
        setIsTaken(false);
        router.refresh();
      }, 2000);
    } else {
      toast.error(result.error || "Impossible de mettre à jour le traitement");
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isTaken ? "secondary" : "outline"}
      size="sm"
      className={`rounded-full font-bold transition-all active:scale-95 ${isTaken ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'border-primary text-primary hover:bg-primary hover:text-white'}`}
      onClick={handleMarkTaken}
      disabled={loading || isTaken}
    >
      {loading ? (
        "Enregistrement..."
      ) : isTaken ? (
        <>
            <Check className="size-3 mr-1" /> Pris
        </>
      ) : (
        "Marquer comme pris"
      )}
    </Button>
  );
}
