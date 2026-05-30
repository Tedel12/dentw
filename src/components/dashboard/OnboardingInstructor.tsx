"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, GraduationCap, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getProfileCompletion } from "@/lib/actions/users";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingInstructor() {
  const [data, setData] = useState<{ completion: number; steps: any[] } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchCompletion() {
      const res = await getProfileCompletion();
      if (res && res.completion < 100) {
        setData(res);
      } else {
        setIsVisible(false);
      }
    }
    fetchCompletion();
  }, []);

  if (!isVisible || !data) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-8 md:mb-10 w-full"
      >
        <div className="bg-slate-900/40 border border-primary/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 backdrop-blur-md relative overflow-hidden group shadow-2xl shadow-primary/5">
          {/* Background Decorative */}
          <div className="absolute -right-10 -top-10 size-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors z-20"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-10 items-start lg:items-center relative z-10">
            {/* Progress Section */}
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 md:gap-4 text-left">
                <div className="size-12 md:size-14 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                  <GraduationCap className="size-6 md:size-8 text-primary animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">Instructeur</h2>
                  <p className="text-slate-500 text-[11px] md:text-sm font-medium italic">Complétez votre profil.</p>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary">Progression</span>
                  <span className="text-white">{data.completion}%</span>
                </div>
                <Progress value={data.completion} className="h-2 md:h-2.5 bg-white/5 border border-white/5 rounded-full" />
              </div>
            </div>

            {/* Checklist Section */}
            <div className="lg:w-2/5 w-full bg-black/20 rounded-2xl md:rounded-[2rem] p-4 md:p-6 border border-white/5 space-y-3">
              <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Actions :</h3>
              <div className="grid gap-1.5 md:gap-2">
                {data.steps.map((step, idx) => (
                  <Link key={idx} href={step.link}>
                    <div className={`flex items-center justify-between p-2.5 md:p-3 rounded-xl border transition-all ${step.completed ? 'bg-emerald-500/5 border-emerald-500/10 opacity-40 grayscale pointer-events-none' : 'bg-white/5 border-white/5 hover:border-primary/30 group/step'}`}>
                      <div className="flex items-center gap-2 md:gap-3">
                        {step.completed ? (
                          <CheckCircle2 className="size-3.5 md:size-4 text-emerald-500" />
                        ) : (
                          <Circle className="size-3.5 md:size-4 text-slate-600 group-hover/step:text-primary" />
                        )}
                        <span className={`text-[10px] md:text-[11px] font-bold ${step.completed ? 'text-emerald-500 line-through' : 'text-slate-300'} truncate max-w-[180px] sm:max-w-none`}>
                          {step.label}
                        </span>
                      </div>
                      {!step.completed && <ChevronRight className="size-2.5 md:size-3 text-slate-600 group-hover/step:text-primary transition-transform group-hover/step:translate-x-1" />}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
