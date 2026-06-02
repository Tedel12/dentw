"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BloodGroup, Gender } from "@prisma/client";
import { updateHealthProfile } from "@/lib/actions/health";
import { updateExportPin, updateUserProfile } from "@/lib/actions/users";
import { revokeAllAccess } from "@/lib/actions/security-revoke";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Droplet, AlertTriangle, ShieldCheck, Scale, Lock, Calendar as CalendarIcon, MapPin, Globe, HeartPulse, Loader2 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  pseudo: z.string().optional(),
  gender: z.nativeEnum(Gender),
  age: z.string(),
  weight: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  electrophoresis: z.string().optional(),
  vaccines: z.string().optional(),
  exportPin: z.string().min(4, "Le PIN doit contenir au moins 4 chiffres").optional(),
});

interface EditHealthProfileProps {
  userId: string;
  initialData: any;
  onSuccess?: () => void;
}

export function EditHealthProfile({ userId, initialData, onSuccess }: EditHealthProfileProps) {
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handlePanicRevoke = async () => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer TOUS les accès médecins ? Cette action est irréversible.")) return;
    setRevoking(true);
    const res = await revokeAllAccess(userId);
    if (res.success) {
        toast.success("Tous les accès ont été révoqués");
    } else {
        toast.error("Erreur lors de la révocation");
    }
    setRevoking(false);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      pseudo: initialData?.pseudo || "",
      gender: initialData?.gender || Gender.MALE,
      age: initialData?.age?.toString() || "",
      weight: initialData?.weight != null ? String(initialData.weight) : "",
      birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
      birthPlace: initialData?.birthPlace || "",
      address: initialData?.address || "",
      nationality: initialData?.nationality || "Béninoise",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      bloodGroup: initialData?.bloodGroup || undefined,
      allergies: initialData?.allergies || "",
      chronicDiseases: initialData?.chronicDiseases || "",
      electrophoresis: initialData?.electrophoresis || "",
      vaccines: initialData?.vaccines || "",
      exportPin: initialData?.exportPin || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
        // 1. Update PIN if changed
        if (values.exportPin && values.exportPin !== initialData?.exportPin) {
            const pinRes = await updateExportPin(values.exportPin);
            if (!pinRes.success) {
                toast.error(pinRes.error || "Erreur PIN");
                setLoading(false);
                return;
            }
        }

        // 2. Update Core User Info
        const userRes = await updateUserProfile({
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender,
            birthDate: values.birthDate,
            birthPlace: values.birthPlace,
            address: values.address,
            nationality: values.nationality,
            emergencyContactName: values.emergencyContactName,
            emergencyContactPhone: values.emergencyContactPhone,
        });

        if (!userRes.success) {
            toast.error(userRes.error || "Erreur profil");
            setLoading(false);
            return;
        }

        // 3. Update Health Info
        const age = parseInt(values.age, 10);
        const wRaw = values.weight?.trim() ?? "";
        const weight = wRaw === "" ? null : parseFloat(wRaw.replace(",", "."));

        const res = await updateHealthProfile(userId, {
            pseudo: values.pseudo,
            age: isNaN(age) ? undefined : age,
            weight,
            bloodGroup: values.bloodGroup,
            allergies: values.allergies,
            chronicDiseases: values.chronicDiseases,
            electrophoresis: values.electrophoresis,
            vaccines: values.vaccines,
        });

        if (res.success) {
            toast.success("Profil complet mis à jour");
            onSuccess?.();
        } else {
            toast.error("Erreur lors de la mise à jour santé");
        }
    } catch (err) {
        toast.error("Une erreur technique est survenue");
    } finally {
        setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* IDENTITÉ CIVILE */}
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <User className="size-4" /> État Civil & Identité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prénom</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nom</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sexe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                            <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-white/10 text-white text-left">
                            <SelectItem value={Gender.MALE}>Masculin</SelectItem>
                            <SelectItem value={Gender.FEMALE}>Féminin</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><CalendarIcon className="size-3" /> Date de naissance</FormLabel>
                        <FormControl><Input type="date" className="bg-white/5 border-white/10 rounded-xl [color-scheme:dark]" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="birthPlace"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><MapPin className="size-3" /> Lieu de naissance</FormLabel>
                        <FormControl><Input placeholder="Cotonou" className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Globe className="size-3" /> Nationalité</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                <FormItem className="text-left">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Adresse de résidence</FormLabel>
                    <FormControl><Input placeholder="Quartier, Ville" className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                </FormItem>
                )}
            />
        </div>

        {/* DONNÉES DE SANTÉ */}
        <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <HeartPulse className="size-4" /> Dossier Médical
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Droplet className="w-3.5 h-3.5 text-red-500" /> Groupe Sanguin</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                            <SelectValue placeholder="Sélectionnez" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            {Object.values(BloodGroup).map((bg: any) => (
                            <SelectItem key={bg} value={bg}>{bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="electrophoresis"
                    render={({ field }) => (
                        <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Électrophorèse</FormLabel>
                        <FormControl><Input placeholder="ex: AS, AA..." className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Âge actuel</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" type="number" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Scale className="size-3" /> Poids (kg)</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                    <FormItem className="text-left">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><AlertTriangle className="size-3 text-amber-500" /> Allergies</FormLabel>
                    <FormControl><Textarea placeholder="Pénicilline, arachides..." className="bg-white/5 border-white/10 rounded-xl min-h-[80px] resize-none text-sm italic" {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>

        {/* URGENCE & SÉCURITÉ */}
        <div className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <AlertTriangle className="size-4" /> Urgence & Sécurité
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact d'urgence (Nom)</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                    <FormItem className="text-left">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact d'urgence (Tél)</FormLabel>
                        <FormControl><Input className="bg-white/5 border-white/10 rounded-xl" {...field} /></FormControl>
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="exportPin"
                render={({ field }) => (
                <FormItem className="text-left">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Lock className="size-3 text-primary" /> Nouveau Code PIN Export (4+ chiffres)
                    </FormLabel>
                    <FormControl>
                    <Input className="bg-white/5 border-white/10 rounded-xl" type="password" placeholder="••••" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="flex flex-col gap-3 pt-6">
            <Button type="submit" className="w-full h-14 font-black italic rounded-2xl gap-2 shadow-xl shadow-primary/20" disabled={loading}>
            {loading ? <Loader2 className="animate-spin size-5" /> : <ShieldCheck className="size-5" />}
            {loading ? "ENREGISTREMENT..." : "SAUVEGARDER TOUTES LES MODIFICATIONS"}
            </Button>
            
            <Button type="button" onClick={handlePanicRevoke} variant="destructive" className="w-full h-12 rounded-xl gap-2 opacity-80 hover:opacity-100 transition-all font-bold text-xs" disabled={revoking}>
                <AlertTriangle className="size-4" /> {revoking ? "RÉVOCATION..." : "RÉVOQUER TOUS LES ACCÈS MÉDECINS"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
