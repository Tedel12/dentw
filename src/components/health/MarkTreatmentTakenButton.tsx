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

  const handleMarkTaken = async () => {
    if (loading) return;
    setLoading(true);
    const result = await logTreatmentTake(treatmentId);

    if (result.success) {
      toast.success("Traitement marqué comme terminé");
      router.refresh();
    } else {
      toast.error(result.error || "Impossible de mettre à jour le traitement");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
      onClick={handleMarkTaken}
      disabled={loading}
    >
      {loading ? "Enregistrement..." : "Marquer comme pris"}
    </Button>
  );
}
