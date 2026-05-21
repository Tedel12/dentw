"use client";

import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import { useBookAppointment, useUserAppointments } from "@/hooks/use-appointment";
import { useAvailableDoctors } from "@/hooks/use-doctors";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { VideoIcon, MapPin, Calendar, Clock, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RescheduleModal } from "./RescheduleModal";
import { respondToReschedule } from "@/lib/actions/appointments";

export function PatientAppointmentsClient() {
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [selectedMode, setSelectedMode] = useState<"IN_PERSON" | "ONLINE">("IN_PERSON");
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Pour le report
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

  const { data: dentists = [] } = useAvailableDoctors();
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

  const handleSelectDentist = (dentistId: string) => {
    setSelectedDentistId(dentistId);
    setSelectedDate("");
    setSelectedTime("");
    setReason("");
    setSelectedMode("IN_PERSON");
  };

  const handleBookAppointment = async () => {
    if (!selectedDentistId || !selectedDate || !selectedTime || !reason) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const selectedDoctor = dentists.find((d: any) => d.id === selectedDentistId);

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: reason,
        type: selectedMode,
        duration: selectedDoctor?.consultationDuration || 30,
        price: 0, // Sera fixé par le docteur plus tard
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
          setSelectedDentistId(null);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Prendre un rendez-vous</h1>
        <p className="text-muted-foreground font-medium">Trouvez et prenez rendez-vous avec nos praticiens certifiés.</p>
      </div>

      <ProgressSteps currentStep={currentStep} />

      {currentStep === 1 && (
        <DoctorSelectionStep
          selectedDentistId={selectedDentistId}
          onContinue={() => setCurrentStep(2)}
          onSelectDentist={handleSelectDentist}
        />
      )}

      {currentStep === 2 && selectedDentistId && (
        <TimeSelectionStep
          selectedDentistId={selectedDentistId}
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

      {currentStep === 3 && selectedDentistId && (
        <BookingConfirmationStep
          selectedDentistId={selectedDentistId}
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

      {bookedAppointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          appointmentDetails={{
            doctorName: bookedAppointment.doctorName,
            appointmentDate: format(new Date(bookedAppointment.date), "EEEE, MMMM d, yyyy"),
            appointmentTime: bookedAppointment.time,
            userEmail: bookedAppointment.patientEmail,
          }}
        />
      )}

      {userAppointments.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic text-white">Mes rendez-vous à venir</h2>
            <div className="h-[2px] flex-1 mx-6 bg-primary/10 hidden md:block"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userAppointments.map((appointment: any) => (
              <div key={appointment.id} className="group bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md shadow-xl hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={appointment.doctorImageUrl} alt={appointment.doctorName} className="size-14 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all" />
                    <div>
                      <p className="font-black text-white">{appointment.doctorName}</p>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{appointment.reason}</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl border ${appointment.type === 'ONLINE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                    {appointment.type === 'ONLINE' ? <VideoIcon className="size-5" /> : <MapPin className="size-5" />}
                  </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                        <div className="flex-1 flex items-center gap-2">
                            <Calendar className="size-4 text-primary" />
                            <span className="text-sm font-bold text-slate-300">{format(new Date(appointment.date), "dd MMM yyyy")}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/10" />
                        <div className="flex-1 flex items-center justify-end gap-2">
                            <Clock className="size-4 text-primary" />
                            <span className="text-sm font-black text-white">{appointment.time}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Honoraires</span>
                        <span className={`text-sm font-black ${appointment.price > 0 ? 'text-emerald-400' : 'text-amber-400 italic'}`}>
                            {appointment.price > 0 ? `${appointment.price} FCFA` : 'À définir'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {appointment.type === 'ONLINE' && appointment.status === 'CONFIRMED' && (
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black italic rounded-xl h-11 shadow-lg shadow-blue-600/20 group">
                                <Link href={`/appointments/room/${appointment.id}`} className="flex items-center justify-center gap-2">
                                    <VideoIcon className="size-4 group-hover:animate-bounce" />
                                    REJOINDRE L&apos;APPEL
                                </Link>
                            </Button>
                        )}
                        
                        {appointment.status === 'CONFIRMED' && (
                            <Button 
                              variant="outline"
                              className="w-full border-primary/20 hover:bg-primary/10 text-primary font-bold rounded-xl h-11 gap-2"
                              onClick={() => setRescheduleModal({
                                isOpen: true,
                                appointmentId: appointment.id,
                                date: new Date(appointment.date),
                                time: appointment.time
                              })}
                            >
                              <RotateCcw className="w-4 h-4" /> REPORTER
                            </Button>
                        )}
                    </div>

                    {appointment.status === 'REQUESTED_RESCHEDULE' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Report en attente</p>
                                <Badge variant="outline" className="text-amber-500 border-amber-500/20 text-[8px] font-black">
                                    {appointment.proposedBy === 'PATIENT' ? 'VOTRE DEMANDE' : 'DEMANDE REÇUE'}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-300">
                                Proposé : <span className="font-bold text-white">{format(new Date(appointment.proposedDate), "dd MMM", { locale: fr })} à {appointment.proposedTime}</span>
                            </p>
                            
                            {appointment.proposedBy === 'DOCTOR' && (
                                <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-8 text-[10px]"
                                      onClick={() => handleResponseToReschedule(appointment.id, true)}
                                    >
                                        ACCEPTER
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="flex-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 font-bold h-8 text-[10px]"
                                      onClick={() => handleResponseToReschedule(appointment.id, false)}
                                    >
                                        REFUSER
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RescheduleModal 
        isOpen={rescheduleModal.isOpen}
        onClose={() => {
          setRescheduleModal(prev => ({ ...prev, isOpen: false }));
          refetchAppointments();
        }}
        appointmentId={rescheduleModal.appointmentId}
        currentDate={rescheduleModal.date}
        currentTime={rescheduleModal.time}
        proposedBy="PATIENT"
      />
    </>
  );
}
