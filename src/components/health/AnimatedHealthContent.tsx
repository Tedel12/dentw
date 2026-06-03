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
import { 
  Eye, ImageIcon, Printer, Video, MapPin, 
  Clock, Calendar as CalendarIcon, Activity, Pill, HeartPulse, 
  Microscope, MessageSquare, CheckCircle2 
} from "lucide-react";

export function AnimatedTimelineItem({ item, index }: { item: any, index: number }) {
  const isTreatment = 'dosage' in item || 'type' in item;
  const createdAt = new Date(item.date || item.createdAt);
  const type = item.type || (isTreatment ? "MEDICATION" : "CONSULTATION");

  const getConfig = () => {
    switch(type) {
        case "EXAM": return { icon: Microscope, color: "bg-violet-500", border: "hover:border-violet-500/40", bg: "bg-violet-500/5", label: "Examen / Radio" };
        case "OBSERVATION": return { icon: MessageSquare, color: "bg-blue-500", border: "hover:border-blue-500/40", bg: "bg-blue-500/5", label: "Suivi / Note" };
        case "MEDICATION": return { icon: Pill, color: "bg-primary", border: "hover:border-primary/40", bg: "bg-primary/5", label: "Ordonnance" };
        default: return { icon: HeartPulse, color: "bg-emerald-500", border: "hover:border-emerald-500/40", bg: "bg-emerald-500/5", label: "Consultation" };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 mb-10 last:mb-0 text-left"
    >
      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-[#020617] z-10 ${config.color}`} />
      
      <div className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
        {format(createdAt, "dd MMMM yyyy", { locale: fr })}
        <span className="w-1 h-1 rounded-full bg-slate-800" />
        {config.label}
      </div>
      
      <motion.div 
        whileHover={{ x: 5 }}
        className={`p-6 rounded-[2rem] border backdrop-blur-md transition-all group shadow-2xl bg-white/[0.02] border-white/5 ${config.border} ${config.bg}`}
      >
        <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
                <span className="text-xl font-black italic tracking-tight text-white group-hover:text-primary transition-colors uppercase leading-tight">
                    {isTreatment ? item.name : `Dr. ${item.doctor?.name}`}
                </span>
                {!isTreatment && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
                        {item.type === 'ONLINE' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {item.type === 'ONLINE' ? 'Téléconsultation' : 'Cabinet'}
                    </div>
                )}
                {isTreatment && item.pathology && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.pathology}</p>
                )}
            </div>
            
            <div className="flex flex-col items-end gap-2 shrink-0">
                {item.prescribingDoctor && (
                    <Badge variant="secondary" className="bg-white/5 text-slate-400 border-white/10 text-[9px] uppercase font-black px-2 py-0.5">
                        Par: {item.prescribingDoctor.name}
                    </Badge>
                )}
                
                {item.prescriptionUrl && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase tracking-tighter gap-1 border-white/10 hover:bg-white/5 rounded-lg">
                                <ImageIcon className="w-3 h-3" /> Original
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl rounded-[2.5rem] border-white/10 p-0 overflow-hidden bg-black/95">
                            <div className="p-4 flex items-center justify-center min-h-[50vh] max-h-[80vh] overflow-y-auto">
                                <img src={item.prescriptionUrl} alt="Document" className="max-w-full h-auto rounded-xl shadow-2xl object-contain" />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
        
        <div className="mt-6 space-y-4">
            {type === "MEDICATION" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Posologie</span>
                        <span className="text-xs font-bold text-slate-200 italic">{item.dosage || "N/R"}</span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Freq.</span>
                        <span className="text-xs font-bold text-slate-200 italic">{item.frequency || "N/R"}</span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Heure</span>
                        <span className="text-xs font-bold text-slate-200 italic">{item.time || "N/R"}</span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Durée</span>
                        <span className="text-xs font-bold text-slate-200 italic">{item.duration ? `${item.duration}j` : "N/R"}</span>
                    </div>
                </div>
            )}

            <div className="p-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                    {type === "MEDICATION" ? (item.notes || "Médicaments enregistrés.") : 
                     type === "EXAM" ? (item.notes || "Résultats d'examen.") :
                     type === "OBSERVATION" ? item.notes : (item.summary || "Rapport médical.")}
                </p>
                {item.administrationRoute && (
                    <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity className="size-3 text-primary" /> Voie : {item.administrationRoute}
                    </div>
                )}
            </div>
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
