"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Save, Clock, Banknote, CalendarDays } from "lucide-react";
import { updateDoctorSettings } from "@/lib/actions/doctors";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS_OF_WEEK = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
];

const settingsSchema = z.object({
  basePrice: z.coerce.number().min(0, "Le tarif doit être positif"),
  availableDays: z.array(z.string()).min(1, "Sélectionnez au moins un jour"),
  workingHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:mm requis"),
  workingHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:mm requis"),
  consultationDuration: z.coerce.number().min(5, "Minimum 5 minutes"),
});

interface DoctorSettingsClientProps {
  doctor: any;
}

export function DoctorSettingsClient({ doctor }: DoctorSettingsClientProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      basePrice: doctor.basePrice || 0,
      availableDays: doctor.availableDays ? doctor.availableDays.split(",") : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      workingHoursStart: doctor.workingHoursStart || "09:00",
      workingHoursEnd: doctor.workingHoursEnd || "18:00",
      consultationDuration: doctor.consultationDuration || 30,
    },
  });

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setLoading(true);
    try {
      const res = await updateDoctorSettings(doctor.clerkId, {
        ...values,
        availableDays: values.availableDays.join(","),
      });

      if (res.success) {
        toast.success("Paramètres mis à jour avec succès");
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur technique lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">Paramètres du Cabinet</h1>
          <p className="text-slate-400 font-medium italic">Configurez vos tarifs, horaires et disponibilités.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section Tarification */}
            <Card className="bg-slate-900/40 border-white/5 rounded-[2.5rem] backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                <CardTitle className="text-xl font-black italic flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-primary" />
                    </div>
                    Tarification & Durée
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                    Définissez vos honoraires de base et le temps moyen par patient.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Tarif de consultation (FCFA/€)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input {...field} type="number" className="bg-white/5 border-white/10 h-14 rounded-2xl pl-12 text-lg font-black" />
                            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultationDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Durée moyenne (minutes)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input {...field} type="number" className="bg-white/5 border-white/10 h-14 rounded-2xl pl-12 text-lg font-black" />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Section Horaires */}
            <Card className="bg-slate-900/40 border-white/5 rounded-[2.5rem] backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                <CardTitle className="text-xl font-black italic flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                    </div>
                    Heures d'ouverture
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                    Définissez votre plage horaire quotidienne de travail.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="workingHoursStart"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Heure de début</FormLabel>
                        <FormControl>
                            <Input {...field} type="time" className="bg-white/5 border-white/10 h-14 rounded-2xl text-center font-black" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="workingHoursEnd"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Heure de fin</FormLabel>
                        <FormControl>
                            <Input {...field} type="time" className="bg-white/5 border-white/10 h-14 rounded-2xl text-center font-black" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[11px] text-slate-400 font-bold italic leading-relaxed text-center">
                        "Les patients pourront prendre rendez-vous uniquement entre ces horaires, en respectant la durée définie."
                    </p>
                </div>
              </CardContent>
            </Card>

            {/* Section Jours Disponibles */}
            <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 rounded-[2.5rem] backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                <CardTitle className="text-xl font-black italic flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    Jours d'activité hebdomadaire
                </CardTitle>
                <CardDescription className="font-medium text-slate-500">
                    Cochez les jours où vous recevez des patients au cabinet ou en ligne.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <FormField
                      key={day}
                      control={form.control}
                      name="availableDays"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={day}
                            className="flex flex-row items-center space-x-3 space-y-0 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, day])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== day
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-black cursor-pointer uppercase tracking-tighter">
                              {day}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage className="mt-4" />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white font-black italic h-16 px-12 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all hover:scale-105"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              ENREGISTRER LA CONFIGURATION DU CABINET
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
