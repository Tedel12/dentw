import { useBookedTimeSlots } from "@/hooks/use-appointment";
import { APPOINTMENT_TYPES, getAvailableTimeSlots, getNext5Days } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon, ClockIcon, VideoIcon, MapPin } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface TimeSelectionStepProps {
  selectedDentistId: string;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
  selectedMode: "IN_PERSON" | "ONLINE";
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onTypeChange: (type: string) => void;
  onModeChange: (mode: "IN_PERSON" | "ONLINE") => void;
  onBack: () => void;
  onContinue: () => void;
}

function TimeSelectionStep({
  onBack,
  onContinue,
  onDateChange,
  onTimeChange,
  onTypeChange,
  onModeChange,
  selectedDate,
  selectedDentistId,
  selectedTime,
  selectedType,
  selectedMode,
}: TimeSelectionStepProps) {
  const { data: bookedTimeSlots = [] } = useBookedTimeSlots(selectedDentistId, selectedDate);

  const availableDates = getNext5Days();
  const availableTimeSlots = getAvailableTimeSlots();

  const handleDateSelect = (date: string) => {
    onDateChange(date);
    // réinitialiser l’heure lorsque la date change
    onTimeChange("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* en-tête avec bouton retour */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="rounded-xl hover:bg-white/5 font-bold">
          <ChevronLeftIcon className="w-4 h-4 mr-2 text-primary" />
          Retour
        </Button>

        <h2 className="text-2xl font-black italic">Date et Heure</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
            {/* Sélection du mode de consultation */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Mode de consultation</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Card 
                        className={`cursor-pointer transition-all duration-300 border-white/5 bg-slate-900/40 hover:border-primary/30 ${selectedMode === 'IN_PERSON' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                        onClick={() => onModeChange('IN_PERSON')}
                    >
                        <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                            <div className={`p-3 rounded-2xl ${selectedMode === 'IN_PERSON' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-800 text-slate-400'}`}>
                                <MapPin className="size-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">En Cabinet</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Présentiel</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card 
                        className={`cursor-pointer transition-all duration-300 border-white/5 bg-slate-900/40 hover:border-primary/30 ${selectedMode === 'ONLINE' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                        onClick={() => onModeChange('ONLINE')}
                    >
                        <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
                            <div className={`p-3 rounded-2xl ${selectedMode === 'ONLINE' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-800 text-slate-400'}`}>
                                <VideoIcon className="size-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Vidéo</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Téléconsultation</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* sélection du type de rendez-vous */}
            <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Type de soin</h3>
            <div className="space-y-3">
                {APPOINTMENT_TYPES.map((type: any) => (
                <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-300 border-white/5 bg-slate-900/40 hover:border-primary/30 ${
                    selectedType === type.id ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => onTypeChange(type.id)}
                >
                    <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                        <div>
                        <h4 className="font-bold text-sm">{type.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{type.duration}</p>
                        </div>
                        <span className="font-black text-primary italic">{type.price}</span>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
            </div>
        </div>

        {/* sélection de la date et de l’heure */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Dates disponibles</h3>

            {/* sélection de la date */}
            <div className="grid grid-cols-2 gap-3">
                {availableDates.map((date: any) => (
                <Button
                    key={date}
                    variant={selectedDate === date ? "default" : "outline"}
                    onClick={() => handleDateSelect(date)}
                    className={`h-auto p-4 rounded-2xl border-white/5 hover:border-primary/30 transition-all font-bold ${selectedDate === date ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900/40'}`}
                >
                    <div className="text-center">
                    <div className="text-sm">
                        {new Date(date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        })}
                    </div>
                    </div>
                </Button>
                ))}
            </div>
          </div>

          {/* sélection de l’heure (affichée uniquement si une date est choisie) */}
          {selectedDate && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Heures disponibles</h3>
              <div className="grid grid-cols-3 gap-3">
                {availableTimeSlots.map((time: any) => {
                  const isBooked = bookedTimeSlots.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => !isBooked && onTimeChange(time)}
                      size="sm"
                      disabled={isBooked}
                      className={`h-11 rounded-xl border-white/5 transition-all font-bold ${selectedTime === time ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-900/40'} ${isBooked ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                    >
                      <ClockIcon className="w-3 h-3 mr-2" />
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* bouton continuer (affiché uniquement si tout est sélectionné) */}
      <div className="flex justify-end pt-8 border-t border-white/5">
        <Button 
            onClick={onContinue} 
            disabled={!selectedType || !selectedDate || !selectedTime}
            className="rounded-2xl h-14 px-8 font-black italic bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:opacity-20 transition-all"
        >
            Vérifier le rendez-vous
        </Button>
      </div>
    </div>
  );
}

export default TimeSelectionStep;
