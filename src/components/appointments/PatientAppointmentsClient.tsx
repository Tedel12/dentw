"use client";

import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import { useBookAppointment, useUserAppointments } from "@/hooks/use-appointment";
import { APPOINTMENT_TYPES } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export function PatientAppointmentsClient() {
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const bookAppointmentMutation = useBookAppointment();
  const { data: userAppointments = [] } = useUserAppointments();

  const handleSelectDentist = (dentistId: string) => {
    setSelectedDentistId(dentistId);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
  };

  const handleBookAppointment = async () => {
    if (!selectedDentistId || !selectedDate || !selectedTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: appointmentType?.name,
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
                appointmentType: appointmentType?.name,
                duration: appointmentType?.duration,
                price: appointmentType?.price,
              }),
            });
          } catch (error) {}
          setShowConfirmationModal(true);
          setSelectedDentistId(null);
          setSelectedDate("");
          setSelectedTime("");
          setSelectedType("");
          setCurrentStep(1);
        },
        onError: (error) => toast.error(`Erreur : ${error.message}`),
      }
    );
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Prendre un rendez-vous</h1>
        <p className="text-muted-foreground">Trouvez et prenez rendez-vous avec nos praticiens.</p>
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
          selectedType={selectedType}
          onBack={() => setCurrentStep(1)}
          onContinue={() => setCurrentStep(3)}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onTypeChange={setSelectedType}
        />
      )}

      {currentStep === 3 && selectedDentistId && (
        <BookingConfirmationStep
          selectedDentistId={selectedDentistId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedType={selectedType}
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
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-white">Mes rendez-vous à venir</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userAppointments.map((appointment: any) => (
              <div key={appointment.id} className="bg-card/50 border border-primary/10 rounded-2xl p-5 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4 mb-4 text-white">
                  <img src={appointment.doctorImageUrl} alt={appointment.doctorName} className="size-12 rounded-full ring-2 ring-primary/20" />
                  <div>
                    <p className="font-bold">{appointment.doctorName}</p>
                    <p className="text-muted-foreground text-xs font-medium">{appointment.reason}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm bg-primary/5 p-3 rounded-xl border border-primary/5 text-white">
                  <span className="flex items-center gap-1.5 font-medium italic">{format(new Date(appointment.date), "dd MMM yyyy")}</span>
                  <span className="font-black text-primary">{appointment.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
