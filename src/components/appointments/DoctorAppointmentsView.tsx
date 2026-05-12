"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Mail, FileText, CheckCircle, XCircle, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { checkDoctorAccess, requestHealthAccess, getPatientHealthData } from "@/lib/actions/health";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { VideoIcon } from "lucide-react";
import Link from "next/link";

interface DoctorAppointmentsViewProps {
  appointments: any[];
}

export function DoctorAppointmentsView({ appointments: initialAppointments }: DoctorAppointmentsViewProps) {
  const { user: clerkUser } = useUser();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [patientData, setPatientData] = useState<any>(null);
  const [isAccessing, setIsAccessing] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus({ id, status: status as any });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
      toast.success(status === "CONFIRMED" ? "Rendez-vous confirmé" : "Rendez-vous annulé");
      if (showFileDialog) setShowFileDialog(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleViewPatientFile = async (patientId: string, aptId: string) => {
    if (!clerkUser) return;
    
    const doctorId = initialAppointments[0]?.doctorId;
    if (!doctorId) return;

    setIsAccessing(true);
    setCurrentAppointmentId(aptId);
    
    try {
      const hasAccess = await checkDoctorAccess(patientId, doctorId);
      
      if (!hasAccess) {
        const res = await requestHealthAccess(patientId, doctorId);
        if (res.success) {
          toast.info("Demande d'accès envoyée au patient. Vous pourrez voir le dossier dès qu'il l'aura validée.");
        } else {
          toast.error(res.error || "Impossible d'envoyer la demande d'accès");
        }
        setIsAccessing(false);
        return;
      }

      const dataRes = await getPatientHealthData(patientId, doctorId);
      if (dataRes.success) {
        setPatientData(dataRes.data);
        setShowFileDialog(true);
      } else {
        toast.error("Erreur lors de la récupération des données");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsAccessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter">Mon Agenda Praticien</h1>
          <p className="text-muted-foreground font-medium italic">Gérez vos consultations et accédez aux dossiers médicaux sécurisés.</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-2 uppercase tracking-widest text-xs">
          {appointments.length} Consultation(s)
        </Badge>
      </div>

      <div className="grid gap-6">
        {appointments.length > 0 ? (
          appointments.map((apt: any) => (
            <Card key={apt.id} className="overflow-hidden border-white/5 bg-white/5 backdrop-blur-md hover:border-primary/40 transition-all duration-500 group rounded-3xl shadow-xl shadow-black/20">
              <div className="flex flex-col md:flex-row">
                <div className="bg-primary/10 p-6 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-white/5 md:w-48 group-hover:bg-primary/20 transition-colors">
                  <div className="flex flex-col items-start md:items-center">
                    <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-1">{format(new Date(apt.date), "EEE", { locale: fr })}</span>
                    <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">{format(new Date(apt.date), "dd")}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{format(new Date(apt.date), "MMMM", { locale: fr })}</span>
                </div>
                
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row justify-between gap-6 md:gap-8">
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <User className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-xl md:text-2xl tracking-tight text-white">{apt.user?.firstName} {apt.user?.lastName}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] md:text-[10px] font-black uppercase">{apt.reason || "Consultation"}</Badge>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <Clock className="size-3" /> {apt.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-slate-400 font-medium hover:text-white transition-colors cursor-default max-w-full overflow-hidden">
                          <div className="shrink-0 p-1.5 bg-white/5 rounded-lg border border-white/5"><Mail className="w-3 md:w-3.5 h-3 md:h-3.5" /></div>
                          <span className="truncate">{apt.user?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-stretch md:items-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <Badge className={`w-fit self-end px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] border-none ${
                        apt.status === "CONFIRMED" ? "bg-green-500/20 text-green-400" : 
                        apt.status === "COMPLETED" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {apt.status === "CONFIRMED" ? "Confirmé" : 
                         apt.status === "COMPLETED" ? "Terminé" : "En attente"}
                      </Badge>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={isAccessing}
                            className="text-primary hover:text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl border border-primary/20"
                            onClick={() => handleViewPatientFile(apt.user?.id, apt.id)}
                        >
                          {isAccessing && currentAppointmentId === apt.id ? <Loader2 className="mr-2 size-3 animate-spin" /> : <FileText className="mr-2 size-3" />}
                          Dossier Patient
                        </Button>

                        {apt.type === "ONLINE" && apt.status === "CONFIRMED" && (
                            <Button 
                                asChild
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl shadow-lg shadow-blue-900/20"
                            >
                                <Link href={`/appointments/room/${apt.id}`} className="flex items-center gap-2">
                                    <VideoIcon className="size-3" /> Rejoindre l'appel
                                </Link>
                            </Button>
                        )}

                        {apt.status === "CONFIRMED" && (
                            <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl shadow-lg shadow-emerald-900/20"
                                onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                            >
                                <CheckCircle2 className="mr-2 size-3" /> Terminer
                            </Button>
                        )}

                        {apt.status !== "CONFIRMED" && apt.status !== "COMPLETED" && (
                            <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl shadow-lg shadow-green-900/20"
                                onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                            >
                                <CheckCircle className="mr-2 size-3" /> Confirmer
                            </Button>
                        )}
                        
                        {apt.status !== "COMPLETED" && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[10px] h-10 px-4 rounded-xl"
                                onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                            >
                                <XCircle className="mr-2 size-3" /> Annuler
                            </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5 flex flex-col items-center gap-4">
            <Calendar className="w-16 h-16 text-white/10" />
            <h3 className="text-xl font-black text-muted-foreground uppercase tracking-widest">Aucun rendez-vous</h3>
            <p className="text-slate-500 font-medium italic">Votre agenda est libre pour le moment.</p>
          </div>
        )}
      </div>

      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[95vh] p-0 overflow-y-auto rounded-[2.5rem] border-white/10 bg-[#020617] scrollbar-hide text-white">
          <div className="p-8 bg-primary/10 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
            <DialogHeader>
                <div className="flex items-center gap-4 mb-2 text-primary font-black uppercase tracking-[0.2em] text-xs">
                    <ShieldAlert className="size-4" /> Accès Dossier Sécurisé
                </div>
                <DialogTitle className="text-4xl font-black italic text-white tracking-tighter">
                    {patientData?.firstName} {patientData?.lastName}
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium italic">
                    Consultation des antécédents et traitements actifs pour décision thérapeutique.
                </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">Groupe Sanguin</span>
                        <span className="text-3xl font-black text-red-500 italic tracking-tighter">{patientData?.bloodGroup?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") || "N/D"}</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">Poids Corporel</span>
                        <span className="text-3xl font-black text-white italic tracking-tighter">{patientData?.weight || "N/D"} kg</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">Âge Patient</span>
                        <span className="text-3xl font-black text-white italic tracking-tighter">{patientData?.age || "N/D"} ans</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Allergies Répertoriées
                        </h4>
                        <div className="bg-amber-500/10 text-amber-200 p-6 rounded-[2rem] border border-amber-500/20 font-bold text-sm leading-relaxed">
                            {patientData?.allergies || "Aucune allergie connue à ce jour."}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Maladies Chroniques
                        </h4>
                        <div className="bg-blue-500/10 text-blue-200 p-6 rounded-[2rem] border border-blue-500/20 font-bold text-sm leading-relaxed">
                            {patientData?.chronicDiseases || "Aucun antécédent chronique signalé."}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 italic">
                       <FileText className="size-4" /> Historique des Traitements & Prescriptions
                    </h4>
                    {patientData?.treatments?.length > 0 ? (
                        <div className="grid gap-4">
                            {patientData.treatments.map((t: any) => (
                                <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                    <div className="space-y-1">
                                        <div className="font-black text-white uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{t.name}</div>
                                        <div className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">{t.dosage} • {t.frequency}</div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 font-bold">{format(new Date(t.createdAt), "dd/MM/yy")}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 border-2 border-dashed border-white/5 rounded-[2rem] text-center">
                            <p className="text-sm italic text-slate-500 font-medium">Aucun traitement enregistré dans le carnet numérique.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-primary/5 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Décision Thérapeutique</p>
                    <p className="text-base text-white font-black italic tracking-tight">Confirmez-vous la prise en charge ?</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Button 
                        variant="outline" 
                        className="flex-1 md:flex-none h-14 px-8 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
                        onClick={() => currentAppointmentId && handleUpdateStatus(currentAppointmentId, "CANCELLED")}
                    >
                        <XCircle className="mr-2 size-4" /> Annuler
                    </Button>
                    <Button 
                        className="flex-1 md:flex-none h-14 px-10 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-900/40 transition-all hover:scale-105"
                        onClick={() => currentAppointmentId && handleUpdateStatus(currentAppointmentId, "CONFIRMED")}
                    >
                        <CheckCircle className="mr-2 size-4" /> Confirmer RDV
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
