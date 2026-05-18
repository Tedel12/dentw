"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, Users, Zap } from "lucide-react";
import { APP_NAME, APP_REGION } from "@/lib/brand";

const features = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Notre Mission",
    description: `Faciliter l'accès aux soins de santé ${APP_REGION} grâce à une plateforme numérique simple, sécurisée et accessible sur smartphone.`,
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "Sécurité Maximale",
    description:
      "Vos données de santé sont protégées. Chiffrement, consentement explicite et accès temporaire pour les praticiens que vous autorisez.",
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Humain & IA",
    description:
      "L'IA ne remplace pas le médecin. Elle vous oriente et prépare votre consultation pour un suivi plus efficace.",
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: "Innovation Continue",
    description:
      "Assistant vocal, rappels de traitements et carnet numérique pour un parcours de soins plus fluide.",
  },
];

export const About = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-[#020617] relative overflow-hidden">
      <motion.div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16 space-y-4"
        >
          <h2 className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-sm">
            À propos de {APP_NAME}
          </h2>
          <h3 className="text-3xl md:text-5xl font-black italic text-white tracking-tighter leading-tight">
            LA SANTÉ NUMÉRIQUE <br className="hidden md:block" /> POUR TOUS
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            {APP_NAME} réunit prise de rendez-vous, carnet de santé personnel et accompagnement
            intelligent pour améliorer le suivi médical {APP_REGION}.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-6 md:p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-primary/30 transition-all group"
            >
              <motion.div
                className="mb-6 bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                {f.icon}
              </motion.div>
              <h4 className="text-xl font-black text-white mb-3 italic tracking-tight">{f.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
};
