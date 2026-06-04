"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, User, ShieldAlert, ShieldCheck, Lock, ChevronRight, History, PlusCircle, Stethoscope, QrCode,
  FileText, Upload, MapPin, Download, AlertCircle, Clock, HeartPulse, Calendar, RefreshCcw, Video,
  Badge, RotateCcw
} from "lucide-react";
import {
  searchPatient,
  requestHealthAccess,
  checkDoctorAccess,
  getPatientHealthData,
  getDoctorPatientById,
  getHealthAccessRequest,
} from "@/lib/actions/health";
import { trackRecentPatient, getRecentPatients } from "@/lib/actions/history";
import { completeDoctorProfile } from "@/lib/actions/users";
import { toast } from "sonner";
import { AddPrescriptionForm } from "@/components/health/AddPrescriptionForm";
import { BlurData } from "@/components/ui/blur-data";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QRScanner } from "@/components/pro/QRScanner";
import { CONTRACT_TEMPLATE } from "@/lib/contract-template";
import jsPDF from "jspdf";
import { APP_NAME } from "@/lib/brand";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import { useBookAppointment, useUserAppointments } from "@/hooks/use-appointment";
import { useAvailableDoctors } from "@/hooks/use-doctors";
import { respondToReschedule } from "@/lib/actions/appointments";
import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import Link from "next/link";

