import { useAvailableDoctors } from "@/hooks/use-doctors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { MapPinIcon, PhoneIcon, StarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DoctorCardsLoading } from "./DoctorCardsLoading";

interface DoctorSelectionStepProps {
  selectedDentistId: string | null;
  onSelectDentist: (dentistId: string) => void;
  onContinue: () => void;
}

function DoctorSelectionStep({
  onContinue,
  onSelectDentist,
  selectedDentistId,
}: DoctorSelectionStepProps) {
  const { data: dentists = [], isLoading } = useAvailableDoctors();

  if (isLoading)
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black italic text-white tracking-tight">Choisissez votre praticien</h2>
        <DoctorCardsLoading />
      </div>
    );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black italic text-white tracking-tight">Choisissez votre praticien</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dentists.map((dentist: any) => (
          <Card
            key={dentist.id}
            className={`group cursor-pointer transition-all duration-500 rounded-[2.5rem] bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden hover:border-primary/40 shadow-xl ${
              selectedDentistId === dentist.id ? "ring-2 ring-primary border-primary/40 bg-primary/5" : ""
            }`}
            onClick={() => onSelectDentist(dentist.id)}
          >
            <CardHeader className="pb-4 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="relative">
                    <Image
                    src={dentist.imageUrl!}
                    alt={dentist.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-primary/40 transition-all duration-500"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-slate-900 animate-pulse" title="Vérifié" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg md:text-xl font-black text-white italic truncate">{dentist.name}</CardTitle>
                  <CardDescription className="text-primary font-black uppercase tracking-widest text-[10px] truncate">
                    {dentist.speciality || "Dentisterie générale"}
                  </CardDescription>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-black text-amber-400">5.0</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      ({dentist.appointmentCount} RDV)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6 md:p-8 pt-0">
              <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <MapPinIcon className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{dentist.practiceAddress || "DentWise Clinic"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <PhoneIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{dentist.phone}</span>
                  </div>
              </div>
              
              <p className="text-xs text-slate-400 font-medium italic line-clamp-2 leading-relaxed">
                {dentist.bio ||
                  "Expert en soins dentaires modernes et préventifs pour toute la famille."}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Tarif de base</p>
                    <p className="text-lg font-black text-white italic">{dentist.basePrice || "0"} <span className="text-xs text-primary not-italic">FCFA</span></p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-3 py-1 rounded-full">
                    Agréé
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDentistId && (
        <div className="flex justify-end pt-8">
          <Button 
            onClick={onContinue}
            className="bg-primary hover:bg-primary/90 text-white font-black italic h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
          >
            CONTINUER VERS L'HORAIRE
          </Button>
        </div>
      )}
    </div>
  );
}

export default DoctorSelectionStep;
