"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BloodGroup } from "@prisma/client";
import { updateHealthProfile } from "@/lib/actions/health";
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
import { User, Droplet, AlertTriangle, ShieldCheck, Scale } from "lucide-react";

const formSchema = z.object({
  pseudo: z.string().min(2, "Le pseudo est requis"),
  age: z.string(),
  weight: z.string().optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  electrophoresis: z.string().optional(),
  vaccines: z.string().optional(),
});

interface EditHealthProfileProps {
  userId: string;
  initialData: any;
  onSuccess?: () => void;
}

export function EditHealthProfile({ userId, initialData, onSuccess }: EditHealthProfileProps) {
  const [loading, setLoading] = useState(false);

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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pseudo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Pseudo / Nom Public</FormLabel>
                <FormControl><Input placeholder="ex: Patient_01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Âge</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" /> Poids (kg)
                </FormLabel>
                <FormControl>
                  <Input type="text" inputMode="decimal" placeholder="ex: 70.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Droplet className="w-4 h-4 text-red-500" /> Groupe Sanguin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(BloodGroup).map((bg: any) => (
                      <SelectItem key={bg} value={bg}>{bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Allergies connues</FormLabel>
              <FormControl><Textarea placeholder="ex: Pénicilline, Arachides..." className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chronicDiseases"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maladies Chroniques / Antécédents</FormLabel>
              <FormControl><Textarea placeholder="ex: Diabète type 2, Asthme..." className="resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="electrophoresis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Électrophorèse</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ex: AS, AA, AC... ou résultat pertinent"
                  className="resize-none"
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
            <FormItem>
              <FormLabel>Vaccins</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ex: Tétanos (2024), Hépatite B..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          <ShieldCheck className="w-4 h-4" /> {loading ? "Enregistrement..." : "Sauvegarder mon profil sécurisé"}
        </Button>
      </form>
    </Form>
  );
}
