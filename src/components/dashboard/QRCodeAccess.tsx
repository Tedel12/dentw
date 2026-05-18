"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, ShieldAlert, Loader2, Timer, CheckCircle2 } from "lucide-react";
import { generateQRToken } from "@/lib/actions/qr-access";
import { toast } from "sonner";

export function QRCodeAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const handleGenerate = async () => {
    setIsLoading(true);
    const res = await generateQRToken();
    setIsLoading(false);
    
    if (res.success && res.token && res.expiresAt) {
      setToken(res.token);
      setExpiresAt(new Date(res.expiresAt));
      setShowWarning(false);
    } else {
      toast.error(res.error || "Erreur de génération");
    }
  };

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff === 0) {
        setToken(null);
        setExpiresAt(null);
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline" 
        className="h-12 px-6 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold gap-2"
      >
        <QrCode className="w-5 h-5" /> PASS EXPRESS QR
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setToken(null);
          setExpiresAt(null);
          setShowWarning(true);
        }
      }}>
        <DialogContent className="sm:max-w-[420px] bg-slate-900 border-white/10 text-white p-0 rounded-3xl">
          {showWarning ? (
            <>
              <div className="p-8 bg-amber-500/10 border-b border-amber-500/20 rounded-t-3xl">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black italic text-amber-500">Pass Express QR</h2>
                <p className="text-amber-200/60 text-sm font-medium mt-2 leading-relaxed">
                  Le Pass Express permet à un médecin de consulter votre dossier instantanément en scannant ce code.
                </p>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-xs text-slate-400">Le code expire automatiquement après 15 minutes.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-xs text-slate-400">L'accès accordé au médecin est limité à 24 heures.</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 text-center">Responsabilité</p>
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed italic">
                    "Je comprends que toute personne scannant ce code aura accès à mes données de santé sensibles."
                  </p>
                </div>
              </div>
              <DialogFooter className="p-8 pt-0 gap-3">
                <Button variant="ghost" className="flex-1 text-slate-500" onClick={() => setIsOpen(false)}>ANNULER</Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black italic rounded-xl h-11"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "GÉNÉRER LE CODE"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-8 flex flex-col items-center space-y-8">
               <div className="text-center">
                  <h2 className="text-xl font-black italic">Votre Pass Express</h2>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Présentez ce code à votre praticien</p>
               </div>

               <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/20 ring-8 ring-primary/5">
                  <QRCodeSVG 
                    value={token || ""} 
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
               </div>

               <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20 text-primary">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-black italic">{formatTime(timeLeft)} restant</span>
               </div>

               <p className="text-[10px] text-slate-500 text-center max-w-[250px] leading-relaxed">
                Ce code est à usage unique et sécurisé. Ne le partagez pas sur les réseaux sociaux.
               </p>

               <Button 
                  variant="ghost" 
                  className="w-full text-slate-400 hover:text-white"
                  onClick={() => {
                    setToken(null);
                    setExpiresAt(null);
                    setShowWarning(true);
                  }}
                >
                  RÉGÉNÉRER UN CODE
               </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
