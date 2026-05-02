import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { PatientAppointmentsClient } from "@/components/appointments/PatientAppointmentsClient";
import { DoctorAppointmentsView } from "@/components/appointments/DoctorAppointmentsView";
import { getDoctorAppointments } from "@/lib/actions/appointments";

export default async function AppointmentsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { doctorProfile: true }
  });

  if (!user) return null;

  let doctorAppointments: any[] = [];
  if (user.role === "DOCTOR" && user.doctorProfile) {
    try {
      const res = await getDoctorAppointments(user.doctorProfile.id);
      if (res.success) {
        doctorAppointments = res.appointments || [];
      }
    } catch (error) {
      console.error("Failed to fetch doctor appointments:", error);
      // doctorAppointments remains as empty array
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {user.role === "DOCTOR" ? (
          <DoctorAppointmentsView appointments={doctorAppointments} />
        ) : (
          <PatientAppointmentsClient />
        )}
      </div>
    </>
  );
}
