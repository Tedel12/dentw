import ActivityOverview from "@/components/dashboard/ActivityOverview";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Navbar from "@/components/Navbar";
import { DoctorAppointmentsView } from "@/components/appointments/DoctorAppointmentsView";
import { HealthAccessNotifications } from "@/components/dashboard/HealthAccessNotifications";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { QRCodeAccess } from "@/components/dashboard/QRCodeAccess";

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function DashboardPage() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      redirect("/");
    }

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

    if (!user) {
      redirect("/");
    }

    return (
      <>
        <Navbar />
        <div className="w-full px-4 md:px-8 py-8 pt-24">
          {user.role === "DOCTOR" ? (
            <div className="space-y-12 pb-20 max-w-[1600px] mx-auto">
              <WelcomeSection role={user.role} />

              {/* Statistiques en haut */}
              <ActivityOverview />

              {/* Agenda principal */}
              <div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-[3rem]">
                  <h2 className="text-2xl font-black italic mb-8">Consultations à venir</h2>
                  <DoctorAppointmentsView 
                      appointments={user.doctorProfile ? (await getDoctorAppointments(user.doctorProfile.id)).appointments || [] : []} 
                      doctorProfile={user.doctorProfile} 
                  />
              </div>
            </div>
          ) : (
            <div className="space-y-12 pb-20 max-w-[1600px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <WelcomeSection role={user.role} />
                <QRCodeAccess />
              </div>
              
              <Suspense fallback={<div>Chargement...</div>}>
                <HealthAccessNotifications requests={user.healthAccessRequests as any} />
              </Suspense>

              <div className="w-full">
                  <MainActions role={user.role} />
                  <ActivityOverview />
              </div>
            </div>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in DashboardPage:", error);
    // Depending on the desired behavior, you could show an error UI component
    return <div className="text-white p-10">Une erreur est survenue lors du chargement de votre tableau de bord.</div>;
  }
}

  // Fonction utilitaire locale pour récupérer les RDV dans le dashboard
  async function getDoctorAppointments(doctorId: string) {
  const { getDoctorAppointments } = await import("@/lib/actions/appointments");
  return await getDoctorAppointments(doctorId);
  }

  export default DashboardPage;
