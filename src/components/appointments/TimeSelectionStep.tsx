import { useBookedTimeSlots } from "@/hooks/use-appointment";
import { APPOINTMENT_TYPES, getAvailableTimeSlots, getNext5Days } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon, ClockIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface TimeSelectionStepProps {
  selectedDentistId: string;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onTypeChange: (type: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function TimeSelectionStep({
  onBack,
  onContinue,
  onDateChange,
  onTimeChange,
  onTypeChange,
  selectedDate,
  selectedDentistId,
  selectedTime,
  selectedType,
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
    <div className="space-y-6">
      {/* en-tête avec bouton retour */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <h2 className="text-2xl font-semibold">Sélectionner la date et l’heure</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* sélection du type de rendez-vous */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Type de rendez-vous</h3>
          <div className="space-y-3">
            {APPOINTMENT_TYPES.map((type: any) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  selectedType === type.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onTypeChange(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.duration}</p>
                    </div>
                    <span className="font-semibold text-primary">{type.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* sélection de la date et de l’heure */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dates disponibles</h3>

          {/* sélection de la date */}
          <div className="grid grid-cols-2 gap-3">
            {availableDates.map((date: any) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                onClick={() => handleDateSelect(date)}
                className="h-auto p-3"
              >
                <div className="text-center">
                  <div className="font-medium">
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

          {/* sélection de l’heure (affichée uniquement si une date est choisie) */}
          {selectedDate && (
            <div className="space-y-3">
              <h4 className="font-medium">Heures disponibles</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time: any) => {
                  const isBooked = bookedTimeSlots.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => !isBooked && onTimeChange(time)}
                      size="sm"
                      disabled={isBooked}
                      className={isBooked ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {time}
                      {isBooked && " (Réservé)"}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* bouton continuer (affiché uniquement si tout est sélectionné) */}
      {selectedType && selectedDate && selectedTime && (
        <div className="flex justify-end">
          <Button onClick={onContinue}>Vérifier le rendez-vous</Button>
        </div>
      )}
    </div>
  );
}

export default TimeSelectionStep;
