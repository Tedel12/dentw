"use client";

import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  History, 
  Stethoscope, 
  Droplet, 
  AlertTriangle,
  Clock,
  Edit,
  ShieldCheck,
  Zap,
  Loader2,
  WifiOff
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { EditHealthProfile } from "@/components/health/EditHealthProfile";
import { ExportCarnetDialog } from "@/components/health/ExportCarnetDialog";
import { AddTreatmentDialog } from "@/components/health/AddTreatmentDialog";
import { AddPastConsultationDialog } from "@/components/health/AddPastConsultationDialog";
import { MarkTreatmentTakenButton } from "@/components/health/MarkTreatmentTakenButton";
import { AnimatedTimelineItem, AnimatedTreatmentCard } from "@/components/health/AnimatedHealthContent";
import { FadeIn } from "@/components/ui/motion-wrapper";
import axios from "axios";

export default function HealthPage() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["health-data"],
    queryFn: async () => {
      const response = await axios.get("/api/health");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-black italic animate-pulse">Chargement de votre carnet...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <WifiOff className="w-16 h-16 text-red-500/50 mb-4" />
        <h2 className="text-2xl font-black italic">Oups ! Impossible de charger vos données</h2>
        <p className="text-muted-foreground max-w-sm">
          Vérifiez votre connexion internet. Si vous avez déjà consulté cette page, elle devrait être disponible hors-ligne.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4 font-bold">Réessayer</Button>
      </div>
    );
  }

  const activeTreatments = user.treatments?.filter((t: any) => t.isActive) || [];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <FadeIn direction="down">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 text-white text-center md:text-left">
            <div className="w-full md:w-auto">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight italic">Mon Carnet de Santé</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Gérez vos traitements et votre historique médical numérique.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <ExportCarnetDialog />
                <AddPastConsultationDialog />
                <AddTreatmentDialog patientId={user.id} />
            </div>
            </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Section Profil Santé */}
          <div className="lg:col-span-1 space-y-8">
            <FadeIn delay={0.2}>
                <Card className="border-primary/20 shadow-xl shadow-primary/5 overflow-hidden rounded-[2rem]">
                <CardHeader className="flex flex-row items-center justify-between pb-4 bg-primary/5">
                    <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter text-primary">
                    <Stethoscope className="w-5 h-5" />
                    Profil Médical
                    </CardTitle>
                    <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/20 hover:text-primary rounded-full transition-all">
                        <Edit className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem] border-primary/20">
                        <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Modifier mon profil santé</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Vos données sont chiffrées et ne sont accessibles qu'à vous et vos médecins autorisés.
                        </DialogDescription>
                        </DialogHeader>
                        <EditHealthProfile userId={user.id} initialData={user} />
                    </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                    <div className="flex justify-between items-center py-3 border-b border-border/50 group">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Poids</span>
                    <span className="font-black text-xl group-hover:text-primary transition-colors">{user.weight != null ? `${user.weight} kg` : "N/D"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border/50 group">
                    <span className="text-muted-foreground flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Droplet className="w-4 h-4 text-red-500" /> Groupe Sanguin
                    </span>
                    <span className="font-black text-2xl text-red-600 tracking-tighter group-hover:scale-110 transition-transform">
                        {user.bloodGroup?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") || "N/D"}
                    </span>
                    </div>
                    <div className="space-y-2">
                    <span className="text-muted-foreground flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Allergies
                    </span>
                    <p className="text-xs bg-amber-500/10 text-amber-200 p-4 rounded-2xl border border-amber-500/20 font-bold leading-tight">
                        {user.allergies || "Aucune allergie répertoriée"}
                    </p>
                    </div>
                    <div className="space-y-2">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Maladies Chroniques</span>
                    <p className="text-xs bg-blue-500/10 text-blue-200 p-4 rounded-2xl border border-blue-500/20 font-bold leading-tight">
                        {user.chronicDiseases || "Aucun antécédent"}
                    </p>
                    </div>
                </CardContent>
                </Card>
            </FadeIn>

            <FadeIn delay={0.4}>
                <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm rounded-[2rem]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-green-500 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-4 h-4" />
                    Sécurité des données
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-black text-green-400 italic">Vérifié</div>
                            <p className="text-[10px] text-green-500/70 mt-1 uppercase font-bold tracking-tighter">Standard de santé HDS</p>
                        </div>
                        <Zap className="w-10 h-10 text-green-500 opacity-20 animate-pulse" />
                    </div>
                </CardContent>
                </Card>
            </FadeIn>
          </div>

          {/* Section Traitements et Timeline */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 italic text-white uppercase tracking-tighter">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-primary" />
                </div>
                Traitements Actifs
              </h2>
              <div className="grid gap-4">
                {activeTreatments.length > 0 ? (
                  activeTreatments.map((t: any, index: number) => (
                    <AnimatedTreatmentCard key={t.id} t={t} index={index}>
                        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-2xl transition-all duration-500 bg-card/40 backdrop-blur-md group rounded-2xl border-primary/10">
                        <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-black text-2xl text-white tracking-tight group-hover:text-primary transition-colors">{t.name}</h3>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black">{t.dosage}</Badge>
                                </div>
                                <p className="text-primary/60 font-black text-xs uppercase tracking-widest">{t.frequency}</p>
                                
                                {(t.pathology || t.administrationRoute) && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {t.pathology && <span className="bg-white/5 text-muted-foreground text-[10px] px-2 py-1 rounded-lg border border-white/5 font-bold uppercase tracking-wider">Pathologie: {t.pathology}</span>}
                                        {t.administrationRoute && <span className="bg-white/5 text-muted-foreground text-[10px] px-2 py-1 rounded-lg border border-white/5 font-bold uppercase tracking-wider">Voie: {t.administrationRoute}</span>}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2 mt-6 text-primary bg-primary/10 w-fit px-4 py-2 rounded-2xl border border-primary/10 shadow-inner">
                                    <Clock className="w-4 h-4 animate-spin-slow" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Prochaine prise : {t.time.split(',')[0]}</span>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <MarkTreatmentTakenButton treatmentId={t.id} />
                            </div>
                        </div>
                        </Card>
                    </AnimatedTreatmentCard>
                  ))
                ) : (
                  <FadeIn delay={0.6}>
                    <div className="text-center py-16 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5 flex flex-col items-center gap-4">
                        <Activity className="w-12 h-12 text-white/10" />
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Aucun traitement en cours</p>
                    </div>
                  </FadeIn>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-white uppercase tracking-tighter">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                    <History className="w-6 h-6 text-primary" />
                </div>
                Journal de Santé
              </h2>
              <div className="relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-white/5 ml-2">
                {(() => {
                  // Fusionner et trier par date décroissante
                  const timelineItems = [
                    ...(user.treatments || []),
                    ...(user.appointments || [])
                  ].sort((a, b) => {
                    const dateA = new Date(a.date || a.createdAt).getTime();
                    const dateB = new Date(b.date || b.createdAt).getTime();
                    return dateB - dateA;
                  });

                  return timelineItems.map((item: any, index: number) => (
                    <AnimatedTimelineItem key={item.id} item={item} index={index} />
                  ));
                })()}
                
                {(!user.treatments?.length && !user.appointments?.length) && (
                    <div className="pl-10 py-4">
                        <p className="text-sm text-slate-500 italic">Aucun historique disponible pour le moment.</p>
                    </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
