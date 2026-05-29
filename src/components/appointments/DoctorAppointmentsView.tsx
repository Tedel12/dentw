"use client";

import { useState } from "react";
import { updateAppointmentStatus, respondToReschedule, completeAppointment } from "@/lib/actions/appointments";
import { checkDoctorAccess, requestHealthAccess, getPatientHealthData, getHealthAccessRequest } from "@/lib/actions/health";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, User, Mail, FileText, CheckCircle, XCircle, 
  Settings, Video, MapPin, HeartPulse,
  MoreVertical, RefreshCcw, ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { DoctorSettingsClient } from "@/components/admin/DoctorSettingsClient";
import { RescheduleModal } from "./RescheduleModal";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface DoctorAppointmentsViewProps {
  appointments: any[];
  doctorProfile?: any;
}

export function DoctorAppointmentsView({ 
  appointments: initialAppointments,
  doctorProfile 
}: DoctorAppointmentsViewProps) {
  const { user: clerkUser } = useUser();
  const [appointments, setAppointments] = useState(
    initialAppointments.filter(apt => apt.status !== "COMPLETED" && apt.status !== "CANCELLED")
  );
  const [patientData, setPatientData] = useState<any>(null);
  const [isAccessing, setIsAccessing] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);

  // Pour la complétion
  const [completionData, setCompletionData] = useState({
    price: "",
    summary: "",
    duration: "30"
  });

  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    appointmentId: string;
    date: Date;
    time: string;
  }>({
    isOpen: false,
    appointmentId: "",
    date: new Date(),
    time: "",
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      if (status === "COMPLETED") {
        setCurrentAppointmentId(id);
        const apt = appointments.find(a => a.id === id);
        setCompletionData({
            price: "",
            summary: "",
            duration: apt?.duration?.toString() || "30"
        });
        setShowCompleteDialog(true);
        return;
      }

      await updateAppointmentStatus({ id, status: status as any });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
      toast.success(status === "CONFIRMED" ? "Rendez-vous confirmé" : "Rendez-vous annulé");
      if (showFileDialog) setShowFileDialog(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleResponseToReschedule = async (id: string, accept: boolean) => {
    try {
        const res = await respondToReschedule(id, accept);
        if (res.success) {
            toast.success(accept ? "Report accepté !" : "Report refusé.");
            setAppointments(prev => prev.map(apt => {
                if (apt.id === id) {
                    return {
                        ...apt,
                        status: "CONFIRMED",
                        date: accept ? apt.proposedDate : apt.date,
                        time: accept ? apt.proposedTime : apt.time,
                        proposedDate: null,
                        proposedTime: null
                    };
                }
                return apt;
            }));
        } else {
            toast.error(res.error || "Erreur lors de la réponse");
        }
    } catch (error) {
        toast.error("Une erreur est survenue");
    }
  };

  const handleFinalizeCompletion = async () => {
    if (!currentAppointmentId) return;

    try {
        const res = await completeAppointment({
            id: currentAppointmentId,
            price: parseFloat(completionData.price) || 0,
            summary: completionData.summary,
            duration: parseInt(completionData.duration) || 30
        });

        if (res.success) {
            toast.success("Consultation clôturée avec succès");
            setAppointments(prev => prev.filter(apt => apt.id !== currentAppointmentId));
            setShowCompleteDialog(false);
        } else {
            toast.error("Erreur lors de la clôture");
        }
    } catch (error) {
        toast.error("Une erreur est survenue");
    }
  };

  const handleViewPatientFile = async (patientId: string, doctorId: string) => {
    setIsAccessing(true);
    try {
      const hasAccess = await checkDoctorAccess(patientId, doctorId);
      
      if (!hasAccess) {
        const requestRes = await getHealthAccessRequest(patientId, doctorId);
        if (requestRes.success && requestRes.request) {
            if (requestRes.request.status === 'PENDING') {
                toast.info("Une demande d'accès est déjà en attente de validation par le patient.");
                setIsAccessing(false);
                return;
            } else if (requestRes.request.status === 'REJECTED') {
                toast.error("Le patient a refusé votre demande d'accès au dossier.");
                setIsAccessing(false);
                return;
            }
        }

        const res = await requestHealthAccess(patientId, doctorId);
        if (res.success) {
          toast.info("Demande d'accès envoyée au patient. Vous pourrez voir le dossier dès qu'il l'aura validée.");
        } else {
          toast.error(res.error || "Impossible d'envoyer la demande d'accès");
        }
        setIsAccessing(false);
        return;
      }

      const res = await getPatientHealthData(patientId, doctorId);
      if (res.success) {
        setPatientData(res.data);
        setShowFileDialog(true);
      } else {
        toast.error(res.error || "Impossible de lire le dossier");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setIsAccessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-white">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
             <HeartPulse className="w-10 h-10 text-primary" /> Vos Rendez-vous
          </h1>
          <p className="text-slate-400 font-medium italic">Gérez vos consultations et accédez aux dossiers patients.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button 
                variant="outline" 
                onClick={() => setShowSettingsDialog(true)}
                className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 h-12 px-6 font-bold"
            >
                <Settings className="w-4 h-4 mr-2 text-primary" />
                PARAMÈTRES CABINET
            </Button>
            <Link href="/pro/patients">
                <Button className="rounded-2xl h-12 px-6 font-black italic shadow-xl shadow-primary/20">
                    <User className="w-4 h-4 mr-2" />
                    RECHERCHE PATIENT
                </Button>
            </Link>
        </div>
      </div>

      {appointments.length === 0 ? (
        <Card className="bg-slate-900/40 border-white/5 rounded-[3rem] p-20 text-center backdrop-blur-md">
            <div className="size-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Calendar className="size-10 text-slate-700" />
            </div>
            <h2 className="text-2xl font-black text-slate-500 italic uppercase tracking-widest">Aucun rendez-vous à venir</h2>
            <p className="text-slate-600 mt-2 font-medium">Vos futurs rendez-vous apparaîtront ici dès qu'un patient réservera.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt) => (
            <Card key={apt.id} className="bg-slate-900/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden backdrop-blur-md group shadow-2xl">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                        <Image
                        src={apt.user.imageUrl || "/logo.png"}
                        alt={apt.user.firstName}
                        width={60}
                        height={60}
                        className="rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-primary/40 transition-all duration-500"
                        />
                        <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-slate-900 ${apt.status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic text-white tracking-tight">{apt.user.firstName} {apt.user.lastName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="border-white/10 text-[10px] text-slate-500 font-black uppercase px-2 py-0">
                            ID: {apt.id.slice(-6)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 text-slate-500">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white rounded-2xl p-2 min-w-[200px]">
                        <DropdownMenuItem 
                            onClick={() => setRescheduleModal({ isOpen: true, appointmentId: apt.id, date: new Date(apt.date), time: apt.time })}
                            className="rounded-xl gap-3 p-3 font-bold hover:bg-primary/10 hover:text-primary cursor-pointer"
                        >
                            <RefreshCcw className="w-4 h-4" /> REPROGRANNER
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                            className="rounded-xl gap-3 p-3 font-bold text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                            <XCircle className="w-4 h-4" /> ANNULER LE RDV
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date</p>
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{format(new Date(apt.date), "dd MMM yyyy", { locale: fr })}</span>
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Heure</p>
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{apt.time}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Motif de visite
                    </p>
                    <p className="text-sm font-medium text-slate-300 italic line-clamp-2">
                        "{apt.reason}"
                    </p>
                </div>

                {apt.status === 'REQUESTED_RESCHEDULE' && (
                    <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-500">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                <RotateCcw className="size-3" /> Proposition du patient
                            </p>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-white">
                                    {apt.proposedDate ? format(new Date(apt.proposedDate), "dd MMMM", { locale: fr }) : "Date à définir"} à {apt.proposedTime}
                                </p>
                                <p className="text-xs text-slate-400 italic">"{apt.rescheduleReason}"</p>
                            </div>
                            
                            <div className="flex gap-2 pt-1">
                                <Button 
                                    size="sm" 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 h-9 rounded-xl font-bold text-[10px] uppercase"
                                    onClick={() => handleResponseToReschedule(apt.id, true)}
                                >
                                    Accepter
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 h-9 rounded-xl font-bold text-[10px] uppercase"
                                    onClick={() => handleResponseToReschedule(apt.id, false)}
                                >
                                    Refuser
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {apt.type === 'ONLINE' ? (
                        <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                            <Video className="w-3 h-3" /> Téléconsultation
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5" /> En Cabinet
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="rounded-xl h-12 bg-white/5 border-white/10 hover:bg-white/10 font-bold gap-2"
                        onClick={() => handleViewPatientFile(apt.userId, doctorProfile.id)}
                        disabled={isAccessing}
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        DOSSIER
                      </Button>
                      
                      {apt.type === 'ONLINE' ? (
                        <Link href={`/appointments/room/${apt.id}`} className="flex-1">
                            <Button className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-500 font-black italic gap-2 shadow-lg shadow-blue-500/20">
                                <Video className="w-4 h-4" /> REJOINDRE
                            </Button>
                        </Link>
                      ) : (
                        <Button
                            className="rounded-xl h-12 bg-primary hover:bg-primary/90 font-black italic gap-2 shadow-lg shadow-primary/20"
                            onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                        >
                            <CheckCircle className="w-4 h-4" /> CLÔTURER
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODALE DOSSIER PATIENT */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[3rem] bg-[#020617] border-white/10 text-white p-0 overflow-hidden">
          {patientData && (
            <div className="flex flex-col h-full">
              <div className="p-8 border-b border-white/5 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <User className="size-8 text-primary" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                            Dossier de {patientData.firstName} {patientData.lastName}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium italic">
                            Accès temporaire sécurisé • {patientData.email}
                        </DialogDescription>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Groupe Sanguin</span>
                        <span className="text-xl font-black text-red-500">{patientData.bloodGroup?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}</span>
                    </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Âge</p>
                        <p className="font-bold text-white">{patientData.age || 'N/R'} ans</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Poids</p>
                        <p className="font-bold text-white">{patientData.weight || 'N/R'} kg</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Électrophorèse</p>
                        <p className="font-bold text-white">{patientData.electrophoresis || 'N/R'}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genre</p>
                        <p className="font-bold text-white uppercase">{patientData.gender === 'MALE' ? 'Homme' : 'Femme'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <ShieldAlert className="size-4" /> Allergies
                        </h4>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-amber-200 text-sm font-medium italic">
                            {patientData.allergies || "Aucune allergie signalée."}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <HeartPulse className="size-4" /> Pathologies Chroniques
                        </h4>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-200 text-sm font-medium">
                            {patientData.chronicDiseases || "Aucune pathologie signalée."}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="size-4" /> Derniers Traitements
                    </h4>
                    <div className="grid gap-3">
                        {patientData.treatments?.length > 0 ? (
                            patientData.treatments.slice(0, 3).map((t: any) => (
                                <div key={t.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-primary/20 transition-all">
                                    <div>
                                        <p className="font-bold text-white">{t.name}</p>
                                        <p className="text-[10px] text-slate-500 italic">{t.dosage} • {t.duration} jours</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-3 py-1 rounded-full uppercase">
                                        {format(new Date(t.createdAt), "dd/MM/yy")}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-600 text-sm italic">Aucun historique de traitement.</p>
                        )}
                    </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-white/5 border-t border-white/5 mt-auto">
                <Button onClick={() => setShowFileDialog(false)} className="w-full rounded-2xl h-12 font-black italic">
                    FERMER LE DOSSIER
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODALE PARAMÈTRES CABINET */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-[3rem] bg-[#020617] border-white/10 text-white p-8 custom-scrollbar">
            <DoctorSettingsClient doctor={doctorProfile} />
        </DialogContent>
      </Dialog>

      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ ...rescheduleModal, isOpen: false })}
        onSuccess={() => {
            setRescheduleModal({ ...rescheduleModal, isOpen: false });
            toast.success("Proposition de report envoyée au patient.");
        }}
        appointmentId={rescheduleModal.appointmentId}
        currentDate={rescheduleModal.date}
        currentTime={rescheduleModal.time}
        proposedBy="DOCTOR"
      />

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-white/10 bg-[#020617] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic">Clôturer la consultation</DialogTitle>
            <DialogDescription className="text-slate-400">
              Saisissez le montant final et un résumé de la consultation pour le patient.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-primary">Montant de la consultation (FCFA)</Label>
              <Input 
                id="price"
                type="number"
                placeholder="Ex: 5000"
                value={completionData.price}
                onChange={(e) => setCompletionData({...completionData, price: e.target.value})}
                className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-primary">Durée effective (minutes)</Label>
              <Input 
                id="duration"
                type="number"
                placeholder="30"
                value={completionData.duration}
                onChange={(e) => setCompletionData({...completionData, duration: e.target.value})}
                className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-[10px] font-black uppercase tracking-widest text-primary">Résumé / Note médicale</Label>
              <Textarea 
                id="summary"
                placeholder="Résumé des soins prodigués..."
                value={completionData.summary}
                onChange={(e) => setCompletionData({...completionData, summary: e.target.value})}
                className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button 
                variant="ghost" 
                onClick={() => setShowCompleteDialog(false)}
                className="flex-1 rounded-xl h-12 font-bold text-slate-400 hover:text-white"
            >
                ANNULER
            </Button>
            <Button 
                onClick={handleFinalizeCompletion}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-black italic rounded-xl h-12 shadow-lg shadow-primary/20"
                disabled={!completionData.price}
            >
                VALIDER & CLÔTURER
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
