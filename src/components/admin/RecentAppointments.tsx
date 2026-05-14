import { useGetAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointment";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";

function RecentAppointments() {
  const { data: appointments = [] } = useGetAppointments();
  const updateAppointmentMutation = useUpdateAppointmentStatus();

  const handleToggleAppointmentStatus = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (!appointment) return;
    const newStatus = appointment.status === "CONFIRMED" ? "COMPLETED" : "CONFIRMED";
    updateAppointmentMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black uppercase text-[10px] tracking-widest rounded-full">Confirmé</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase text-[10px] tracking-widest rounded-full">Terminé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase text-[10px] tracking-widest rounded-full">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] mt-8 shadow-xl">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-black italic tracking-tighter">
          <Calendar className="h-6 w-6 text-primary" />
          Rendez-vous récents
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/5">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-primary font-black uppercase text-[10px] tracking-widest">Patient</TableHead>
                <TableHead className="text-primary font-black uppercase text-[10px] tracking-widest">Praticien</TableHead>
                <TableHead className="text-primary font-black uppercase text-[10px] tracking-widest">Date & Heure</TableHead>
                <TableHead className="text-primary font-black uppercase text-[10px] tracking-widest">Type</TableHead>
                <TableHead className="text-primary font-black uppercase text-[10px] tracking-widest">Statut</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.slice(0, 10).map((appointment: any) => (
                <TableRow key={appointment.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="font-bold text-white">
                      {appointment.user?.firstName ?? ''} {appointment.user?.lastName ?? 'Patient'}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-400">
                    Dr. {appointment.doctor?.lastName ?? 'Inconnu'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-primary" />
                      {new Date(appointment.date).toLocaleDateString("fr-FR")} à {appointment.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 text-slate-300 font-bold uppercase text-[9px] tracking-wider rounded-lg">
                        {appointment.type === "ONLINE" ? "Vidéo" : "Cabinet"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAppointmentStatus(appointment.id)}
                      className="hover:bg-transparent h-auto p-0"
                    >
                      {getStatusBadge(appointment.status)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-bold italic">
                          Aucun rendez-vous trouvé.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAppointments;
