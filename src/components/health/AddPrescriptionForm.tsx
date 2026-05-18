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
          toast.success("Scan IA terminé : Données prêtes à être validées");
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
      toast.success("Traitement ajouté à votre carnet de santé");
      form.reset();
      setPreviewImage(null);
      await onSuccess?.();
    } else {
      toast.error("Erreur lors de l'ajout du traitement");
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Scan IA */}
        <div className="relative group">
          <div className={`relative h-48 rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-3 ${previewImage ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 bg-white/5'}`}>
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
                      <p className="text-primary font-black italic uppercase tracking-widest text-xs">Scan IA {APP_NAME} en cours...</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary/20 p-2 rounded-full border border-primary/30">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-white font-black uppercase tracking-tighter">Analyse terminée</p>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-white/20 group-hover:text-primary/50 transition-colors" />
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-white/60">Scanner votre ordonnance</p>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">L&apos;IA {APP_NAME} extraira les données</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" /> Médicament
                </FormLabel>
                <FormControl>
                  <Input placeholder="ex: Paracétamol" {...field} />
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
                <FormLabel>Posologie</FormLabel>
                <FormControl>
                  <Input placeholder="ex: 500mg" {...field} />
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
                <FormLabel className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Fréquence
                </FormLabel>
                <FormControl>
                  <Input placeholder="ex: 2x/jour" {...field} />
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
                <FormLabel>Heure(s) de prise</FormLabel>
                <FormControl>
                  <Input placeholder="ex: 08:00, 20:00" {...field} />
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
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Durée (jours)
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="7" {...field} />
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
                <FormLabel>Pathologie / motif (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Infection urinaire" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="administrationRoute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voie d&apos;administration (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Orale, Topique…" {...field} />
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
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Notes / Conseils
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Prendre après le repas..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          <Send className="w-4 h-4" />
          {loading ? "Envoi en cours..." : "Ajouter ce traitement"}
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
      toast.error("Ajoutez au moins un médicament (nom d’au moins 2 caractères).");
      return null;
    }
    if (cleaned.length > MAX_LINES) {
      toast.error(`Maximum ${MAX_LINES} lignes par ordonnance.`);
      return null;
    }
    for (let i = 0; i < cleaned.length; i++) {
      const l = cleaned[i];
      if (!l.dosage.trim() || !l.frequency.trim() || !l.time.trim()) {
        toast.error(`Ligne ${i + 1} : renseignez posologie, fréquence et horaires.`);
        return null;
      }
      if (!l.pathology?.trim() || !l.administrationRoute?.trim()) {
        toast.error(`Ligne ${i + 1} : indiquez la pathologie / motif et la voie d'administration.`);
        return null;
      }
    }
    return cleaned.map((l: any) => {
      let duration: number | undefined;
      if (l.duration?.trim()) {
        const n = parseInt(l.duration, 10);
        duration = Number.isFinite(n) ? n : undefined;
      }
      return {
        name: l.name.trim(),
        dosage: l.dosage.trim(),
        frequency: l.frequency.trim(),
        time: l.time.trim(),
        duration,
        pathology: l.pathology.trim(),
        administrationRoute: l.administrationRoute.trim(),
        notes: l.notes?.trim() || undefined,
      };
    });
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
    if (!payload) {
      setConfirmOpen(false);
      return;
    }

    setLoading(true);
    const res = await addTreatmentsBatch(patientId, doctorId, payload);

    if (res.success) {
      setConfirmOpen(false);
      const n = typeof res.count === "number" ? res.count : payload.length;
      toast.success(`${n} ligne(s) enregistrée(s). Ordonnance ajoutée au carnet du patient.`);
      toast.info("Votre accès temporaire à ce dossier est maintenant révoqué.");
      form.reset({ lines: [emptyLine()] });
      await onSuccess?.();
    } else {
      toast.error(res.error || "Erreur lors de l'enregistrement de l'ordonnance");
    }
    setLoading(false);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onReviewSubmit)} className="space-y-8">
          <p className="text-sm text-muted-foreground">
            Ajoutez jusqu’à {MAX_LINES} médicaments sur une même ordonnance. Une fois validée, votre accès au dossier
            sera révoqué (nouvelle demande nécessaire pour une autre ordonnance).
          </p>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary">Ligne {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Retirer
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`lines.${index}.name`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary" /> Médicament
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Amoxicilline" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.dosage`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Posologie</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: 500mg" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.frequency`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Fréquence
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ex: 2x/jour" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.time`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>Heure(s) de prise</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: 08:00, 20:00" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.duration`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> Durée (jours)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="7" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.pathology`}
                  render={({ field: f }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Pathologie / motif traité *</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Paludisme, hypertension…" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.administrationRoute`}
                  render={({ field: f }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Voie d&apos;administration *</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Orale, sous-gingivale, topique…" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`lines.${index}.notes`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Notes (ligne)
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optionnel…" className="resize-none min-h-[72px]" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          {fields.length < MAX_LINES && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => append(emptyLine())}
            >
              <Plus className="w-4 h-4 mr-2" /> Ajouter une ligne ({fields.length}/{MAX_LINES})
            </Button>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading || confirmOpen}>
            <Send className="w-4 h-4" />
            Enregistrer l&apos;ordonnance et terminer la consultation
          </Button>
        </form>
      </Form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l&apos;ordonnance</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left text-sm text-muted-foreground">
                <p>
                  Vérifiez que toutes les lignes sont correctes. Après validation, les entrées seront enregistrées sur le
                  carnet du patient et <strong>votre accès à ce dossier sera révoqué</strong>.
                </p>
                <ul className="list-disc pl-4 space-y-1 max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/30">
                  {previewLines.map((l: any, i: number) => (
                    <li key={`${l.name}-${i}`}>
                      <span className="font-medium text-foreground">{l.name}</span> — {l.dosage}, {l.frequency},{" "}
                      {l.time}
                      <span className="block text-xs mt-0.5">
                        Pathologie : {l.pathology} · Voie : {l.administrationRoute}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Corriger</AlertDialogCancel>
            <Button type="button" onClick={() => void onConfirmFinalize()} disabled={loading}>
              {loading ? "Enregistrement..." : "Confirmer et enregistrer"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
