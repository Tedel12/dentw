"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import { DownloadCloud, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher Chrome d'afficher sa barre par défaut
      e.preventDefault();
      // Stocker l'événement pour plus tard
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success("Installation lancée !");
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="w-full"
      >
        <Button 
          onClick={handleInstallClick}
          className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 font-black italic rounded-xl gap-2 h-12"
        >
          <Smartphone className="size-4 animate-bounce" />
          INSTALLER L'APPLI
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
