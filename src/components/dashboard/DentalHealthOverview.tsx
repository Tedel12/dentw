import { getUserAppointmentStats } from "@/lib/actions/appointments";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { HeartPulse, MessageSquareIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";

async function DentalHealthOverview() {
  const appointmentStats = await getUserAppointmentStats();
  const user = await currentUser();

  return (
    <Card className="lg:col-span-2 w-full overflow-hidden">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <HeartPulse className="size-5 text-primary" />
          Votre santé
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Suivez votre parcours de soins médicaux</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-3 md:p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="text-xl md:text-2xl font-black text-primary mb-1">
              {appointmentStats.completedAppointments}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Visites terminées</div>
          </div>
          <div className="text-center p-3 md:p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="text-xl md:text-2xl font-black text-primary mb-1">
              {appointmentStats.totalAppointments}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Rendez-vous</div>
          </div>
          <div className="text-center p-3 md:p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="text-xl md:text-2xl font-black text-primary mb-1">
              {format(new Date(user?.createdAt!), "MMM yyyy")}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Membre depuis</div>
          </div>
        </div>

        <div className="mt-6 p-4 md:p-5 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-2xl border border-primary/20 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-start gap-4 relative z-10">
            <div className="size-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
              <MessageSquareIcon className="size-6 text-primary" />
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-primary mb-1 italic uppercase tracking-tighter">Prêt à commencer ?</h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Prenez votre premier rendez-vous ou essayez notre assistant vocal IA pour des conseils de santé généraux.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/voice" className="flex-1 sm:flex-none">
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 font-bold rounded-lg shadow-lg">
                    Assistant IA
                  </Button>
                </Link>
                <Link href="/appointments" className="flex-1 sm:flex-none">
                  <Button size="sm" variant="outline" className="w-full font-bold rounded-lg border-primary/20 hover:bg-primary/5">
                    Prendre RDV
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DentalHealthOverview;
