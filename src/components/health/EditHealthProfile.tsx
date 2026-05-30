"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BloodGroup } from "@prisma/client";
import { updateHealthProfile } from "@/lib/actions/health";
import { updateExportPin } from "@/lib/actions/users";
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
import { User, Droplet, AlertTriangle, ShieldCheck, Scale, Lock } from "lucide-react";

const formSchema = z.object({
  pseudo: z.string().min(2, "Le pseudo est requis"),
  age: z.string(),
  weight: z.string().optional(),
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
      pseudo: initialData?.pseudo || "",
      age: initialData?.age?.toString() || "",
      weight: initialData?.weight != null ? String(initialData.weight) : "",
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

    if (values.exportPin && values.exportPin !== initialData?.exportPin) {
      const pinRes = await updateExportPin(values.exportPin);
      if (!pinRes.success) {
        toast.error(pinRes.error || "Erreur lors de la mise à jour du PIN");
        setLoading(false);
        return;
      }
    }

    const age = parseInt(values.age, 10);
    if (isNaN(age) || age < 0 || age > 120) {
      toast.error("Âge invalide : indiquez une valeur entre 0 et 120.");
      setLoading(false);
      return;
    }

    const wRaw = values.weight?.trim() ?? "";
    let weight: number | null | undefined = undefined;
    if (wRaw === "") {
      weight = null;
    } else {
      const w = parseFloat(wRaw.replace(",", "."));
      if (!Number.isFinite(w) || w < 1 || w > 400) {
        toast.error("Poids invalide : indiquez une valeur entre 1 et 400 kg, ou laissez vide.");
        setLoading(false);
        return;
      }
      weight = w;
    }

    const res = await updateHealthProfile(userId, {
      pseudo: values.pseudo,
      age,
      weight,
      bloodGroup: values.bloodGroup,
      allergies: values.allergies,
      chronicDiseases: values.chronicDiseases,
      electrophoresis: values.electrophoresis,
      vaccines: values.vaccines,
    });
    if (res.success) {
      toast.success("Profil santé mis à jour avec succès");
      onSuccess?.();
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pseudo"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><User className="w-3.5 h-3.5" /> Pseudo / Nom Public</FormLabel>
                <FormControl><Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl" placeholder="ex: Patient_01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Âge</FormLabel>
                <FormControl><Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl" type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-primary" /> Poids (kg)
                </FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl" type="text" inputMode="decimal" placeholder="ex: 70.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Droplet className="w-3.5 h-3.5 text-red-500" /> Groupe Sanguin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl">
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {Object.values(BloodGroup).map((bg: any) => (
                      <SelectItem key={bg} value={bg}>{bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exportPin"
            render={({ field }) => (
              <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-primary" /> PIN Export (4+ chiffres)
                </FormLabel>
                <FormControl>
                  <Input className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl" type="password" placeholder="••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
            <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
                <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Allergies connues</FormLabel>
                <FormControl><Textarea placeholder="ex: Pénicilline, Arachides..." className="bg-white/5 border-white/10 rounded-xl min-h-[80px] resize-none" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="chronicDiseases"
            render={({ field }) => (
                <FormItem className="text-left">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Maladies / Antécédents</FormLabel>
                <FormControl><Textarea placeholder="ex: Diabète type 2, Asthme..." className="bg-white/5 border-white/10 rounded-xl min-h-[80px] resize-none" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="electrophoresis"
                render={({ field }) => (
                    <FormItem className="text-left">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Électrophorèse</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="ex: AS, AA, AC..."
                        className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="vaccines"
                render={({ field }) => (
                    <FormItem className="text-left">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Derniers Vaccins</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="ex: Tétanos (2024)..."
                        className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>

        <div className="flex flex-col gap-3 pt-6">
            <Button type="submit" className="w-full h-12 md:h-14 font-black italic rounded-xl gap-2 shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {loading ? "ENREGISTREMENT..." : "SAUVEGARDER MON PROFIL"}
            </Button>
            
            <Button type="button" onClick={handlePanicRevoke} variant="destructive" className="w-full h-10 md:h-12 rounded-xl gap-2 opacity-80 hover:opacity-100 transition-all font-bold text-[10px] md:text-xs" disabled={revoking}>
                <AlertTriangle className="w-3.5 h-3.5" /> {revoking ? "RÉVOCATION..." : "RÉVOQUER TOUS LES ACCÈS MÉDECINS"}
            </Button>
        </div>
      </form>
    </Form>
  );
}

// Ajouter la fonction handlePanicRevoke et l'import manquant avant le return si nécessaire, 
// mais ici je l'ajoute juste avant le rendu final.
// NOTE: Assurez-vous d'ajouter `import { revokeAllAccess } from "@/lib/actions/security-revoke";` en haut du fichier.
