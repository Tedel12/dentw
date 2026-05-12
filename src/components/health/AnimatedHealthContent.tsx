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
import { Eye, ImageIcon, Printer, Video, MapPin, Stethoscope } from "lucide-react";

export function AnimatedTimelineItem({ item, index }: { item: any, index: number }) {
  // Déterminer si c'est un traitement ou un rendez-vous
  const isTreatment = 'dosage' in item;
  const createdAt = new Date(item.date || item.createdAt);
  
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
      className="relative pl-8 mb-10 last:mb-0"
    >
      <motion.div 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: (index * 0.1) + 0.2, type: "spring" }}
        className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-[#020617] z-10 shadow-sm ${isTreatment ? 'bg-primary' : 'bg-emerald-500'}`}
      ></motion.div>
      
      <div className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
        {format(createdAt, "PPP", { locale: fr })}
        <span className="w-1 h-1 rounded-full bg-slate-800" />
        {isTreatment ? "Prescription" : "Consultation"}
      </div>
      
      <motion.div 
        whileHover={{ scale: 1.01, x: 5 }}
        className={`p-6 rounded-3xl border backdrop-blur-md transition-all group shadow-2xl ${
            isTreatment 
            ? 'bg-white/[0.02] border-white/5 hover:border-primary/40' 
            : 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
        }`}
      >
        <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
                <span className="text-xl font-black italic tracking-tight text-white group-hover:text-primary transition-colors">
                    {isTreatment ? item.name : `Session avec Dr. ${item.doctor?.name}`}
                </span>
                {!isTreatment && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/80 uppercase">
                        {item.type === 'ONLINE' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {item.type === 'ONLINE' ? 'Téléconsultation' : 'Au cabinet'}
                    </div>
                )}
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
                {isTreatment ? (
                    item.prescribingDoctor && (
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] uppercase font-black px-2 py-0.5">
                            Dr. {item.prescribingDoctor.name || item.prescribingDoctor.user?.lastName}
                        </Badge>
                    )
                ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0.5">
                        Terminé
                    </Badge>
                )}
                
                {isTreatment && item.prescriptionUrl && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase tracking-tighter gap-1 border-white/10 hover:bg-white/5 rounded-lg">
                                <ImageIcon className="w-3 h-3" /> Voir Original
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl rounded-[2.5rem] border-white/10 p-0 overflow-hidden bg-black/95">
                            <DialogHeader className="p-6 bg-background/50 backdrop-blur-md border-b border-white/10 flex flex-row items-center justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-xl font-black italic text-white uppercase tracking-tighter">Ordonnance Originale</DialogTitle>
                                    <p className="text-[10px] text-white/50 font-bold uppercase">{item.name} - {format(createdAt, "dd/MM/yyyy")}</p>
                                </div>
                                <Button 
                                    onClick={() => handlePrintImage(item.prescriptionUrl)} 
                                    size="sm" 
                                    className="bg-white text-black hover:bg-white/90 font-black rounded-xl gap-2 mr-6"
                                >
                                    <Printer className="w-4 h-4" /> IMPRIMER
                                </Button>
                            </DialogHeader>
                            <div className="p-4 flex items-center justify-center min-h-[50vh] max-h-[80vh] overflow-y-auto">
                                <img 
                                    src={item.prescriptionUrl} 
                                    alt="Ordonnance originale" 
                                    className="max-w-full h-auto rounded-xl shadow-2xl shadow-primary/20 object-contain"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
        
        <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
            <p className="text-sm text-slate-300 font-bold leading-relaxed italic">
                {isTreatment 
                    ? (item.notes || "Traitement prescrit pour votre suivi dentaire.")
                    : (item.summary || "Consultation archivée dans votre carnet numérique.")
                }
            </p>
            {!isTreatment && item.reason && (
                <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-medium">
                    Motif initial : {item.reason}
                </div>
            )}
        </div>
        
        {isTreatment && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-xl px-3 py-1.5 bg-primary/5 border-primary/10 text-[9px] font-black uppercase text-primary tracking-widest">{item.dosage}</Badge>
            <Badge variant="outline" className="rounded-xl px-3 py-1.5 bg-white/5 border-white/10 text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.frequency}</Badge>
          </div>
        )}

        {!isTreatment && (
            <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Stethoscope className="w-3 h-3 text-emerald-400" />
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Diagnostic archivé</span>
            </div>
        )}
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
