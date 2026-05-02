import ActivityOverview from "@/components/dashboard/ActivityOverview";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Navbar from "@/components/Navbar";
import { HealthAccessNotifications } from "@/components/dashboard/HealthAccessNotifications";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) return null;

  // Get user from DB with pending health access requests
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      doctorProfile: true,
      healthAccessRequests: {
        where: { status: "PENDING" },
        include: { doctor: true }
      }
    }
  });

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        {user.role === "DOCTOR" && !user.doctorProfile && (
          <div
            className="mb-8 flex flex-col gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-5 md:flex-row md:items-center md:justify-between shadow-inner shadow-primary/5"
            role="status"
          >
            <p className="text-sm text-foreground/90 font-medium leading-relaxed">
              <span className="font-black italic text-primary uppercase tracking-tighter">Profil praticien incomplet.</span> Complétez vos informations
              professionnelles pour utiliser l&apos;espace praticien et les ordonnances.
            </p>
            <Button asChild size="sm" className="shrink-0 rounded-xl font-bold">
              <Link href="/pro/patients">Compléter mon profil</Link>
            </Button>
          </div>
        )}
        <div className="space-y-10 md:space-y-16">
            <HealthAccessNotifications requests={user.healthAccessRequests as any} />
            <WelcomeSection />
            <MainActions />
            <ActivityOverview />
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
