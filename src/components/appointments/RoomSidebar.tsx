"use client";

import { useState } from "react";
import { Watermark } from "@/components/ui/watermark";
import { BlurData } from "@/components/ui/blur-data";
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
                    toast.info("Demande d'accès envoyée.");
                } else {
                    toast.error(res.error || "Erreur lors de la demande d'accès");
                }
                return;
            }

            const dataRes = await getPatientHealthData(patientId, appointment.doctorId || appointment.doctor?.id);
            if (dataRes.success) {
                setPatientData(dataRes.data);
                setIsSidePanelOpen(true);
                toast.info("Protection active : Survolez les zones floutées pour afficher les données.", {
                    duration: 5000,
                    position: "top-center",
                });
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
                                "Le Dr. {appointment.doctor.name} a accès à votre historique pour assurer la qualité du diagnostic."
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

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

            <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
                            <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 rounded-[2.5rem] border-white/10 bg-[#020617] overflow-y-auto text-white">
                <div className="p-8 bg-primary/10 border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-2 text-primary font-black uppercase tracking-[0.2em] text-xs">
                            <ShieldAlert className="size-4" /> Accès Dossier Sécurisé
                        </div>
                        <DialogTitle className="text-4xl font-black italic text-white tracking-tighter">
                            {patientData?.firstName} {patientData?.lastName}
                        </DialogTitle>
                    </DialogHeader>
                </div>
                <div className="p-8 space-y-10">
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
                </div>
            </DialogContent>
            </Dialog>

            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent className="rounded-[2rem] bg-slate-900 border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Clôturer la séance</DialogTitle>
                    </DialogHeader>
                    {isDoctor && (
                        <div className="py-4 space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/80">Résumé</label>
                            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleCompleteSession}>CONFIRMER & ARCHIVER</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isSidePanelOpen && isDoctor && (
                <div className="fixed inset-y-0 right-0 w-[450px] bg-[#020617] border-l border-white/10 z-[100] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                    <Watermark doctorId={appointment.doctorId || "DOC"} />
                    <div className="p-6 bg-primary/10 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xl font-black italic text-white tracking-tighter">
                            {patientData?.firstName} {patientData?.lastName}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsSidePanelOpen(false)}><XCircle className="w-5 h-5 text-slate-400" /></Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Groupe Sanguin</span>
                                <BlurData>
                                    <p className="text-xl font-black text-red-500 italic">{patientData?.bloodGroup?.replace("_", " ") || "N/A"}</p>
                                </BlurData>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Allergies</span>
                                <BlurData>
                                    <p className="text-xs font-bold text-white truncate">{patientData?.allergies || "Aucune"}</p>
                                </BlurData>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-primary" /> Traitements
                            </h4>
                            <BlurData>
                                {patientData?.treatments?.map((t: any) => (
                                    <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/5 mb-2">
                                        <p className="font-black text-white text-sm">{t.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold">{t.dosage} • {t.frequency}</p>
                                    </div>
                                ))}
                            </BlurData>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
