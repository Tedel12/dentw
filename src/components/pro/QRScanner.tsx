"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2, ShieldCheck, X } from "lucide-react";
import { validateQRToken } from "@/lib/actions/qr-access";
import { toast } from "sonner";

interface QRScannerProps {
  onSuccess: (patientId: string) => void;
}

export function QRScanner({ onSuccess }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isOpen) {
      // Small timeout to ensure the Dialog content is rendered in the DOM
      const timer = setTimeout(() => {
        const element = document.getElementById("qr-reader");
        if (!element) return;

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          /* verbose= */ false
        );

        scanner.render(
          async (decodedText) => {
            if (isValidating) return;
            
            setIsValidating(true);
            scanner?.pause(true);
            
            const res = await validateQRToken(decodedText);
            
            if (res.success && res.patientId) {
              toast.success("Accès autorisé !");
              setIsOpen(false);
              onSuccess(res.patientId);
            } else {
              toast.error(res.error || "Code invalide");
              scanner?.resume();
            }
            setIsValidating(false);
          },
          (error) => {
            // ignore errors
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, isValidating, onSuccess]);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-12 px-6 rounded-2xl bg-primary text-white font-black italic shadow-lg shadow-primary/20 gap-2"
      >
        <QrCode className="w-5 h-5" /> SCANNER UN PASS QR
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-white/10 text-white p-0 rounded-3xl overflow-hidden">
          <div className="p-6 bg-primary/10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-lg font-black italic">Scanner un Pass</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Accès instantané sécurisé</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-slate-500" />
            </Button>
          </div>

          <div className="p-6">
            <div 
              id="qr-reader" 
              className="overflow-hidden rounded-2xl border-2 border-white/5 bg-black/40"
            />
            
            {isValidating && (
              <div className="mt-4 flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validation du Pass...
              </div>
            )}

            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-[11px] text-blue-200/70 leading-relaxed">
                Positionnez le code QR du patient dans le cadre. L'accès sera automatiquement accordé pour une durée de 24 heures.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
