"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import React, { useRef } from "react";
import { CalendarIcon, HeartPulse, Mic, ShieldCheck } from "lucide-react";
import { APP_NAME, APP_REGION } from "@/lib/brand";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { StarrySky } from "../ui/starry-sky";
import { AuthModal } from "../auth/AuthModal";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "sign-in" | "sign-up" }>({
    open: false,
    mode: "sign-up",
  });

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] text-white pt-24 pb-12 md:pt-0 md:pb-0"
    >
      <StarrySky />

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,#334155_1px,transparent_1px),_linear-gradient(to_bottom,#334155_1px,transparent_1px)] [background-size:4rem_4rem]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8 text-center lg:text-left"
          >
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md mx-auto lg:mx-0">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-primary">Santé connectée {APP_REGION}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] sm:leading-[1] tracking-tighter italic">
                <span className="block text-white/90 font-light not-italic tracking-normal text-2xl sm:text-4xl md:text-6xl mb-2">VOTRE SANTÉ,</span>
                <span className="text-primary drop-shadow-[0_0_20px_rgba(231,138,83,0.5)] uppercase">PROTÉGÉE</span>
                <span className="block text-white/90 font-light not-italic tracking-normal text-2xl sm:text-4xl md:text-6xl mt-2 italic">PAR L'IA.</span>
              </h1>

              <p className="text-base md:text-xl text-slate-400 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                {APP_NAME} : rendez-vous médicaux, carnet de santé numérique et assistant vocal pour vos soins de santé au quotidien.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                className="h-14 md:h-16 px-6 md:px-10 text-base md:text-lg font-black italic rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl transition-all w-full sm:w-auto" 
                size="lg"
                onClick={() => setAuthModal({ open: true, mode: "sign-up" })}
              >
                <HeartPulse className="mr-2 size-5" />
                CARNET DE SANTÉ
              </Button>

              <Button 
                variant="outline" 
                className="h-14 md:h-16 px-6 md:px-10 text-base md:text-lg font-bold rounded-2xl border-white/10 bg-white/5 backdrop-blur-md w-full sm:w-auto" 
                size="lg"
                onClick={() => setAuthModal({ open: true, mode: "sign-in" })}
              >
                <CalendarIcon className="mr-2 size-5" />
                PRENDRE RDV
              </Button>
            </div>
          </motion.div>

          <motion.div 
            style={{ rotateX, rotateY, perspective: 1200 }}
            className="relative flex justify-center items-center py-8 lg:py-20"
          >
            <div className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] -z-10 animate-pulse" />

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[280px] md:max-w-[500px]"
            >
              <Image 
                src="/hero.png" 
                alt="AI Health Assistant" 
                width={500} 
                height={500} 
                className="relative z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full h-auto"
                priority
              />

              {/* OBJETS ORBITAUX */}
              <motion.div 
                animate={{ y: [0, 20, 0], rotate: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-6 md:-left-16 top-1/4 z-30 size-12 md:size-20 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl"
              >
                <Mic className="text-primary size-6 md:size-10" />
              </motion.div>

              <motion.div 
                animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-4 md:-right-8 bottom-10 z-30 size-10 md:size-16 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-2xl"
              >
                <ShieldCheck className="text-emerald-400 size-5 md:size-8" />
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.05, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-8 md:-right-12 top-0 z-30 size-16 md:size-24 bg-primary/20 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] border border-primary/30 flex items-center justify-center shadow-inner"
              >
                <HeartPulse className="text-white size-8 md:size-12" />
              </motion.div>

            </motion.div>
          </motion.div>

        </div>
      </div>

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode}
      />
    </section>
  );
};

export default Hero;
