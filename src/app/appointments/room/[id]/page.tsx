import { getAppointment } from "@/lib/actions/appointments";
import JitsiVideoCall from "@/components/appointments/JitsiVideoCall";
import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info, Shield, User, Activity, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoRoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/");

  const appointment = await getAppointment(id);

  if (!appointment) redirect("/dashboard");

  // Security check: only the patient or the doctor can join
  const isPatient = appointment.user.clerkId === clerkUser.id;
  const isDoctor = appointment.doctor.clerkId === clerkUser.id;

  if (!isPatient && !isDoctor) redirect("/dashboard");

  const userName = isPatient 
    ? `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim() || "Patient"
    : `Dr. ${appointment.doctor.name}`;

  const roomName = `dentwise-consult-${appointment.id}`;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 pt-24 h-[calc(100vh-20px)] flex flex-col gap-6">
        {/* Header de la salle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Consultation Virtuelle Sécurisée</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-widest px-2 py-0">Direct</Badge>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>ID: {appointment.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm bg-black/20 px-4 py-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">{format(appointment.date, "EEEE d MMMM", { locale: fr })}</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-800" />
            <div className="flex items-center gap-2 font-bold">
               {appointment.time}
            </div>
          </div>
        </div>

        {/* Espace de travail */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Vidéo (70%) */}
          <div className="flex-[2] min-h-[400px] lg:min-h-0">
            <JitsiVideoCall 
              roomName={roomName} 
              userName={userName}
            />
          </div>

          {/* Panneau latéral (30%) */}
          <div className="flex-1 min-w-[320px] overflow-y-auto pr-1">
            <div className="space-y-6">
              {/* Informations du Patient/Docteur */}
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-white/5 bg-white/[0.02] py-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {isDoctor ? "Profil du Patient" : "Votre Praticien"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
                      {isDoctor ? appointment.user.firstName?.[0] : appointment.doctor.name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{isDoctor ? `${appointment.user.firstName} ${appointment.user.lastName}` : `Dr. ${appointment.doctor.name}`}</p>
                      <p className="text-xs text-slate-400">{isDoctor ? appointment.user.email : appointment.doctor.speciality}</p>
                    </div>
                  </div>
                  
                  {isDoctor && appointment.user.phone && (
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-sm">
                      <span className="text-slate-500 block mb-1">Téléphone:</span>
                      <span className="font-medium text-slate-300">{appointment.user.phone}</span>
                    </div>
                  )}

                  {!isDoctor && (
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-xs text-slate-300 italic">
                      "Votre praticien a accès à votre carnet de santé pendant la durée de cet appel pour assurer la qualité du diagnostic."
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Détails du RDV */}
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm rounded-2xl">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Motif de consultation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {appointment.reason || "Aucun motif précisé pour cette consultation."}
                  </p>
                </CardContent>
              </Card>

              {/* Section Médicale (Plus visible pour le docteur) */}
              {isDoctor && (
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 px-1">Carnet de santé rapide</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl">
                            <Activity className="w-4 h-4 text-red-400 mb-2" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Groupe Sanguin</span>
                            <p className="font-bold text-slate-200">{appointment.user.bloodGroup?.replace('_', ' ') || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl">
                            <Shield className="w-4 h-4 text-blue-400 mb-2" />
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Allergies</span>
                            <p className="font-bold text-slate-200 truncate">{appointment.user.allergies || 'Aucune'}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm font-bold">Historique complet</p>
                                <p className="text-[10px] text-slate-400">Consulter tous les soins</p>
                            </div>
                        </div>
                        <Badge className="bg-primary text-white font-bold cursor-pointer hover:scale-105 transition-transform">Ouvrir</Badge>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