export function PatientAppointmentsClient() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [selectedMode, setSelectedMode] = useState<"IN_PERSON" | "ONLINE">("IN_PERSON");
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const { data: doctors = [] } = useAvailableDoctors();
  const bookAppointmentMutation = useBookAppointment();
  const { data: userAppointments = [], refetch: refetchAppointments } = useUserAppointments();

  const handleResponseToReschedule = async (id: string, accept: boolean) => {
    const res = await respondToReschedule(id, accept);
    if (res.success) {
      toast.success(accept ? "Report accepté !" : "Report refusé.");
      refetchAppointments();
    } else {
      toast.error(res.error || "Une erreur est survenue");
    }
  };

  const handleSelectDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedDate("");
    setSelectedTime("");
    setReason("");
    setSelectedMode("IN_PERSON");
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTime || !reason) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const selectedDoctor = doctors.find((d: any) => d.id === selectedDoctorId);

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDoctorId,
        date: selectedDate,
        time: selectedTime,
        reason: reason,
        type: selectedMode,
        duration: selectedDoctor?.consultationDuration || 30,
        price: 0,
      },
      {
        onSuccess: async (appointment) => {
          setBookedAppointment(appointment);
          try {
            await fetch("/api/send-appointment-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: appointment.patientEmail,
                doctorName: appointment.doctorName,
                appointmentDate: format(new Date(appointment.date), "EEEE, MMMM d, yyyy"),
                appointmentTime: appointment.time,
                appointmentType: reason,
                duration: `${selectedDoctor?.consultationDuration || 30} min`,
                price: "À définir",
                mode: selectedMode,
                roomId: appointment.id
              }),
            });
          } catch (error) {}
          setShowConfirmationModal(true);
          setSelectedDoctorId(null);
          setSelectedDate("");
          setSelectedTime("");
          setReason("");
          setCurrentStep(1);
        },
        onError: (error) => toast.error(`Erreur : ${error.message}`),
      }
    );
  };

  return (
    <>
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Prendre un rendez-vous</h1>
        <p className="text-muted-foreground font-medium">Trouvez et prenez rendez-vous avec nos praticiens certifiés sur Benin Santé.</p>
      </div>

      <ProgressSteps currentStep={currentStep} />

      {currentStep === 1 && (
        <DoctorSelectionStep
          selectedDoctorId={selectedDoctorId}
          onContinue={() => setCurrentStep(2)}
          onSelectDoctor={handleSelectDoctor}
        />
      )}

      {currentStep === 2 && selectedDoctorId && (
        <TimeSelectionStep
          selectedDoctorId={selectedDoctorId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          reason={reason}
          selectedMode={selectedMode}
          onBack={() => setCurrentStep(1)}
          onContinue={() => setCurrentStep(3)}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onReasonChange={setReason}
          onModeChange={setSelectedMode}
        />
      )}

      {currentStep === 3 && selectedDoctorId && (
        <BookingConfirmationStep
          selectedDoctorId={selectedDoctorId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          reason={reason}
          selectedMode={selectedMode}
          isBooking={bookAppointmentMutation.isPending}
          onBack={() => setCurrentStep(2)}
          onModify={() => setCurrentStep(2)}
          onConfirm={handleBookAppointment}
        />
      )}

      <div className="mt-12 md:mt-20 space-y-6 md:space-y-8 animate-in fade-in duration-1000 delay-300">
        <div className="flex items-center gap-2 md:gap-3">
            <div className="size-8 md:size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="size-4 md:size-5 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase">Mes Rendez-vous</h2>
        </div>

        {userAppointments.length === 0 ? (
          <Card className="bg-slate-900/40 border-white/5 rounded-3xl p-8 md:p-12 text-center border-dashed border-2">
            <p className="text-slate-500 text-sm md:text-base font-medium italic text-center">Vous n'avez pas encore de rendez-vous programmé.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {userAppointments.map((appointment: any) => (
                <Card key={appointment.id} className="bg-slate-900/40 border-white/5 rounded-[1.5rem] md:rounded-3xl overflow-hidden backdrop-blur-sm group hover:border-primary/30 transition-all duration-500 shadow-xl">
                    <div className="p-5 md:p-6 space-y-4 md:space-y-6">
                        <div className="flex items-center justify-between gap-2">
                            <Badge className={`${
                                appointment.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                                appointment.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 
                                'bg-primary/10 text-primary'
                            } border-none font-black uppercase text-[8px] md:text-[10px] tracking-widest px-2 md:px-3`}>
                                {appointment.status === 'COMPLETED' ? 'Terminé' : appointment.status === 'CANCELLED' ? 'Annulé' : 'Confirmé'}
                            </Badge>
                            <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                                {appointment.type === 'ONLINE' ? <Video className="size-3 md:size-4 text-blue-400" /> : <MapPin className="size-3 md:size-4 text-amber-400" />}
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{appointment.type === 'ONLINE' ? 'Vidéo' : 'Cabinet'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 text-left min-w-0">
                            <div className="size-10 md:size-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all shrink-0">
                                <User className="size-5 md:size-7 text-primary" />
                            </div>
                            <div className="min-w-0 text-left">
                                <h3 className="font-black text-white text-sm md:text-lg italic tracking-tight uppercase truncate">{appointment.doctorName}</h3>
                                <p className="text-[10px] md:text-xs text-slate-500 font-medium italic truncate">"{appointment.reason}"</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-3 text-left">
                            <div className="bg-black/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-2 md:gap-3">
                                <Calendar className="size-3.5 md:size-4 text-primary shrink-0" />
                                <span className="text-xs md:text-sm font-black text-white truncate">{format(new Date(appointment.date), "dd MMM", { locale: fr })}</span>
                            </div>
                            <div className="bg-black/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-2 md:gap-3">
                                <Clock className="size-3.5 md:size-4 text-primary shrink-0" />
                                <span className="text-xs md:text-sm font-black text-white">{appointment.time}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-black/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Honoraires</span>
                            <span className={`text-xs md:text-sm font-black ${appointment.price > 0 ? 'text-emerald-400' : 'text-amber-400 italic'}`}>
                                {appointment.price > 0 ? `${appointment.price} FCFA` : 'À définir'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1 md:pt-0">
                            {appointment.status === 'REQUESTED_RESCHEDULE' && (
                                <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in duration-500 text-left">
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                            <RotateCcw className="size-3" /> Nouvelle proposition
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white">
                                                {appointment.proposedDate ? format(new Date(appointment.proposedDate), "dd MMMM", { locale: fr }) : "Date à définir"} à {appointment.proposedTime}
                                            </p>
                                            <p className="text-xs text-slate-400 italic">"{appointment.rescheduleReason}"</p>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-1">
                                            <Button 
                                                size="sm" 
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 h-9 rounded-xl font-bold text-[10px] uppercase"
                                                onClick={() => handleResponseToReschedule(appointment.id, true)}
                                            >
                                                Accepter
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 h-9 rounded-xl font-bold text-[10px] uppercase"
                                                onClick={() => handleResponseToReschedule(appointment.id, false)}
                                            >
                                                Refuser
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {appointment.status === 'CONFIRMED' && (
                                <>
                                    {appointment.type === 'ONLINE' && (
                                        <Link href={`/appointments/room/${appointment.id}`} className="w-full">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-500 h-10 md:h-11 rounded-lg md:rounded-xl font-black italic gap-2 shadow-lg shadow-blue-500/20 text-xs md:text-sm uppercase tracking-tight">
                                                <Video className="size-3.5 md:size-4" /> REJOINDRE L'APPEL
                                            </Button>
                                        </Link>
                                    )}
                                    <Button variant="outline" className="w-full h-10 md:h-11 border-white/5 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl font-bold gap-2 text-xs md:text-sm uppercase tracking-tight">
                                        <RefreshCcw className="size-3.5 md:size-4 text-primary" /> REPROGRAMMER
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
          </div>
        )}
      </div>

      <AppointmentConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        appointment={bookedAppointment}
      />
    </>
  );
}
