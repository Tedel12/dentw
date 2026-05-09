"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Eye, ImageIcon, Printer } from "lucide-react";

export function AnimatedTimelineItem({ t, index }: { t: any, index: number }) {
  const hasImage = !!t.prescriptionUrl;

  const handlePrintImage = (url: string) => {
    const win = window.open("");
    if (win) {
        win.document.write(`<img src="${url}" style="width:100%" onload="window.print();window.close()">`);
        win.focus();
    }
  };

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
        <div className="flex justify-between items-start gap-4">
            <span className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{t.name}</span>
            <div className="flex flex-col items-end gap-2 shrink-0">
                {t.prescribingDoctor && (
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-black">
                        Dr. {t.prescribingDoctor.name || t.prescribingDoctor.user?.lastName}
                    </Badge>
                )}
                {hasImage && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-black uppercase tracking-tighter gap-1 border-primary/20 hover:bg-primary/5">
                                <ImageIcon className="w-3 h-3" /> Voir Original
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl rounded-[2rem] border-primary/20 p-0 overflow-hidden bg-black/95">
                            <DialogHeader className="p-6 bg-background/50 backdrop-blur-md border-b border-white/10 flex flex-row items-center justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-xl font-black italic text-white uppercase tracking-tighter">Ordonnance Originale</DialogTitle>
                                    <p className="text-xs text-white/50 font-bold uppercase">{t.name} - {format(new Date(t.createdAt), "dd/MM/yyyy")}</p>
                                </div>
                                <Button 
                                    onClick={() => handlePrintImage(t.prescriptionUrl)} 
                                    size="sm" 
                                    className="bg-white text-black hover:bg-white/90 font-black rounded-xl gap-2 mr-6"
                                >
                                    <Printer className="w-4 h-4" /> IMPRIMER
                                </Button>
                            </DialogHeader>
                            <div className="p-4 flex items-center justify-center min-h-[50vh] max-h-[80vh] overflow-y-auto">
                                <img 
                                    src={t.prescriptionUrl} 
                                    alt="Ordonnance originale" 
                                    className="max-w-full h-auto rounded-xl shadow-2xl shadow-primary/20 object-contain"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.notes || "Soin enregistré dans votre historique numérique."}</p>
        
        {(t.pathology || t.administrationRoute) && (
          <div className="flex flex-wrap gap-4 mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            {t.pathology && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div> Motif: {t.pathology}</span>}
            {t.administrationRoute && <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div> Voie: {t.administrationRoute}</span>}
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-lg px-3 py-1 bg-muted/30 border-none text-[10px] font-black uppercase tracking-widest">{t.dosage}</Badge>
          <Badge variant="outline" className="rounded-lg px-3 py-1 bg-muted/30 border-none text-[10px] font-black uppercase tracking-widest">{t.frequency}</Badge>
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
