import { getDoctorAppointmentTypes } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon, VideoIcon, MapPin, ShieldCheck, Wallet, CalendarDays, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DoctorInfo from "./DoctorInfo";
import { useAvailableDoctors } from "@/hooks/use-doctors";

interface BookingConfirmationStepProps {
  selectedDentistId: string;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
  selectedMode: "IN_PERSON" | "ONLINE";
  isBooking: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onModify: () => void;
}

function BookingConfirmationStep({
  selectedDentistId,
  selectedDate,
  selectedTime,
  selectedType,
  selectedMode,
  isBooking,
  onBack,
  onConfirm,
  onModify,
}: BookingConfirmationStepProps) {
  const { data: dentists = [] } = useAvailableDoctors();
  const selectedDoctor = dentists.find((d: any) => d.id === selectedDentistId);
  
  const appointmentTypes = getDoctorAppointmentTypes(selectedDoctor?.basePrice || 3000);
  const appointmentType = appointmentTypes.find((t) => t.id === selectedType);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="rounded-xl hover:bg-white/5 font-bold">
          <ChevronLeftIcon className="w-4 h-4 mr-2 text-primary" />
          Retour
        </Button>
        <h2 className="text-2xl font-black italic">
          Confirmation finale
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-primary/10 border-b border-primary/10 py-6">
                    <CardTitle className="text-lg font-black italic flex items-center gap-3">
                        <ShieldCheck className="size-6 text-primary" />
                        Récapitulatif du rendez-vous
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                    {/* doctor info */}
                    <DoctorInfo doctorId={selectedDentistId} />

                    {/* appointment details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                        <div className="flex items-start gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                            <CalendarDays className="size-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Date</p>
                                <p className="font-bold text-slate-200">
                                    {new Date(selectedDate).toLocaleDateString("fr-FR", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                            <Clock className="size-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Heure & Durée</p>
                                <p className="font-bold text-slate-200">{selectedTime} <span className="text-primary/60 ml-2">({appointmentType?.duration})</span></p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                            {selectedMode === 'ONLINE' ? <VideoIcon className="size-5 text-blue-400 mt-0.5" /> : <MapPin className="size-5 text-primary mt-0.5" />}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Lieu / Mode</p>
                                <p className={`font-bold ${selectedMode === 'ONLINE' ? 'text-blue-400' : 'text-slate-200'}`}>
                                    {selectedMode === 'ONLINE' ? 'Téléconsultation (Vidéo)' : 'En Cabinet (Présentiel)'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                            <Wallet className="size-5 text-emerald-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Coût estimé</p>
                                <p className="font-black text-emerald-400">{appointmentType?.price}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                    <ShieldCheck className="size-6 text-primary" />
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    En confirmant, vous acceptez les conditions de service de Dentwise. Un email de confirmation vous sera envoyé instantanément.
                </p>
            </div>
        </div>

        <div className="space-y-4">
            <Button 
                onClick={onConfirm} 
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black italic text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50" 
                disabled={isBooking}
            >
                {isBooking ? "Réservation en cours..." : "CONFIRMER MAINTENANT"}
            </Button>
            <Button variant="outline" onClick={onModify} className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl font-bold">
                Modifier le rendez-vous
            </Button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmationStep;
