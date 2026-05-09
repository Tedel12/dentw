"use client";

import { useEffect, useState } from "react";
import { X, Smartphone, ArrowRight, Share, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà lancée en mode standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    // Détecter iOS et Mobile
    const ua = window.navigator.userAgent;
    const ios = !!ua.match(/iPad|iPhone|iPod/) && !ua.match(/MSIE/);
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    setIsIOS(ios);
    setIsMobile(mobile);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setIsVisible(true);
      }
    };

    // Fallback pour mobile si l'événement ne vient pas (Chrome mobile est capricieux)
    if (mobile && !isStandalone) {
      const timer = setTimeout(() => {
        // On ne l'affiche que si l'utilisateur n'a pas déjà fermé la bannière dans cette session
        if (!sessionStorage.getItem('pwa-banner-closed')) {
          setIsVisible(true);
        }
      }, 5000); // 5 secondes après le chargement
      return () => clearTimeout(timer);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      alert("Sur iPhone : Appuyez sur le bouton 'Partager' en bas de Safari, puis sur 'Sur l'écran d'accueil' 📲");
      return;
    }

    if (!deferredPrompt) {
      alert("Sur Android : Appuyez sur les 3 points en haut à droite de Chrome, puis sur 'Installer l'application' ou 'Ajouter à l'écran d'accueil' 📲");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const closeBanner = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-banner-closed', 'true');
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
          <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl shadow-primary/20 p-4 flex items-center justify-between gap-4 border border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Smartphone className="text-white size-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm uppercase tracking-tighter truncate">
                   {isIOS ? "Dentwise sur iPhone" : "Installer Dentwise"}
                </p>
                <p className="text-white/80 text-[10px] font-medium leading-tight">
                  Accédez à vos soins même hors-ligne.
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
                        INFOS <Info className="size-3" />
                      </>
                    ) : (
                      <>
                        INSTALLER <ArrowRight className="size-3" />
                      </>
                    )}
                </Button>
                <button 
                    onClick={closeBanner}
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
