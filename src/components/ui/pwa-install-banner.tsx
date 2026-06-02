"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, ArrowRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { APP_NAME } from "@/lib/brand";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Fonction de détection standalone robuste
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
    };
    
    // Si déjà installé, on ne fait rien
    if (checkStandalone()) return;

    // Détecter iOS
    const ua = window.navigator.userAgent;
    const ios = !!ua.match(/iPad|iPhone|iPod/) && !ua.match(/MSIE/);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa-banner-closed')) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('PWA installée avec succès');
    };

    // On affiche la bannière après un court délai sur mobile si non installé
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const timer = setTimeout(() => {
      if (!checkStandalone() && !sessionStorage.getItem('pwa-banner-closed')) {
        setIsVisible(true);
      }
    }, 6000);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      alert("Sur iPhone : Appuyez sur le bouton 'Partager' (carré avec flèche), faites défiler vers le bas et appuyez sur 'Sur l'écran d'accueil' 📲");
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("Installation : Cliquez sur les 3 points en haut à droite de Chrome, puis sur 'Installer l'application' ou 'Ajouter à l'écran d'accueil' ");
    }
  };

  const closeBanner = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-banner-closed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] p-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl shadow-primary/40 p-3 flex items-center justify-between gap-2 md:gap-4 border border-white/30 backdrop-blur-xl pointer-events-auto">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className="bg-white/20 p-1.5 md:p-2 rounded-xl shrink-0">
                <Smartphone className="text-white size-4 md:size-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-[12px] md:text-sm uppercase tracking-tighter truncate">
                   {isIOS ? APP_NAME : `App ${APP_NAME}`}
                </p>
                <p className="text-white/80 text-[9px] md:text-[10px] font-medium leading-tight truncate">
                  Soins même sans réseau.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                <Button 
                    onClick={handleInstall}
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90 font-black text-[9px] md:text-[10px] h-8 md:h-9 px-3 md:px-4 rounded-lg shadow-lg flex items-center gap-1 transition-all active:scale-95"
                >
                    {isIOS ? (
                      <>
                        INFOS <Info className="size-2.5 md:size-3" />
                      </>
                    ) : (
                      <>
                        INSTALLER <ArrowRight className="size-2.5 md:size-3" />
                      </>
                    )}
                </Button>
                <button 
                    onClick={closeBanner}
                    className="bg-white/10 hover:bg-white/20 text-white p-1.5 md:p-2 rounded-lg md:rounded-xl border border-white/10 transition-colors shrink-0"
                    aria-label="Fermer"
                >
                    <X className="size-3.5 md:size-4" />
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
