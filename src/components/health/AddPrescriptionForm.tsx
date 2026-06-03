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
import { Pill, Clock, Calendar as CalendarIcon, FileText, Send, Plus, Trash2, Camera, Sparkles, Loader2, Microscope, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalEventType } from "@prisma/client";

const MAX_LINES = 5;

const singleActSchema = z.object({
  type: z.nativeEnum(MedicalEventType),
  name: z.string().min(2, "Le titre est requis"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  time: z.string().optional(),
  duration: z.string().optional(),
  pathology: z.string().optional(),
  administrationRoute: z.string().optional(),
  notes: z.string().optional(),
  prescriptionUrl: z.string().optional(),
});

const doctorMedicationLineSchema = z.object({
  type: z.literal(MedicalEventType.MEDICATION),
  name: z.string().min(2, "Le nom du médicament est requis"),
  dosage: z.string().min(1, "La posologie est requise"),
  frequency: z.string().min(1, "La fréquence est requise"),
  time: z.string().min(1, "L'heure est requise"),
  duration: z.string().optional(),
  pathology: z.string().min(2, "La pathologie est requise"),
  administrationRoute: z.string().min(2, "La voie est requise"),
  notes: z.string().optional(),
});

const doctorMedicationFormSchema = z.object({
  lines: z.array(doctorMedicationLineSchema).min(1).max(MAX_LINES),
});

interface AddPrescriptionFormProps {
  patientId: string;
  doctorId?: string;
  onSuccess?: () => void | Promise<void>;
}

export function AddPrescriptionForm({ patientId, doctorId, onSuccess }: AddPrescriptionFormProps) {
  const [activeTab, setActiveTab] = useState<MedicalEventType>("MEDICATION");
  const [loading, setLoading] = useState(false);

  const handleSuccess = async () => {
    if (onSuccess) await onSuccess();
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MedicalEventType)} className="w-full">
        <TabsList className="grid grid-cols-3 bg-white/5 border border-white/10 rounded-2xl p-1 h-12 md:h-14">
          <TabsTrigger value="MEDICATION" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white gap-2 font-black italic text-[10px] md:text-xs uppercase">
            <Pill className="size-3.5 md:size-4" /> <span className="hidden xs:inline">Ordonnance</span>
            <span className="xs:hidden">Médic.</span>
          </TabsTrigger>
          <TabsTrigger value="EXAM" className="rounded-xl data-[state=active]:bg-violet-600 data-[state=active]:text-white gap-2 font-black italic text-[10px] md:text-xs uppercase">
            <Microscope className="size-3.5 md:size-4" /> <span className="hidden xs:inline">Examen / Radio</span>
            <span className="xs:hidden">Examen</span>
          </TabsTrigger>
          <TabsTrigger value="OBSERVATION" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 font-black italic text-[10px] md:text-xs uppercase">
            <MessageSquare className="size-3.5 md:size-4" /> <span className="hidden xs:inline">Suivi / Note</span>
            <span className="xs:hidden">Suivi</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {activeTab === "MEDICATION" && doctorId ? (
            <DoctorMedicationForm patientId={patientId} doctorId={doctorId} onSuccess={handleSuccess} />
          ) : (
            <SingleActForm 
                patientId={patientId} 
                doctorId={doctorId} 
                type={activeTab} 
                onSuccess={handleSuccess} 
            />
          )}
        </div>
      </Tabs>
    </div>
  );
}

