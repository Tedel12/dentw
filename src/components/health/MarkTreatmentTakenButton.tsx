"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logTreatmentTake } from "@/lib/actions/health";
import { toast } from "sonner";

interface MarkTreatmentTakenButtonProps {
  treatmentId: string;
}

export function MarkTreatmentTakenButton({ treatmentId }: MarkTreatmentTakenButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleMarkTaken = async () => {
    if (loading || cooldown) return;
    setLoading(true);
    const result = await logTreatmentTake(treatmentId);

    if (result.success) {
      toast.success("Prise enregistrée avec succès");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
      router.refresh();
    } else {
      toast.error(result.error || "Impossible d'enregistrer la prise");
    }
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white"
      onClick={handleMarkTaken}
      disabled={loading || cooldown}
    >
      {loading ? "Enregistrement..." : cooldown ? "Patientez..." : "Marquer comme pris"}
    </Button>
  );
}
