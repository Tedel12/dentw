"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export function AnimatedTimelineItem({ t, index }: { t: any, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100 
      }}
      className="relative pl-8 mb-8 last:mb-0"
    >
      <motion.div 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: (index * 0.1) + 0.2, type: "spring" }}
        className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-background bg-primary z-10 shadow-sm"
      ></motion.div>
      
      <div className="text-xs font-black text-primary/60 uppercase mb-2 tracking-widest">
        {format(new Date(t.createdAt), "PPP", { locale: fr })}
      </div>
      
      <motion.div 
        whileHover={{ scale: 1.01, x: 5 }}
        className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:border-primary/40 transition-all group"
      >
        <div className="flex justify-between items-start">
            <span className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{t.name}</span>
            {t.prescribingDoctor && (
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                    Dr. {t.prescribingDoctor.name}
                </Badge>
            )}
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.notes || "Soin enregistré dans votre historique numérique."}</p>
        
        {(t.pathology || t.administrationRoute) && (
          <div className="flex gap-4 mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            {t.pathology && <span>● Motif: {t.pathology}</span>}
            {t.administrationRoute && <span>● Voie: {t.administrationRoute}</span>}
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-lg px-3 py-1 bg-muted/30 border-none text-xs font-bold">{t.dosage}</Badge>
          <Badge variant="outline" className="rounded-lg px-3 py-1 bg-muted/30 border-none text-xs font-bold">{t.frequency}</Badge>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AnimatedTreatmentCard({ t, index, children }: { t: any, index: number, children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -5 }}
        >
            {children}
        </motion.div>
    )
}
