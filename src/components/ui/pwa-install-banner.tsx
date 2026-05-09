"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, ArrowRight, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà lancée en mode standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    // Détecter iOS
    const ua = window.navigator.userAgent;
    const ios = !!ua.match(/iPad|iPhone|iPod/) && !ua.match(/MSIE/);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Ne montrer que si on n'est pas déjà dans l'app installée
      if (!isStandalone) {
        setIsVisible(true);
      }
    };

    // Sur iOS, on affiche le banner manuellement car beforeinstallprompt n'existe pas
    if (ios && !isStandalone) {
      // On attend un peu pour ne pas agresser l'utilisateur dès le chargement
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Sur iOS on ne peut que montrer comment faire
      alert("Sur iOS : Appuyez sur 'Partager' (icône carré avec flèche) puis sur 'Sur l'écran d'accueil'.");
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100] p-4"
        >
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl shadow-primary/20 p-4 flex items-center justify-between gap-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Smartphone className="text-white size-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm uppercase tracking-tighter truncate">
                   {isIOS ? "Installez sur iPhone" : "Installez Dentwise IA"}
                </p>
                <p className="text-white/80 text-[10px] font-medium leading-tight hidden sm:block">
                  Accédez à votre carnet même sans internet au village.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                    onClick={handleInstall}
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90 font-black text-[10px] h-9 px-4 rounded-lg shadow-lg flex items-center gap-1"
                >
                    {isIOS ? (
                      <>
                        COMMENT <Share className="size-3" />
                      </>
                    ) : (
                      <>
                        INSTALLER <ArrowRight className="size-3" />
                      </>
                    )}
                </Button>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="text-white/50 hover:text-white p-1"
                >
                    <X className="size-4" />
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
