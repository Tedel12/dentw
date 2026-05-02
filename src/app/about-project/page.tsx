"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { StarrySky } from "@/components/ui/starry-sky";
import { 
  Code2, 
  Cpu, 
  Database, 
  Globe, 
  HeartPulse, 
  Layers, 
  Lock, 
  MessageSquare, 
  Rocket, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Zap,
  Badge 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const techStack = [
  { name: "Next.js 15", icon: <Rocket className="text-white" />, desc: "Framework React ultra-rapide avec App Router et Turbopack." },
  { name: "TypeScript", icon: <Code2 className="text-blue-400" />, desc: "Typage statique pour une robustesse de code absolue." },
  { name: "Prisma ORM", icon: <Database className="text-emerald-400" />, desc: "Gestion de base de données PostgreSQL fluide et sécurisée." },
  { name: "Vapi AI", icon: <Cpu className="text-primary" />, desc: "IA vocale en temps réel pour des conversations naturelles." },
  { name: "Clerk", icon: <ShieldCheck className="text-indigo-400" />, desc: "Authentification moderne et sécurisée pour nos utilisateurs." },
  { name: "Tailwind 4", icon: <Globe className="text-cyan-400" />, desc: "Stylisation haute performance avec un design moderne." },
];

const milestones = [
  { title: "La Vision", date: "Janvier 2026", desc: "L'idée est née d'un constat simple : la peur du dentiste et la perte d'informations médicales freinent les soins." },
  { title: "Développement IA", date: "Février 2026", desc: "Intégration des modèles LLM pour créer un assistant capable de comprendre les douleurs dentaires." },
  { title: "Sécurité HDS", date: "Mars 2026", desc: "Mise en place du système de certification des médecins et du chiffrage des carnets de santé." },
  { title: "Lancement PWA", date: "Avril 2026", desc: "Dentwise devient une application installable, accessible partout, même hors-ligne." },
];

export default function AboutProject() {
  return (
    <div className="bg-[#020617] text-white min-h-screen">
      <Navbar />
      
      {/* HERO SECTION ABOUT */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <StarrySky />
        <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-8">
              <Sparkles className="size-4 text-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">Le Projet Dentwise</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black italic tracking-tighter mb-8 leading-none">
              RÉINVENTER LA <br/> <span className="text-primary">SANTÉ DENTAIRE</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                Dentwise n'est pas seulement un carnet de santé numérique. C'est un écosystème intelligent conçu pour briser les barrières entre le patient et le praticien grâce à l'IA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-24 bg-white/5 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <h2 className="text-4xl font-black italic tracking-tight">Pourquoi Dentwise ?</h2>
                <div className="space-y-6">
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Chaque année, des millions de personnes évitent les soins dentaires par peur ou manque d'organisation. Les informations médicales sont souvent éparpillées, et les urgences sont mal gérées.
                    </p>
                    <div className="grid gap-6">
                        <div className="flex gap-4 p-6 bg-background rounded-3xl border border-white/5 hover:border-primary/30 transition-all group">
                            <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <MessageSquare className="text-primary size-6" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-xs text-primary mb-1">Assistance IA Vocale</h4>
                                <p className="text-sm text-slate-400 font-medium">Parler à un assistant qui connaît votre historique pour un pré-diagnostic rapide.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-background rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <HeartPulse className="text-emerald-500 size-6" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-xs text-emerald-500 mb-1">Carnet Digital</h4>
                                <p className="text-sm text-slate-400 font-medium">Toutes vos ordonnances et antécédents, accessibles partout, même hors-ligne.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative flex justify-center"
            >
                <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse"></div>
                <div className="relative z-10 w-full h-[400px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="relative h-full w-full bg-[#020617] rounded-[2.8rem] flex items-center justify-center p-12">
                        <Stethoscope className="size-48 text-primary animate-in zoom-in duration-1000" />
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* TECH STACK GRID */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-primary font-black uppercase tracking-[0.4em] text-xs">Architecture Technique</h2>
            <h3 className="text-5xl font-black italic tracking-tighter">LE CŒUR DE LA MACHINE</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 hover:border-primary/50 transition-all group"
              >
                <div className="size-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-transform">
                  {tech.icon}
                </div>
                <h4 className="text-xl font-black mb-3 italic tracking-tight">{tech.name}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY FOCUS */}
      <section className="py-24 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <Lock className="text-primary size-8" />
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter">SÉCURITÉ & CONFIDENTIALITÉ</h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                    Nous avons implémenté un système de **Validation de Rôle Praticien**. Seuls les médecins dont le numéro de licence a été vérifié manuellement par notre équipe peuvent accéder aux données de santé des patients. Chaque partage de carnet est temporaire (24h) et révocable.
                </p>
                <div className="flex gap-4">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-4 py-1.5">RGPD COMPLIANT</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-4 py-1.5">HDS READY</Badge>
                </div>
            </div>
            <div className="flex-1 relative">
                <div className="p-8 bg-[#020617] rounded-[3rem] border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                    <pre className="text-[10px] text-primary/70 font-mono overflow-hidden">
                        <code>
                            {`// Sécurisation de l'accès praticien
if (doctor.status !== 'VERIFIED') {
  return redirect('/blocked');
}

const access = await prisma.access.findFirst({
  where: { 
    patientId, 
    doctorId,
    expiresAt: { gt: new Date() }
  }
});`}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
      </section>

      {/* MILESTONES (TIMELINE) */}
      <section className="py-32 bg-[#020617]">
        <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-center text-3xl font-black italic mb-16 tracking-tighter">L'ÉVOLUTION DU PROJET</h2>
            <div className="relative before:absolute before:inset-0 before:left-1/2 before:w-0.5 before:bg-white/5 hidden md:block"></div>
            <div className="space-y-12">
                {milestones.map((m, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                    >
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-primary font-black text-xs uppercase tracking-widest mb-2">{m.date}</div>
                            <h4 className="text-xl font-bold mb-2">{m.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                        </div>
                        <div className="size-12 bg-primary rounded-full border-4 border-[#020617] z-10 relative flex items-center justify-center">
                            <Zap className="size-5 text-white" />
                        </div>
                        <div className="flex-1 hidden md:block"></div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block p-1 bg-gradient-to-tr from-primary to-blue-500 rounded-[2.5rem]"
            >
                <div className="bg-[#020617] px-12 py-16 rounded-[2.4rem] space-y-8">
                    <h2 className="text-5xl font-black italic tracking-tighter">PRÊT À TESTER ?</h2>
                    <p className="text-slate-400 max-w-md mx-auto">Rejoignez l'aventure Dentwise et découvrez le futur des soins dentaires.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link href="/dashboard">
                            <Button size="lg" className="h-14 px-10 font-black italic rounded-xl w-full sm:w-auto">
                                MON DASHBOARD
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" size="lg" className="h-14 px-10 font-bold rounded-xl border-white/10 hover:bg-white/5 w-full sm:w-auto">
                                RETOUR ACCUEIL
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
      </section>
    </div>
  );
}