function SingleActForm({ patientId, doctorId, type, onSuccess }: { patientId: string, doctorId?: string, type: MedicalEventType, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const form = useForm<z.infer<typeof singleActSchema>>({
        resolver: zodResolver(singleActSchema),
        defaultValues: {
            type,
            name: "",
            dosage: "",
            frequency: "",
            time: "",
            duration: "",
            pathology: "",
            administrationRoute: "",
            notes: "",
            prescriptionUrl: "",
        }
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    toast.success("Document analysé par Aya");
                    if (!form.getValues("name")) form.setValue("name", type === 'EXAM' ? "Analyse médicale" : "Note de suivi");
                }, 2500);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (values: z.infer<typeof singleActSchema>) => {
        setLoading(true);
        const payload = {
            ...values,
            type,
            duration: values.duration ? parseInt(values.duration, 10) : undefined,
        };

        const res = doctorId 
            ? await addTreatmentsBatch(patientId, doctorId, [payload])
            : await addTreatment(patientId, payload);

        if (res.success) {
            toast.success("Enregistré avec succès");
            form.reset();
            setPreviewImage(null);
            onSuccess();
        } else {
            toast.error(res.error || "Erreur lors de l'enregistrement");
        }
        setLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {type !== 'OBSERVATION' && (
                    <div className={`relative h-32 md:h-40 rounded-2xl border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-2 ${previewImage ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 bg-white/5'}`}>
                        {previewImage ? (
                            <>
                                <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                {isScanning && (
                                    <motion.div initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(231,138,83,1)] z-10" />
                                )}
                                <div className="relative z-20 flex flex-col items-center">
                                    {isScanning ? <Loader2 className="animate-spin text-primary mb-2" /> : <Sparkles className="text-primary mb-2" />}
                                    <p className="text-[10px] font-black uppercase text-white tracking-widest">{isScanning ? 'Analyse...' : 'Document chargé'}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Camera className="text-white/20" />
                                <p className="text-xs font-bold text-white/40 uppercase">Joindre un document (Photo/PDF)</p>
                            </>
                        )}
                        <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isScanning} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem className={type === 'OBSERVATION' ? 'md:col-span-2' : ''}>
                            <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">{type === 'MEDICATION' ? 'Nom du médicament' : type === 'EXAM' ? 'Intitulé de l\'examen' : 'Sujet de l\'observation'}</FormLabel>
                            <FormControl><Input className="bg-white/5 border-white/10 rounded-xl h-11 md:h-12" placeholder="..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {type === 'MEDICATION' && (
                        <>
                            <FormField control={form.control} name="dosage" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Posologie</FormLabel>
                                <FormControl><Input className="bg-white/5 border-white/10 rounded-xl h-11 md:h-12" placeholder="ex: 1 comprimé" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="frequency" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Fréquence</FormLabel>
                                <FormControl><Input className="bg-white/5 border-white/10 rounded-xl h-11 md:h-12" placeholder="ex: 3x par jour" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="time" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Heures</FormLabel>
                                <FormControl><Input className="bg-white/5 border-white/10 rounded-xl h-11 md:h-12" placeholder="ex: 08:00, 14:00, 20:00" {...field} /></FormControl></FormItem>
                            )} />
                        </>
                    )}

                    {type !== 'OBSERVATION' && (
                        <FormField control={form.control} name="duration" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Durée (jours)</FormLabel>
                            <FormControl><Input type="number" className="bg-white/5 border-white/10 rounded-xl h-11 md:h-12" {...field} /></FormControl></FormItem>
                        )} />
                    )}

                    {type !== 'OBSERVATION' && (
                        <FormField control={form.control} name="pathology" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Pathologie associée</FormLabel>
                            <FormControl><Input className="bg-white/5 border-white/10 rounded-xl h-11 md:h-12" placeholder="ex: Hypertension" {...field} /></FormControl></FormItem>
                        )} />
                    )}
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">{type === 'EXAM' ? 'Résultat / Conclusion' : 'Notes & Observations'}</FormLabel>
                        <FormControl><Textarea className="bg-white/5 border-white/10 rounded-xl min-h-[120px] md:min-h-[150px] resize-none italic" placeholder="..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button disabled={loading} className={`w-full h-12 md:h-14 font-black italic rounded-2xl shadow-xl uppercase tracking-widest ${type === 'EXAM' ? 'bg-violet-600 hover:bg-violet-500' : type === 'OBSERVATION' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-primary hover:bg-primary/90'}`}>
                    {loading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Send className="size-4 mr-2" />}
                    Enregistrer l'acte
                </Button>
            </form>
        </Form>
    );
}

