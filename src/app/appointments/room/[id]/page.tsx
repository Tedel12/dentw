import { getAppointment } from "@/lib/actions/appointments";
import JitsiVideoCall from "@/components/appointments/JitsiVideoCall";
import Navbar from "@/components/Navbar";
import RoomSidebar from "@/components/appointments/RoomSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield } from "lucide-react";
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

  if (!appointment || appointment.status === "COMPLETED") redirect("/dashboard");

  // Security check: only the patient or the doctor can join
  const isPatient = appointment.user.clerkId === clerkUser.id;
  const isDoctor = appointment.doctor.clerkId === clerkUser.id;

  if (!isPatient && !isDoctor) redirect("/dashboard");

  const userName = isPatient 
    ? `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim() || "Patient"
    : `Dr. ${appointment.doctor.name}`;

  const roomName = `benin-sante-consult-${appointment.id}`;

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 md:px-6 py-4 pt-20 flex flex-col gap-4 min-h-0">
        {/* Header de la salle compact */}
        <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black italic tracking-tight">Téléconsultation Sécurisée</h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] h-4 px-1.5">Direct</Badge>
                <span>ID: {appointment.id.substring(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-primary" />
              <span className="text-slate-300">{format(appointment.date, "d MMM yyyy", { locale: fr })}</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-800" />
            <div className="text-white">
               {appointment.time}
            </div>
          </div>
        </div>

        {/* Espace de travail dynamique */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pb-4">
          {/* Vidéo (Zone principale) */}
          <div className="flex-[3] min-h-[300px] lg:min-h-0 shadow-2xl shadow-black/50">
            <JitsiVideoCall 
              roomName={roomName} 
              userName={userName}
            />
          </div>

          {/* Sidebar Interactive */}
          <div className="flex-1 min-w-[340px] max-w-[400px] overflow-y-auto custom-scrollbar pr-1">
            <RoomSidebar appointment={appointment} isDoctor={isDoctor} />
          </div>
        </div>
      </main>
    </div>
  );
}
