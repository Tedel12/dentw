"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    User, Info, Shield, Activity, FileText, CheckCircle2, 
    ShieldAlert, Loader2, Mail, Calendar, Clock, Stethoscope,
    XCircle
} from "lucide-react";
import { toast } from "sonner";
import { checkDoctorAccess, requestHealthAccess, getPatientHealthData } from "@/lib/actions/health";
import { completeAppointment } from "@/lib/actions/appointments";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface RoomSidebarProps {
    appointment: any;
    isDoctor: boolean;
}

export default function RoomSidebar({ appointment, isDoctor }: RoomSidebarProps) {
    const router = useRouter();
    const [patientData, setPatientData] = useState<any>(null);
    const [isAccessing, setIsAccessing] = useState(false);
    const [showFileDialog, setShowFileDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [summary, setSummary] = useState("");
    const [isCompleting, setIsCompleting] = useState(false);

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const handleViewPatientFile = async () => {
        setIsAccessing(true);
        try {
            const patientId = appointment.userId || appointment.user?.id;
            const hasAccess = await checkDoctorAccess(patientId, appointment.doctorId || appointment.doctor?.id);
            
            if (!hasAccess) {
                const res = await requestHealthAccess(patientId, appointment.doctorId || appointment.doctor?.id);
                if (res.success) {
                    toast.info("Demande d'accès envoyée. Le patient doit valider la notification sur son dashboard.");
                } else {
                    toast.error(res.error || "Erreur lors de la demande d'accès");
                }
                return;
            }

            const dataRes = await getPatientHealthData(patientId, appointment.doctorId || appointment.doctor?.id);
            if (dataRes.success) {
                setPatientData(dataRes.data);
                setIsSidePanelOpen(true); // On ouvre le panneau latéral plutôt que le dialogue si on veut une vue "split"
            } else {
                toast.error("Impossible de récupérer les données");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsAccessing(false);
        }
    };

    const handleCompleteSession = async () => {
        setIsCompleting(true);
        try {
            const res = await completeAppointment({ 
                id: appointment.id, 
                summary: isDoctor ? summary : "Session terminée par le patient." 
            });
            if (res.success) {
                toast.success("Consultation clôturée avec succès");
                router.push(isDoctor ? "/pro/patients" : "/dashboard");
            } else {
                toast.error("Erreur lors de la clôture");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setIsCompleting(false);
            setShowCloseDialog(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Infos Praticien / Patient */}
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm overflow-hidden rounded-3xl">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4 px-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {isDoctor ? "Patient connecté" : "Votre Praticien"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-primary/30 flex items-center justify-center text-xl font-black text-primary italic">
                            {isDoctor ? appointment.user.firstName?.[0] : appointment.doctor.name?.[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-white truncate">
                                {isDoctor ? `${appointment.user.firstName} ${appointment.user.lastName}` : `Dr. ${appointment.doctor.name}`}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                {isDoctor ? appointment.user.email : appointment.doctor.speciality}
                            </p>
                        </div>
                    </div>
                    
                    {isDoctor ? (
                        <Button 
                            onClick={handleViewPatientFile}
                            disabled={isAccessing}
                            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-11 rounded-xl font-bold text-xs group"
                        >
                            {isAccessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                            OUVRIR LE DOSSIER MÉDICAL
                        </Button>
                    ) : (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-[10px] text-slate-300 font-bold italic leading-relaxed text-center">
                                "Le Dr. {appointment.doctor.name} a accès à votre historique pour assurer la qualité du diagnostic en direct."
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Détails du RDV */}
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="py-4 px-6">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-primary" />
                        Motif de la session
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                            "{appointment.reason || "Non précisé"}"
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Section Actions Spéciales */}
            <div className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 px-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Actions de session
                </h3>
                
                <Button 
                    onClick={() => setShowCloseDialog(true)}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black italic shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
                >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    MARQUER COMME TERMINÉ
                </Button>
            </div>

            {/* DIALOG: Dossier Médical (Côté Docteur) */}
            <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-white/10 bg-[#020617] text-white shadow-2xl">
                    <div className="p-8 bg-primary/10 border-b border-white/5 backdrop-blur-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                <ShieldAlert className="size-4" /> Consultation du carnet numérique
                            </div>
                            <DialogTitle className="text-4xl font-black italic tracking-tighter">
                                {patientData?.firstName} {patientData?.lastName}
                            </DialogTitle>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge className="bg-slate-800 text-slate-300 border-none font-bold uppercase text-[9px]">{patientData?.email}</Badge>
                                <div className="h-1 w-1 rounded-full bg-slate-700" />
                                <span className="text-xs text-slate-500 italic font-medium">Accès autorisé par le patient</span>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 overflow-y-auto max-h-[60vh] space-y-10 custom-scrollbar">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Groupe Sanguin</span>
                                <p className="text-2xl font-black text-red-500 italic">{patientData?.bloodGroup?.replace("_", " ") || "N/A"}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Allergies</span>
                                <p className="text-sm font-bold text-white truncate">{patientData?.allergies || "Aucune"}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Traitements Actifs</span>
                                <p className="text-sm font-bold text-white">{patientData?.treatments?.length || 0} en cours</p>
                            </div>
                        </div>

                        {/* Timeline de santé */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" /> Historique récent
                            </h4>
                            
                            <div className="space-y-4">
                                {patientData?.treatments?.map((t: any) => (
                                    <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                        <div>
                                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Prescription</p>
                                            <p className="font-black text-white text-lg tracking-tight">{t.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{t.dosage} • {t.frequency}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-white/10 text-slate-500">{format(new Date(t.createdAt), "dd/MM/yyyy")}</Badge>
                                    </div>
                                ))}

                                {patientData?.appointments?.map((apt: any) => (
                                    <div key={apt.id} className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Consultation passée</p>
                                            <p className="font-black text-white text-lg tracking-tight">Dr. {apt.doctor.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[400px]">"{apt.summary}"</p>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black">{format(new Date(apt.date), "dd/MM/yyyy")}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                        <Button onClick={() => setShowFileDialog(false)} className="rounded-xl font-bold px-8">Fermer</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DIALOG: Clôture de session */}
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent className="rounded-[2rem] bg-slate-900 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Clôturer la séance</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            Une fois validé, ce rendez-vous sera archivé dans l'historique médical.
                        </DialogDescription>
                    </DialogHeader>

                    {isDoctor && (
                        <div className="py-4 space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/80">Résumé de la consultation (Visible par le patient)</label>
                            <Textarea 
                                placeholder="Ex: Patient présente une gingivite légère. Prescription d'un bain de bouche..."
                                className="bg-black/20 border-white/10 rounded-xl min-h-[100px] text-sm font-medium"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowCloseDialog(false)} className="rounded-xl font-bold">Annuler</Button>
                        <Button 
                            onClick={handleCompleteSession}
                            disabled={isCompleting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black italic rounded-xl px-6"
                        >
                            {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "CONFIRMER & ARCHIVER"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SIDE PANEL PERSISTANT (Optionnel) */}
            {isSidePanelOpen && (
                <div className="fixed inset-y-0 right-0 w-[450px] bg-[#020617] border-l border-white/10 z-[100] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                    <div className="p-6 bg-primary/10 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black italic text-white tracking-tighter">
                                {patientData?.firstName} {patientData?.lastName}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dossier en direct</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsSidePanelOpen(false)} className="rounded-full hover:bg-white/5">
                            <XCircle className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Groupe Sanguin</span>
                                <p className="text-xl font-black text-red-500 italic">{patientData?.bloodGroup?.replace("_", " ") || "N/A"}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Allergies</span>
                                <p className="text-xs font-bold text-white truncate">{patientData?.allergies || "Aucune"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-primary" /> Traitements
                            </h4>
                            {patientData?.treatments?.map((t: any) => (
                                <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="font-black text-white text-sm">{t.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold">{t.dosage} • {t.frequency}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Stethoscope className="w-3.5 h-3.5 text-emerald-500" /> Consultations
                            </h4>
                            {patientData?.appointments?.map((apt: any) => (
                                <div key={apt.id} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="font-black text-white text-sm">Dr. {apt.doctor?.name || "Externe"}</p>
                                    <p className="text-[9px] text-slate-400 italic line-clamp-2 mt-1">"{apt.summary}"</p>
                                    <Badge className="mt-2 bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">
                                        {format(new Date(apt.date), "dd/MM/yyyy")}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
