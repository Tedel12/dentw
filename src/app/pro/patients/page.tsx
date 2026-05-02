import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
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

  // STRICT SERVER SIDE PROTECTION
  if (!user || user.role !== "DOCTOR" || !doctorUser.doctorProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
          <div className="max-w-md w-full bg-background p-8 rounded-3xl border shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold italic">Accès Réservé</h1>
              <p className="text-muted-foreground">
                Cet espace est strictement réservé aux professionnels de santé enregistrés sur Dentwise.
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-2xl text-sm flex items-start gap-3 text-left border">
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>Pour accéder à la gestion des patients et aux ordonnances, vous devez d'abord compléter votre profil de praticien.</p>
            </div>

            {user && <DoctorPatientsClient isInitialPatient={true} userId={user.id} />}
            
            <Button variant="ghost" asChild className="w-full">
                <Link href="/dashboard">Retour au tableau de bord</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // NEW: VERIFICATION STATUS PROTECTION
  if (doctorUser.doctorProfile.verificationStatus !== "VERIFIED") {
    const isRejected = doctorUser.doctorProfile.verificationStatus === "REJECTED";
    
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-6">
          <div className="max-w-md w-full bg-background p-8 rounded-3xl border shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
              {isRejected ? (
                <ShieldAlert className="w-10 h-10 text-destructive" />
              ) : (
                <Lock className="w-10 h-10 text-amber-500 animate-pulse" />
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {isRejected ? "Profil Rejeté" : "Vérification en cours"}
              </h1>
              <p className="text-muted-foreground">
                {isRejected 
                  ? "Votre profil de praticien a été rejeté par l'administration. Veuillez contacter le support pour plus d'informations."
                  : "Votre compte est en attente de validation par l'administration de Dentwise. Cette étape garantit la sécurité des données de santé."}
              </p>
            </div>
            
            <div className="p-4 bg-amber-50/50 rounded-2xl text-sm border border-amber-100 text-amber-800 text-left">
                <p className="font-medium mb-1">Pourquoi cette attente ?</p>
                <p className="opacity-80">Nous vérifions manuellement votre numéro de licence et vos informations professionnelles pour prévenir toute usurpation d'identité médicale.</p>
            </div>
            
            <Button asChild className="w-full">
              <Link href="/dashboard">Retour au dashboard patient</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  // If Verified Doctor, show the real management page
  return <DoctorPatientsClient isInitialPatient={false} userId={user.id} doctor={doctorUser.doctorProfile} />;
}
