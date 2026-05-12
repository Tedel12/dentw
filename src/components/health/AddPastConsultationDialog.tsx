"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogTrigger, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarIcon, ClipboardList, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  doctorName: z.string().min(2, "Le nom du médecin est requis"),
  date: z.date(),
  reason: z.string().min(2, "Le motif est requis"),
  summary: z.string().optional(),
});

export function AddPastConsultationDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorName: "",
      reason: "",
      summary: "",
      date: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Consultation ajoutée à votre historique");
        queryClient.invalidateQueries({ queryKey: ["health-data"] });
        setOpen(false);
        form.reset();
      } else {
        toast.error("Erreur lors de l'ajout");
      }
    } catch (error) {
      toast.error("Une erreur technique est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl gap-2">
            <Plus className="w-4 h-4" /> Ajouter une consultation passée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black italic tracking-tighter">Nouvelle entrée manuelle</DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Complétez votre historique médical en ajoutant vos consultations externes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Nom du praticien</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jean Dupont" {...field} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Date de la séance</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "h-12 bg-white/5 border-white/10 rounded-xl text-left font-normal pl-3",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                            ) : (
                                <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-slate-900" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            locale={fr}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Motif</FormLabel>
                    <FormControl>
                        <Input placeholder="Détartrage, etc." {...field} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Notes & Résumé (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Qu'a dit le médecin ? Quelle a été la conclusion ?" 
                        className="bg-white/5 border-white/10 rounded-xl min-h-[100px]" 
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black italic rounded-2xl shadow-xl shadow-emerald-900/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ClipboardList className="w-5 h-5 mr-2" />}
                ENREGISTRER DANS MON CARNET
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
