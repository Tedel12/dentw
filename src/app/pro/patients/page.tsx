import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { APP_NAME } from "@/lib/brand";
import { Stethoscope, ShieldAlert, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DoctorPatientsClient } from "./DoctorPatientsClient";

export default async function DoctorPatientsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  let user: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;
  try {
    // Fetch user from DB with role and profile
    user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { doctorProfile: true },
    });
  } catch (error) {
    console.error("DoctorPatientsPage DB error:", error);
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
          <div className="max-w-md w-full bg-background p-8 rounded-3xl border shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold italic">Service temporairement indisponible</h1>
              <p className="text-muted-foreground">
                Impossible de joindre la base de données pour le moment. Réessayez dans quelques instants.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/pro/patients">Réessayer</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/dashboard">Retour dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const doctorUser = user as any;

  // If Verified Doctor (role updated by admin), show the real management page
  if (user && user.role === "DOCTOR" && doctorUser.doctorProfile?.verificationStatus === "VERIFIED") {
    return <DoctorPatientsClient isInitialPatient={false} userId={user.id} doctor={doctorUser.doctorProfile} />;
  }

  // For everyone else (no profile, pending, or rejected), show the onboarding/status component
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
        <div className="max-w-md w-full bg-background p-8 rounded-3xl border shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Stethoscope className="w-10 h-10 text-primary" />
          </div>
          
          <DoctorPatientsClient 
            isInitialPatient={true} 
            userId={user?.id || ""} 
            doctor={doctorUser?.doctorProfile} 
          />
          
          <Button variant="ghost" asChild className="w-full">
              <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
