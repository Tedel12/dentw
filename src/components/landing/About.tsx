"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, Users, Zap } from "lucide-react";

const features = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Notre Mission",
    description: "Démocratiser l'accès aux soins dentaires de qualité grâce à une intelligence artificielle conversationnelle accessible à tous, partout."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Sécurité Maximale",
    description: "Vos données de santé sont sacrées. Nous utilisons des protocoles de chiffrement de niveau bancaire pour protéger votre carnet numérique."
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Humain & IA",
    description: "L'IA ne remplace pas le dentiste. Elle prépare votre consultation pour que le praticien puisse se concentrer sur l'essentiel : votre soin."
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Innovation Continue",
    description: "Nos modèles d'IA sont entraînés par des experts dentaires pour fournir des conseils toujours plus précis et personnalisés."
  }
];

export const About = () => {
  return (
    <section id="about" className="py-24 bg-[#020617] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-primary font-black uppercase tracking-[0.3em] text-sm">À propos de Dentwise</h2>
          <h3 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter">
            L'INNOVATION AU SERVICE <br/> DE VOTRE SOURIRE
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Dentwise est née d'une vision simple : transformer l'angoisse du dentiste en une expérience de santé connectée, fluide et rassurante.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-primary/30 transition-all group"
            >
              <div className="mb-6 bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h4 className="text-xl font-black text-white mb-3 italic tracking-tight">{f.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Décoration en arrière-plan */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
};
