"use client";

import { Activity, Calendar, HeartPulse, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Créez votre Carnet",
    description: "Inscrivez-vous et renseignez vos informations de santé de base en quelques secondes.",
    icon: Activity,
    color: "bg-blue-500",
  },
  {
    title: "Consultez l'Assistant IA",
    description: "Posez vos questions de santé à notre assistant vocal IA disponible à tout moment.",
    icon: HeartPulse,
    color: "bg-primary",
  },
  {
    title: "Prenez RDV",
    description: "Choisissez un praticien certifié et réservez votre créneau en ligne ou en cabinet.",
    icon: Calendar,
    color: "bg-emerald-500",
  },
  {
    title: "Suivi Sécurisé",
    description: "Retrouvez vos ordonnances et autorisez vos médecins à consulter votre historique.",
    icon: ShieldCheck,
    color: "bg-violet-500",
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-[#020617] relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-3 md:space-y-4">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">Le Parcours Patient</h2>
          <p className="text-2xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-tight">COMMENT ÇA MARCHE ?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative">
            {/* Ligne de connexion (Desktop) */}
            <div className="hidden lg:block absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

            {steps.map((step, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center text-center space-y-4 md:space-y-6 group"
                >
                    <div className={`size-16 md:size-20 rounded-[1.5rem] md:rounded-[2rem] ${step.color} flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500 relative`}>
                        <div className="absolute -top-1.5 -right-1.5 size-6 md:size-8 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 text-[10px] md:text-xs font-black">
                            0{index + 1}
                        </div>
                        <step.icon className="size-6 md:size-8 text-white" />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <h3 className="text-lg md:text-xl font-black text-white italic">{step.title}</h3>
                        <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                            {step.description}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
