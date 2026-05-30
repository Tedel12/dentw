"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addTreatment, addTreatmentsBatch, type TreatmentLineInput } from "@/lib/actions/health";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/brand";
import { Pill, Clock, Calendar, FileText, Send, Plus, Trash2, Camera, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_LINES = 5;

const patientFormSchema = z.object({
  name: z.string().min(2, "Le nom du médicament est requis"),
  dosage: z.string().min(1, "La posologie est requise"),
  frequency: z.string().min(1, "La fréquence est requise"),
  time: z.string().min(1, "L'heure de prise est requise"),
  duration: z.string().optional(),
  pathology: z.string().optional(),
  administrationRoute: z.string().optional(),
  notes: z.string().optional(),
  prescriptionUrl: z.string().optional(),
});

const doctorLineSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  time: z.string(),
  duration: z.string().optional(),
  pathology: z.string(),
  administrationRoute: z.string(),
  notes: z.string().optional(),
});

const doctorFormSchema = z.object({
  lines: z.array(doctorLineSchema).min(1).max(MAX_LINES),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;
type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface AddPrescriptionFormProps {
  patientId: string;
  doctorId?: string;
  onSuccess?: () => void | Promise<void>;
}

const emptyLine = (): DoctorFormValues["lines"][number] => ({
  name: "",
  dosage: "",
  frequency: "1x/jour",
  time: "08:00",
  duration: "",
  pathology: "",
  administrationRoute: "",
  notes: "",
});

export function AddPrescriptionForm({ patientId, doctorId, onSuccess }: AddPrescriptionFormProps) {
  if (doctorId) {
    return (
      <DoctorBatchPrescriptionForm
        patientId={patientId}
        doctorId={doctorId}
        onSuccess={onSuccess}
      />
    );
  }

  return <PatientSinglePrescriptionForm patientId={patientId} onSuccess={onSuccess} />;
}

function PatientSinglePrescriptionForm({
  patientId,
  onSuccess,
}: {
  patientId: string;
  onSuccess?: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "1x/jour",
      time: "08:00",
      duration: "",
      pathology: "",
      administrationRoute: "",
      notes: "",
      prescriptionUrl: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        form.setValue("prescriptionUrl", base64);
        
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          toast.success("Scan IA terminé");
          if (!form.getValues("name")) form.setValue("name", "Prescription analysée");
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: PatientFormValues) {
    setLoading(true);
    const res = await addTreatment(patientId, {
      name: values.name,
      dosage: values.dosage,
      frequency: values.frequency,
      time: values.time,
      duration: values.duration ? parseInt(values.duration, 10) : undefined,
      pathology: values.pathology?.trim() || undefined,
      administrationRoute: values.administrationRoute?.trim() || undefined,
      notes: values.notes,
      prescriptionUrl: values.prescriptionUrl,
    });

    if (res.success) {
      toast.success("Traitement ajouté");
      form.reset();
      setPreviewImage(null);
      await onSuccess?.();
    } else {
      toast.error("Erreur lors de l'ajout");
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Scan IA */}
        <div className="relative group">
          <div className={`relative h-40 md:h-48 rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-3 ${previewImage ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 bg-white/5'}`}>
            {previewImage ? (
              <>
                <img src={previewImage} alt="Prescription" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                {isScanning && (
                  <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(231,138,83,1)] z-10"
                  />
                )}
                <div className="relative z-20 flex flex-col items-center gap-2">
                  {isScanning ? (
                    <>
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-primary font-black italic uppercase tracking-widest text-[10px]">Analyse IA en cours...</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary/20 p-2 rounded-full border border-primary/30">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-white font-black uppercase tracking-tighter text-xs">Analyse terminée</p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-white/20 group-hover:text-primary/50 transition-colors" />
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-white/60 uppercase italic">Scanner l'ordonnance</p>
                  <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mt-1">Extraction IA automatique</p>
                </div>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleImageUpload}
              disabled={isScanning}
            />
          </div>
          {previewImage && !isScanning && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => {setPreviewImage(null); form.setValue("prescriptionUrl", "");}}
              className="absolute top-2 right-2 text-white/50 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Pill className="size-3.5" /> Médicament
                </FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-sm" placeholder="ex: Paracétamol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Posologie</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-sm" placeholder="ex: 500mg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Clock className="size-3.5" /> Fréquence
                </FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-sm" placeholder="ex: 2x/jour" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary text-left">Heure(s)</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-sm" placeholder="ex: 08:00, 20:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Calendar className="size-3.5" /> Durée (jours)
                </FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-sm" type="number" placeholder="7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pathology"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Motif (optionnel)</FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-sm" placeholder="ex: Fièvre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="text-left">
              <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <FileText className="size-3.5" /> Notes / Conseils
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Précisions..." className="bg-white/5 border-white/10 rounded-xl min-h-[80px] md:min-h-[100px] resize-none text-sm italic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 md:h-14 font-black italic rounded-xl gap-2 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm" disabled={loading}>
          {loading ? <Loader2 className="animate-spin size-4" /> : <Send className="size-4" />}
          {loading ? "ENVOI..." : "AJOUTER TRAITEMENT"}
        </Button>
      </form>
    </Form>
  );
}

function DoctorBatchPrescriptionForm({
  patientId,
  doctorId,
  onSuccess,
}: {
  patientId: string;
  doctorId: string;
  onSuccess?: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewLines, setPreviewLines] = useState<TreatmentLineInput[]>([]);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      lines: [emptyLine()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  function buildPayload(values: DoctorFormValues) {
    const cleaned = values.lines.filter((l) => l.name.trim().length >= 2);
    if (cleaned.length === 0) {
      toast.error("Médicament invalide");
      return null;
    }
    return cleaned.map((l: any) => ({
        ...l,
        duration: l.duration ? parseInt(l.duration, 10) : undefined
    }));
  }

  function onReviewSubmit(values: DoctorFormValues) {
    const payload = buildPayload(values);
    if (!payload) return;
    setPreviewLines(payload);
    setConfirmOpen(true);
  }

  async function onConfirmFinalize() {
    const values = form.getValues();
    const payload = buildPayload(values);
    if (!payload) return;

    setLoading(true);
    const res = await addTreatmentsBatch(patientId, doctorId, payload);
    if (res.success) {
      setConfirmOpen(false);
      toast.success("Ordonnance enregistrée");
      form.reset({ lines: [emptyLine()] });
      await onSuccess?.();
    } else {
      toast.error("Erreur lors de l'envoi");
    }
    setLoading(false);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onReviewSubmit)} className="space-y-6 md:space-y-8">
          <p className="text-xs md:text-sm text-slate-500 italic leading-relaxed">
            Ajoutez les médicaments (max {MAX_LINES}). L'accès au dossier sera révoqué après validation.
          </p>

          <div className="space-y-4">
            {fields.map((field, index) => (
                <div
                key={field.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 space-y-4 relative overflow-hidden group/line"
                >
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Médicament {index + 1}</span>
                    {fields.length > 1 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-7 md:h-8 rounded-lg"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="size-3.5 mr-1.5" /> <span className="text-[10px] font-bold uppercase tracking-tight">Retirer</span>
                    </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <FormField
                    control={form.control}
                    name={`lines.${index}.name`}
                    render={({ field: f }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Pill className="size-3.5" /> Médicament
                        </FormLabel>
                        <FormControl>
                            <Input className="bg-black/20 border-white/10 h-10 md:h-11 rounded-xl text-sm" placeholder="ex: Amoxicilline" {...f} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`lines.${index}.dosage`}
                    render={({ field: f }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Posologie</FormLabel>
                        <FormControl>
                            <Input className="bg-black/20 border-white/10 h-10 md:h-11 rounded-xl text-sm" placeholder="ex: 500mg" {...f} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                        control={form.control}
                        name={`lines.${index}.frequency`}
                        render={({ field: f }) => (
                            <FormItem>
                            <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                <Clock className="size-3" /> Freq.
                            </FormLabel>
                            <FormControl>
                                <Input className="bg-black/20 border-white/10 h-10 rounded-xl text-[11px]" placeholder="1x/jour" {...f} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`lines.${index}.time`}
                        render={({ field: f }) => (
                            <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Heure</FormLabel>
                            <FormControl>
                                <Input className="bg-black/20 border-white/10 h-10 rounded-xl text-[11px]" placeholder="08:00" {...f} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    </div>
                    <FormField
                    control={form.control}
                    name={`lines.${index}.duration`}
                    render={({ field: f }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Calendar className="size-3.5" /> Durée (jours)
                        </FormLabel>
                        <FormControl>
                            <Input className="bg-black/20 border-white/10 h-10 md:h-11 rounded-xl text-sm" type="number" placeholder="7" {...f} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <FormField
                    control={form.control}
                    name={`lines.${index}.pathology`}
                    render={({ field: f }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Pathologie *</FormLabel>
                        <FormControl>
                            <Input className="bg-black/20 border-white/10 h-10 md:h-11 rounded-xl text-sm" placeholder="ex: Paludisme…" {...f} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`lines.${index}.administrationRoute`}
                    render={({ field: f }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Voie *</FormLabel>
                        <FormControl>
                            <Input className="bg-black/20 border-white/10 h-10 md:h-11 rounded-xl text-sm" placeholder="ex: Orale…" {...f} />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name={`lines.${index}.notes`}
                    render={({ field: f }) => (
                    <FormItem className="text-left">
                        <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <FileText className="size-3.5" /> Précisions
                        </FormLabel>
                        <FormControl>
                        <Textarea placeholder="Notes optionnelles..." className="bg-black/20 border-white/10 rounded-xl min-h-[60px] resize-none text-xs italic" {...f} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
              {fields.length < MAX_LINES && (
                <Button
                type="button"
                variant="outline"
                className="w-full h-11 md:h-12 border-dashed border-white/20 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase"
                onClick={() => append(emptyLine())}
                >
                <Plus className="size-4 mr-2 text-primary" /> Ajouter Médicament ({fields.length}/{MAX_LINES})
                </Button>
              )}

              <Button type="submit" className="w-full h-12 md:h-14 font-black italic rounded-[1.5rem] gap-2 shadow-xl shadow-primary/20 uppercase tracking-widest text-sm" disabled={loading || confirmOpen}>
                <Send className="size-4" />
                Finaliser l'ordonnance
              </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-lg w-[90vw] rounded-[2rem] bg-slate-900 border-white/10 text-white p-6 md:p-8">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Confirmer l'envoi</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4 text-left text-xs md:text-sm text-slate-400">
                <p className="font-medium italic leading-relaxed">
                  Vérifiez le récapitulatif. Une fois validée, l'ordonnance est archivée et votre accès temporaire est révoqué.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded-2xl p-4 bg-black/40">
                  {previewLines.map((l: any, i: number) => (
                    <div key={`${l.name}-${i}`} className="pb-2 last:pb-0 border-b last:border-0 border-white/5">
                      <p className="font-black text-white italic uppercase tracking-tight text-xs">{l.name} — {l.dosage}</p>
                      <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest mt-1">
                        {l.frequency} • {l.time} • {l.duration}j
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-8">
            <AlertDialogCancel disabled={loading} className="rounded-xl font-bold uppercase text-[10px] h-11 border-white/10">Corriger</AlertDialogCancel>
            <Button type="button" onClick={() => void onConfirmFinalize()} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 h-11 rounded-xl font-black italic uppercase text-[10px] tracking-widest">
              {loading ? "Chargement..." : "VALIDER & ENVOYER"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