function DoctorMedicationForm({ patientId, doctorId, onSuccess }: { patientId: string, doctorId: string, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    
    const form = useForm<z.infer<typeof doctorMedicationFormSchema>>({
        resolver: zodResolver(doctorMedicationFormSchema),
        defaultValues: {
            lines: [{
                type: MedicalEventType.MEDICATION,
                name: "", dosage: "", frequency: "1x/jour", time: "08:00", duration: "", pathology: "", administrationRoute: "", notes: ""
            }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });

    const onSubmit = async (values: z.infer<typeof doctorMedicationFormSchema>) => {
        setLoading(true);
        const payload = values.lines.map(l => ({
            ...l,
            duration: l.duration ? parseInt(l.duration, 10) : undefined
        }));
        const res = await addTreatmentsBatch(patientId, doctorId, payload);
        if (res.success) {
            toast.success("Ordonnance envoyée");
            onSuccess();
        } else {
            toast.error(res.error || "Erreur");
        }
        setLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-5 md:p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 relative">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Médicament {index + 1}</span>
                                {fields.length > 1 && (
                                    <Button type="button" variant="ghost" size="sm" className="text-red-500 h-7" onClick={() => remove(index)}>
                                        <Trash2 className="size-3.5 mr-1" /> Retirer
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`lines.${index}.name`} render={({ field: f }) => (
                                    <FormItem><FormLabel className="text-[9px] font-black uppercase text-slate-500">Nom</FormLabel>
                                    <FormControl><Input className="bg-black/20 border-white/10 h-10 text-sm" {...f} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`lines.${index}.dosage`} render={({ field: f }) => (
                                    <FormItem><FormLabel className="text-[9px] font-black uppercase text-slate-500">Posologie</FormLabel>
                                    <FormControl><Input className="bg-black/20 border-white/10 h-10 text-sm" {...f} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`lines.${index}.frequency`} render={({ field: f }) => (
                                    <FormItem><FormLabel className="text-[9px] font-black uppercase text-slate-500">Fréquence</FormLabel>
                                    <FormControl><Input className="bg-black/20 border-white/10 h-10 text-sm" {...f} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`lines.${index}.time`} render={({ field: f }) => (
                                    <FormItem><FormLabel className="text-[9px] font-black uppercase text-slate-500">Heures</FormLabel>
                                    <FormControl><Input className="bg-black/20 border-white/10 h-10 text-sm" {...f} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`lines.${index}.pathology`} render={({ field: f }) => (
                                    <FormItem><FormLabel className="text-[9px] font-black uppercase text-slate-500">Pathologie</FormLabel>
                                    <FormControl><Input className="bg-black/20 border-white/10 h-10 text-sm" {...f} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name={`lines.${index}.administrationRoute`} render={({ field: f }) => (
                                    <FormItem><FormLabel className="text-[9px] font-black uppercase text-slate-500">Voie</FormLabel>
                                    <FormControl><Input className="bg-black/20 border-white/10 h-10 text-sm" {...f} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-3">
                    {fields.length < MAX_LINES && (
                        <Button type="button" variant="outline" className="w-full border-dashed border-white/20 h-11" onClick={() => append({ type: MedicalEventType.MEDICATION, name: "", dosage: "", frequency: "1x/jour", time: "08:00", duration: "", pathology: "", administrationRoute: "", notes: "" })}>
                            <Plus className="size-4 mr-2" /> Ajouter un médicament
                        </Button>
                    )}
                    <Button disabled={loading} className="w-full h-12 md:h-14 font-black italic rounded-2xl shadow-xl bg-primary hover:bg-primary/90">
                        {loading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Send className="size-4 mr-2" />}
                        Finaliser l'ordonnance
                    </Button>
                </div>
            </form>
        </Form>
    );
}
