import { getUserAppointments } from "@/lib/actions/appointments";
import { format, isAfter, isSameDay, parseISO } from "date-fns";
import NoNextAppointments from "./NoNextAppointments";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, ClockIcon, UserIcon, VideoIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";

async function NextAppointment() {
  const appointments = await getUserAppointments();

  const toDate = (value: Date | string) => {
    if (value instanceof Date) return value;
    return parseISO(value);
  };

  // filter for upcoming CONFIRMED appointments only (today or future)
  const upcomingAppointments =
    appointments?.filter((appointment) => {
      const appointmentDate = toDate(appointment.date);
      const today = new Date();
      const isUpcoming = isSameDay(appointmentDate, today) || isAfter(appointmentDate, today);
      return isUpcoming && appointment.status === "CONFIRMED";
    }) || [];

  // get the next appointment (earliest upcoming one)
  const nextAppointment = upcomingAppointments[0];

  if (!nextAppointment) return <NoNextAppointments />; // no appointments, return nothing

  const appointmentDate = toDate(nextAppointment.date);
  const formattedDate = format(appointmentDate, "EEEE, MMMM d, yyyy");
  const isToday = isSameDay(appointmentDate, new Date());

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background w-full overflow-hidden">
      <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <CalendarIcon className="size-5 text-primary" />
          Prochain rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {isToday ? "Aujourd'hui" : "À venir"}
              </span>
            </div>
            {nextAppointment.type === "ONLINE" && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] uppercase font-black px-2 py-0.5">
                Vidéo
              </Badge>
            )}
          </div>
          <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {nextAppointment.status}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/10 shadow-inner group-hover:scale-110 transition-transform">
              <UserIcon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm text-white truncate">{nextAppointment.doctorName}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">{nextAppointment.reason}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/10 shadow-inner group-hover:scale-110 transition-transform">
              <CalendarIcon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm text-white truncate">{formattedDate}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {isToday ? "Aujourd'hui" : format(appointmentDate, "EEEE")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/10 shadow-inner group-hover:scale-110 transition-transform">
              <ClockIcon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm text-white truncate">{nextAppointment.time}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider italic">Heure locale</p>
            </div>
          </div>
        </div>

        {/* Action Button for Online Appointments */}
        {nextAppointment.type === "ONLINE" && (
          <Button asChild className="w-full bg-primary hover:bg-primary/90 font-black italic rounded-xl shadow-lg shadow-primary/20 group">
            <Link href={`/appointments/room/${nextAppointment.id}`} className="flex items-center justify-center gap-2">
              <VideoIcon className="size-4 group-hover:animate-bounce" />
              REJOINDRE LA CONSULTATION
            </Link>
          </Button>
        )}

        {/* More Appointments Count */}
        {upcomingAppointments.length > 1 && (
          <p className="text-[10px] text-center text-muted-foreground/60 font-bold uppercase tracking-[0.2em] pt-2">
            +{upcomingAppointments.length - 1} autre rendez-vous
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default NextAppointment;
