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

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {user.role === "DOCTOR" && !user.doctorProfile && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm text-foreground">
              <span className="font-semibold">Profil praticien incomplet.</span> Complétez vos informations
              professionnelles pour utiliser l&apos;espace praticien et les ordonnances.
            </p>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/pro/patients">Compléter mon profil</Link>
            </Button>
          </div>
        )}
        <HealthAccessNotifications requests={user.healthAccessRequests as any} />
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
      </div>
    </>
  );
}

export default DashboardPage;
