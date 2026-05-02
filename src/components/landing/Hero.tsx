"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import Image from "next/image";
import React, { useRef } from "react";
import { CalendarIcon, Stethoscope, Mic, ShieldCheck } from "lucide-react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { StarrySky } from "../ui/starry-sky";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), { stiffness: 150, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), { stiffness: 150, damping: 30 });

  function handleMouseMove(event: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    }
  }

  return (
    <section 
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] text-white"
    >
      <StarrySky />

      {/* Grille de fond subtile */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,#334155_1px,transparent_1px),_linear-gradient(to_bottom,#334155_1px,transparent_1px)] [background-size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* TEXTE GAUCHE */}
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-black uppercase tracking-widest text-primary">Intelligence Dentaire</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter italic">
                <span className="block">VOS SOINS,</span>
                <span className="text-primary drop-shadow-[0_0_20px_rgba(231,138,83,0.5)]">PROPULSÉS</span>
                <span className="block text-white/90 font-light not-italic tracking-normal text-5xl md:text-6xl mt-2">PAR L'IA.</span>
              </h1>

              <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
                Découvrez l'assistant vocal qui comprend vos besoins. Gérez votre santé dentaire avec une précision chirurgicale.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <SignUpButton mode="modal">
                <Button className="h-16 px-10 text-lg font-black italic rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all hover:scale-105" size="lg">
                  <Stethoscope className="mr-3 size-6" />
                  CARNET DE SANTÉ
                </Button>
              </SignUpButton>

              <SignUpButton mode="modal">
                <Button variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10" size="lg">
                  <CalendarIcon className="mr-3 size-6" />
                  PRENDRE RDV
                </Button>
              </SignUpButton>
            </div>
          </motion.div>

          {/* ROBOT DROITE */}
          <motion.div 
            style={{ rotateX, rotateY, perspective: 1200 }}
            className="relative flex justify-center items-center py-20"
          >
            {/* Lueur centrale */}
            <div className="absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />

            <motion.div
              animate={{ y: [0, -25, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Image 
                src="/hero.png" 
                alt="AI Assistant" 
                width={500} 
                height={500} 
                className="relative z-20 drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                priority
              />

              {/* OBJETS ORBITAUX - VISIBILITÉ RENFORCÉE */}
              
              {/* Micro IA - Flotte à gauche */}
              <motion.div 
                animate={{ 
                    y: [0, 30, 0],
                    rotate: [-10, 10, -10]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-16 top-1/4 z-30 w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(231,138,83,0.3)]"
              >
                <Mic className="text-primary w-10 h-10" />
              </motion.div>

              {/* Bouclier - Flotte en bas à droite */}
              <motion.div 
                animate={{ 
                    y: [0, -40, 0],
                    x: [0, 20, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-8 bottom-10 z-30 w-16 h-16 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-2xl"
              >
                <ShieldCheck className="text-emerald-400 w-8 h-8" />
              </motion.div>

              {/* Stéthoscope - Flotte en haut à droite */}
              <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 15, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-12 top-0 z-30 w-24 h-24 bg-primary/20 backdrop-blur-md rounded-[2rem] border border-primary/30 flex items-center justify-center shadow-inner"
              >
                <Stethoscope className="text-white w-12 h-12" />
              </motion.div>

            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
