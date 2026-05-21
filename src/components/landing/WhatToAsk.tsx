"use client";

import { Activity, Brain, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const questions = [
  {
    q: "Quels sont les premiers signes de l'hypertension ?",
    icon: Activity,
    color: "text-red-500",
  },
  {
    q: "Comment mieux dormir naturellement ?",
    icon: Brain,
    color: "text-blue-500",
  },
  {
    q: "Quelle est la durée moyenne d'un traitement antibiotique ?",
    icon: Clock,
    color: "text-amber-500",
  },
  {
    q: "Comment protéger mes données de santé ?",
    icon: ShieldCheck,
    color: "text-emerald-500",
  }
];

const WhatToAsk = () => {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Interagir avec l'IA</h2>
                    <p className="text-3xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-[1.1]">
                        UNE ASSISTANCE <br /> 
                        <span className="text-primary">MÉDICALE</span> <br /> 
                        À TOUTE HEURE.
                    </p>
                </div>
                <p className="text-slate-400 font-medium leading-relaxed max-w-md">
                    Notre assistant vocal IA est entraîné pour répondre à vos questions de santé courantes, vous orienter vers le bon spécialiste et vous aider à comprendre vos constantes médicales.
                </p>
            </div>

            <div className="grid gap-4">
                {questions.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-white/5 border-white/5 hover:border-primary/30 transition-all cursor-default rounded-2xl overflow-hidden group">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                                    <item.icon className={`size-5 ${item.color}`} />
                                </div>
                                <p className="text-sm md:text-base font-bold text-slate-200">{item.q}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default WhatToAsk;
