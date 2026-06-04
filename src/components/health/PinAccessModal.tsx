"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck, Loader2, KeyRound, Fingerprint, AlertCircle } from "lucide-react";
import { getUserPinStatus, verifyUserPin, updateExportPin } from "@/lib/actions/users";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PinAccessModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function PinAccessModal({ isOpen, onSuccess }: PinAccessModalProps) {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkStatus() {
      const res = await getUserPinStatus();
      setHasPin(res.hasPin);
    }
    if (isOpen) checkStatus();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError("Le code PIN doit contenir au moins 4 chiffres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (hasPin) {
        const res = await verifyUserPin(pin);
        if (res.success) {
          toast.success("Identité vérifiée");
          onSuccess();
        } else {
          setError(res.error || "Code PIN incorrect");
        }
      } else {
        const res = await updateExportPin(pin);
        if (res.success) {
          toast.success("Code PIN créé avec succès");
          onSuccess();
        } else {
          setError(res.error || "Erreur lors de la création");
        }
      }
    } catch (err) {
      setError("Une erreur technique est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] w-[95vw] rounded-[2rem] bg-[#020617] border-white/10 p-0 overflow-hidden shadow-2xl">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
              <Lock className="size-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-white">
                {hasPin ? "Accès Sécurisé" : "Créer votre PIN"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-medium italic text-xs md:text-sm leading-relaxed">
                {hasPin 
                  ? "Entrez votre code secret pour accéder à vos données de santé personnelles."
                  : "Choisissez un code à 4 chiffres pour protéger l'accès à votre carnet digital."}
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPin(val);
                    setError("");
                  }}
                  className="h-16 bg-white/5 border-white/10 rounded-2xl text-center text-3xl tracking-[0.5em] font-black focus:ring-primary pl-12 shadow-inner"
                  autoFocus
                />
              </div>
              
              <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 text-[10px] font-black uppercase text-center flex items-center justify-center gap-2"
                    >
                        <AlertCircle className="size-3" /> {error}
                    </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button 
                disabled={loading || pin.length < 4} 
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black italic shadow-xl text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
              {hasPin ? "DÉVERROUILLER" : "CONFIRMER LE CODE"}
            </Button>
          </form>

          <div className="pt-4 flex items-center justify-center gap-2 text-slate-600">
             <Fingerprint className="size-4" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em]">Protection par design Benin Santé</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
