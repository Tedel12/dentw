"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";
import { AuthModal } from "../auth/AuthModal";

function PricingSection() {
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "sign-in" | "sign-up" }>({
    open: false,
    mode: "sign-up",
  });

  return (
    <section id="pricing" className="relative py-16 md:py-32 px-4 md:px-6 overflow-hidden bg-gradient-to-b from-background via-muted/3 to-background text-white">
      {/* Fond en grille */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/5 to-primary/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_50%,#000_50%,transparent_85%)] opacity-10"></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.06),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-full border border-primary/10 backdrop-blur-sm mb-4 md:mb-6">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-primary">Tarification simple</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 tracking-tighter leading-[1.1] italic uppercase">
              Choisissez votre <br /> 
              <span className="text-primary drop-shadow-[0_0_15px_rgba(231,138,83,0.3)]">plan santé IA</span>
          </h2>
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed italic font-medium">
            Prenez rendez-vous gratuitement et passez à la version premium pour des consultations IA illimitées.
          </p>
        </div>

        {/* Cartes de tarification */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* Plan gratuit */}
          <div className="relative group h-full">
            <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 h-full border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl flex flex-col">
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase text-slate-500">Gratuit</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">0 <span className="text-sm italic font-bold">FCFA</span></span>
                    <span className="text-slate-500 mb-1 text-xs font-bold">/MOIS</span>
                  </div>
                  <p className="text-xs font-medium text-slate-400">Prise de RDV médicale essentielle</p>
                </div>
                
                <Button 
                    className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black italic border border-white/10 transition-all"
                    onClick={() => setAuthModal({ open: true, mode: "sign-up" })}
                >
                COMMENCER GRATUITEMENT
                </Button>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {[
                    "Prise de rendez-vous illimitée",
                    "Tous les praticiens du Bénin",
                    "Rappels SMS & Email",
                    "Carnet de santé digital basique"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Pro - Mis en avant */}
          <div className="relative group lg:scale-105 z-10 h-full">
            {/* Badge populaire */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                Le plus populaire
              </div>
            </div>

            <div className="relative bg-primary/5 backdrop-blur-xl rounded-[2.5rem] p-8 h-full border-2 border-primary/30 hover:border-primary/50 transition-all duration-500 shadow-2xl flex flex-col">
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase text-primary">IA Basique</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">5 000 <span className="text-sm italic font-bold">FCFA</span></span>
                    <span className="text-primary/70 mb-1 text-xs font-bold uppercase">/MOIS</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 italic">Consultations IA illimitées</p>
                </div>

                <Button 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black italic shadow-lg shadow-primary/20 transition-all"
                    onClick={() => setAuthModal({ open: true, mode: "sign-up" })}
                >
                  ACTIVER IA BASIQUE
                </Button>

                <div className="space-y-4 pt-4 border-t border-primary/10">
                  {[
                    "Tout le plan Gratuit",
                    "Appels vocaux IA (10/mois)",
                    "Évaluation des symptômes par IA",
                    "Historique des ordonnances",
                    "Support prioritaire 24h/7",
                    "Données cryptées AES-256"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Entreprise */}
          <div className="relative group h-full">
            <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 h-full border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl flex flex-col">
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase text-slate-500">IA Pro</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">10 000 <span className="text-sm italic font-bold">FCFA</span></span>
                    <span className="text-slate-500 mb-1 text-xs font-bold uppercase">/MOIS</span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 italic">Pour toute la famille</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-white/5 hover:border-primary/40 hover:bg-primary/5 text-white rounded-xl font-black italic transition-all"
                  onClick={() => setAuthModal({ open: true, mode: "sign-up" })}
                >
                  DEVENIR PRO
                </Button>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {[
                    "Tout le plan IA Basique",
                    "Appels vocaux IA illimités",
                    "Plans de soins personnalisés",
                    "Rapports de santé hebdomadaires",
                    "Consultations vidéo incluses",
                    "Partage familial (jusqu'à 4)"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode}
      />
    </section>
  );
}

export default PricingSection;
