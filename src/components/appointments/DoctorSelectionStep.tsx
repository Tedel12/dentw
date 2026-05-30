import { useAvailableDoctors } from "@/hooks/use-doctors";
import {
  APP_CLINIC_FALLBACK,
  DEFAULT_PRACTITIONER_BIO,
  DEFAULT_SPECIALITY,
} from "@/lib/brand";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import Image from "next/image";
import { MapPinIcon, PhoneIcon, StarIcon, ShieldCheck } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DoctorCardsLoading } from "./DoctorCardsLoading";

interface DoctorSelectionStepProps {
  selectedDoctorId: string | null;
  onSelectDoctor: (doctorId: string) => void;
  onContinue: () => void;
}

function DoctorSelectionStep({
  onContinue,
  onSelectDoctor,
  selectedDoctorId,
}: DoctorSelectionStepProps) {
  const { data: doctors = [], isLoading } = useAvailableDoctors();

  if (isLoading)
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black italic text-white tracking-tight">Choisissez votre praticien</h2>
        <DoctorCardsLoading />
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-8">
      <h2 className="text-xl md:text-2xl font-black italic text-white tracking-tight">Choisissez votre praticien</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {doctors.map((doctor: any) => (
          <Card
            key={doctor.id}
            className={`group cursor-pointer transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden hover:border-primary/40 shadow-xl ${
              selectedDoctorId === doctor.id ? "ring-2 ring-primary border-primary/40 bg-primary/5" : ""
            }`}
            onClick={() => onSelectDoctor(doctor.id)}
          >
            <CardHeader className="pb-3 md:pb-4 p-5 md:p-8">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="relative shrink-0">
                    <Image
                    src={doctor.imageUrl!}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-primary/40 transition-all duration-500"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-slate-900 animate-pulse" title="Vérifié" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base md:text-xl font-black text-white italic truncate">{doctor.name}</CardTitle>
                  <CardDescription className="text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] truncate">
                    {doctor.speciality || DEFAULT_SPECIALITY}
                  </CardDescription>
                  <div className="flex items-center gap-2 md:gap-3 mt-1.5">
                    <div className="flex items-center gap-1 bg-amber-400/10 px-1.5 py-0.5 rounded-lg border border-amber-400/20">
                      <StarIcon className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[9px] md:text-[10px] font-black text-amber-400">5.0</span>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      ({doctor.appointmentCount} RDV)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 md:space-y-4 p-5 md:p-8 pt-0 md:pt-0">
              <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-slate-400 leading-tight">
                    <MapPinIcon className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary shrink-0" />
                    <span className="truncate">{doctor.practiceAddress || APP_CLINIC_FALLBACK}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-slate-400">
                    <PhoneIcon className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary shrink-0" />
                    <span>{doctor.phone}</span>
                  </div>
              </div>
              
              <p className="text-[11px] md:text-xs text-slate-400 font-medium italic line-clamp-2 leading-relaxed">
                {doctor.bio || DEFAULT_PRACTITIONER_BIO}
              </p>

              <div className="pt-3 md:pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Honoraires</p>
                    <p className="text-base md:text-lg font-black text-white italic">Libre <span className="text-[9px] md:text-[10px] text-primary not-italic font-medium ml-0.5">(voir Dr)</span></p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[9px] font-black uppercase px-2 md:px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="size-2.5 md:size-3" /> Certifié
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDoctorId && (
        <div className="flex justify-end pt-6 md:pt-8">
          <Button 
            onClick={onContinue}
            className="bg-primary hover:bg-primary/90 text-white font-black italic h-12 md:h-14 px-8 md:px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            CONTINUER VERS L'HORAIRE
          </Button>
        </div>
      )}
    </div>
  );
}

export default DoctorSelectionStep;
