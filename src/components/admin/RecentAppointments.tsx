import { useGetAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointment";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";

function RecentAppointments() {
  const { data: appointments = [] } = useGetAppointments();
  const updateAppointmentMutation = useUpdateAppointmentStatus();

  const handleToggleAppointmentStatus = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    const newStatus = appointment?.status === "CONFIRMED" ? "COMPLETED" : "CONFIRMED";
    updateAppointmentMutation.mutate({ id: appointmentId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmé</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Rendez-vous récents
        </CardTitle>
        <CardDescription>Suivez et gérez tous les rendez-vous des patients</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.map((appointment: any) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {appointment.user?.firstName ?? ''} {appointment.user?.lastName ?? 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.user?.email ?? '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {appointment.doctor?.firstName ?? ''} {appointment.doctor?.lastName ?? 'Unknown Doctor'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(appointment.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="text-sm text-muted-foreground">{appointment.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAppointmentStatus(appointment.id)}
                      className="h-6 px-2"
                    >
                      {getStatusBadge(appointment.status)}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-xs text-muted-foreground">Cliquez sur le statut pour changer</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAppointments;
