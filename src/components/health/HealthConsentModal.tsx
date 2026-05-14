"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function HealthConsentModal({ isOpen, onAccept }: { isOpen: boolean; onAccept: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic">Engagement de Confidentialité</DialogTitle>
          <DialogDescription className="text-slate-400">
            Pour accéder à vos données de santé, nous appliquons un chiffrement de bout en bout. 
            En validant, vous acceptez les conditions de responsabilité partagée concernant la gestion de votre PIN de sécurité.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox id="consent" checked={checked} onCheckedChange={(c) => setChecked(c as boolean)} />
          <Label htmlFor="consent" className="text-sm font-bold">J'accepte les conditions de responsabilité partagée.</Label>
        </div>
        <DialogFooter>
          <Button onClick={onAccept} disabled={!checked} className="bg-primary hover:bg-primary/90 font-black italic rounded-xl">
            Accéder à mes données
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
