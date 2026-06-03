"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthConsentModal } from "@/components/health/HealthConsentModal";
import { 
  Activity, 
  History, 
  HeartPulse, 
  Droplet, 
  AlertTriangle,
  Clock,
  Edit,
  ShieldCheck,
  Zap,
  Loader2,
  WifiOff,
  Calendar as CalendarIcon,
  Globe,
  MapPin,
  AlertCircle,
  Phone,
  UserCircle
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function HealthPage() {
  const [hasConsent, setHasConsent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("health_consent");
    if (saved) setHasConsent(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("health_consent", "true");
    setHasConsent(true);
  };

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["health-data"],
    queryFn: async () => {
      const response = await axios.get("/api/health");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: hasConsent 
  });

  if (!isClient) return null;

  const activeTreatments = user?.treatments?.filter((t: any) => t.isActive) || [];

  return (
    <>
      <HealthConsentModal isOpen={!hasConsent} onAccept={handleAccept} />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        {isLoading && hasConsent && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-black italic animate-pulse">Chargement sécurisé...</p>
            </div>
        )}

        {isError && (
            <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                <WifiOff className="w-16 h-16 text-red-500/50 mb-4" />
                <h2 className="text-2xl font-black italic">Erreur de chargement</h2>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
        )}

        {hasConsent && user && (
            <>
                <FadeIn direction="down">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 text-white text-center md:text-left">
                    <div className="w-full md:w-auto text-left">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase">Mon Carnet</h1>
                        <p className="text-slate-400 font-medium text-sm md:text-base italic">Gestion de votre identité et de votre historique médical.</p>
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
                        <Card className="border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2.5rem] text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-white/5 border-b border-white/5">
                            <CardTitle className="flex items-center gap-2 font-black uppercase tracking-widest text-primary text-sm italic">
                            <HeartPulse className="w-4 h-4" />
                            Profil Médical
                            </CardTitle>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/20 hover:text-primary rounded-xl transition-all">
                                <Edit className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem] bg-[#020617] border-white/10 p-6 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                                <DialogHeader className="text-left mb-6">
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Mettre à jour le profil</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium italic text-sm">
                                    Complétez vos informations pour une meilleure prise en charge médicale.
                                </DialogDescription>
                                </DialogHeader>
                                <EditHealthProfile userId={user.id} initialData={user} />
                            </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8 text-left">
                            {/* Nouveaux champs d'identité */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-1">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Âge</span>
                                    <p className="font-black text-white text-lg">{user.age != null ? `${user.age} ans` : "N/R"}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-1">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Poids</span>
                                    <p className="font-black text-white text-lg">{user.weight != null ? `${user.weight} kg` : "N/R"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic"><CalendarIcon className="size-3.5 text-primary" /> Naissance</span>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 shadow-inner">
                                        <p className="text-sm font-bold">{user.birthDate ? format(new Date(user.birthDate), "dd MMMM yyyy", { locale: fr }) : "Non renseigné"}</p>
                                        <p className="text-[10px] text-primary/70 uppercase font-black tracking-widest flex items-center gap-1.5"><Globe className="size-3" /> {user.birthPlace || "Lieu non renseigné"}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic"><MapPin className="size-3.5 text-primary" /> Résidence</span>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-sm font-medium italic text-slate-300">{user.address || "Adresse non renseignée"}</p>
                                        <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-widest">{user.nationality || "Béninoise"}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic"><AlertCircle className="size-3.5 text-red-500" /> Contact d'urgence</span>
                                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
                                        <p className="text-sm font-black text-red-100 uppercase tracking-tight">{user.emergencyContactName || "Non configuré"}</p>
                                        <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-2"><Phone className="size-3" /> {user.emergencyContactPhone || "Pas de numéro"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-5">
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                                        <Droplet className="w-4 h-4 text-red-500" /> Groupe Sanguin
                                    </span>
                                    <span className="font-black text-2xl text-red-600 tracking-tighter group-hover:scale-110 transition-transform">
                                        {user.bloodGroup?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") || "N/D"}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-slate-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Allergies
                                    </span>
                                    <p className="text-xs bg-amber-500/10 text-amber-200 p-4 rounded-2xl border border-amber-500/20 font-bold leading-relaxed italic">
                                        {user.allergies || "Aucune allergie répertoriée"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest italic">Maladies Chroniques</span>
                                    <p className="text-xs bg-blue-500/10 text-blue-200 p-4 rounded-2xl border border-blue-500/20 font-bold leading-relaxed italic">
                                        {user.chronicDiseases || "Aucun antécédent particulier"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-slate-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Vaccins
                                    </span>
                                    <p className="text-xs bg-emerald-500/10 text-emerald-200 p-4 rounded-2xl border border-emerald-500/20 font-bold leading-relaxed italic">
                                        {user.vaccines || "Aucun vaccin renseigné"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest italic">Électrophorèse</span>
                                    <p className="text-xs bg-violet-500/10 text-violet-200 p-3 rounded-xl border border-violet-500/20 font-black italic">
                                        {user.electrophoresis || "N/R"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        </Card>
                    </FadeIn>

                    <FadeIn delay={0.4}>
                        <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm rounded-[2rem] overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <ShieldCheck className="w-4 h-4" />
                            Souveraineté des données
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-left">
                                    <div className="text-2xl font-black text-emerald-400 italic uppercase tracking-tighter leading-none">Chiffré</div>
                                    <p className="text-[10px] text-emerald-500/70 mt-1 uppercase font-black tracking-tighter">Protection AES-256 active</p>
                                </div>
                                <Zap className="w-10 h-10 text-emerald-500 opacity-20 animate-pulse" />
                            </div>
                        </CardContent>
                        </Card>
                    </FadeIn>
                  </div>

                  {/* Section Traitements et Timeline */}
                  <div className="lg:col-span-2 space-y-12">
                    <section className="text-left">
                      <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 italic text-white uppercase tracking-tighter">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
                            <Activity className="w-7 h-7 text-primary" />
                        </div>
                        Suivi en cours
                      </h2>
                      <div className="grid gap-6">
                        {activeTreatments.length > 0 ? (
                          activeTreatments.map((t: any, index: number) => (
                            <AnimatedTreatmentCard key={t.id} t={t} index={index}>
                                <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-2xl transition-all duration-500 bg-slate-900/40 backdrop-blur-md group rounded-[2rem] border-white/5">
                                <div className="p-8 space-y-8">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-black text-2xl md:text-3xl text-white tracking-tight group-hover:text-primary transition-colors uppercase italic">{t.name}</h3>
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black h-6 px-3">{t.dosage}</Badge>
                                            </div>
                                            <p className="text-primary/70 font-black text-[11px] md:text-sm uppercase tracking-[0.2em]">{t.pathology || "Traitement général"}</p>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 border-y border-white/5 py-6 mt-6">
                                                <div className="space-y-1">
                                                    <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest block">Fréquence</span>
                                                    <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.frequency || "N/R"}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest block">Horaires</span>
                                                    <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.time || "N/R"}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest block">Durée</span>
                                                    <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.duration ? `${t.duration} jours` : "N/R"}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest block">Voie</span>
                                                    <span className="font-bold text-slate-200 block text-xs md:text-base italic truncate">{t.administrationRoute || "N/R"}</span>
                                                </div>
                                            </div>

                                            {t.notes && (
                                                <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl italic text-xs md:text-sm text-slate-400">
                                                    <span className="text-slate-600 font-black uppercase text-[8px] block mb-2 tracking-[0.2em]">Notes médicales</span>
                                                    {t.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-start md:items-center shrink-0">
                                            <MarkTreatmentTakenButton treatmentId={t.id} />
                                        </div>
                                    </div>
                                </div>
                                </Card>
                            </AnimatedTreatmentCard>
                          ))
                        ) : (
                          <FadeIn delay={0.6}>
                            <div className="text-center py-20 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5 flex flex-col items-center gap-4">
                                <Activity className="w-16 h-16 text-white/5" />
                                <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs italic">Aucun traitement actif</p>
                            </div>
                          </FadeIn>
                        )}
                      </div>
                    </section>

                    <section className="text-left">
                      <h2 className="text-2xl md:text-3xl font-black mb-10 flex items-center gap-3 italic text-white uppercase tracking-tighter">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
                            <History className="w-7 h-7 text-primary" />
                        </div>
                        Historique Médical
                      </h2>
                      <div className="relative before:absolute before:inset-0 before:left-2 before:w-px before:bg-white/5 ml-2">
                        {(() => {
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
                            <div className="pl-12 py-10 opacity-30">
                                <History className="size-10 text-slate-500 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic">Journal de bord vide.</p>
                            </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
            </>
        )}
      </div>
    </>
  );
}
