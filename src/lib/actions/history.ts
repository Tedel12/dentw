"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function trackRecentPatient(doctorId: string, patientId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Upsert: si existe, met à jour la date, sinon crée.
    await prisma.recentPatient.upsert({
      where: {
        doctorId_patientId: { doctorId, patientId },
      },
      update: { lastAccessedAt: new Date() },
      create: { doctorId, patientId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error tracking recent patient:", error);
    return { success: false, error: "Failed to track patient" };
  }
}

export async function getRecentPatients(doctorId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 1. Purger les anciens logs (> 48h)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await prisma.recentPatient.deleteMany({
      where: {
        doctorId,
        lastAccessedAt: { lt: fortyEightHoursAgo },
      },
    });

    // 2. Récupérer les patients restants
    const recent = await prisma.recentPatient.findMany({
      where: { doctorId },
      orderBy: { lastAccessedAt: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return { success: true, patients: recent.map(r => r.user) };
  } catch (error) {
    console.error("Error fetching recent patients:", error);
    return { success: false, error: "Failed to fetch recent patients" };
  }
}
