import { APPOINTMENT_TYPES } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DoctorInfo from "./DoctorInfo";

interface BookingConfirmationStepProps {
  selectedDentistId: string;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
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
  isBooking,
  onBack,
  onConfirm,
  onModify,
}: BookingConfirmationStepProps) {
  const appointmentType = APPOINTMENT_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-semibold">
          Confirmer votre rendez-vous
        </h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Récapitulatif du rendez-vous</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* doctor info */}
          <DoctorInfo doctorId={selectedDentistId} />

          {/* appointment details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">
                Type de rendez-vous
              </p>
              <p className="font-medium">{appointmentType?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée</p>
              <p className="font-medium">{appointmentType?.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(selectedDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heure</p>
              <p className="font-medium">{selectedTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lieu</p>
              <p className="font-medium">Centre dentaire</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coût</p>
              <p className="font-medium text-primary">
                {appointmentType?.price}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* action buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onModify}>
          Modifier le rendez-vous
        </Button>
        <Button onClick={onConfirm} className="bg-primary" disabled={isBooking}>
          {isBooking ? "Réservation en cours..." : "Confirmer la réservation"}
        </Button>
      </div>
    </div>
  );
}

export default BookingConfirmationStep;
