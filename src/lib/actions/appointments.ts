"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { AppointmentType } from "@prisma/client";

export async function bookAppointment(data: {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
  type?: AppointmentType;
  duration?: number;
  price?: number;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Non autorisé");

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) throw new Error("Utilisateur non trouvé");

  const appointment = await prisma.appointment.create({
    data: {
      userId: user.id,
      doctorId: data.doctorId,
      date: new Date(data.date),
      time: data.time,
      reason: data.reason,
      status: "CONFIRMED",
      type: data.type || "IN_PERSON",
      duration: data.duration || 30,
      price: data.price || 0,
    },
    include: {
      doctor: true,
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  return {
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
    type: appointment.type,
    doctorName: appointment.doctor.name,
    patientEmail: user.email,
  };
}

export async function getUserAppointments() {
  const clerkUser = await currentUser();
  if (!clerkUser) return [];

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) return [];

  const appointments = await prisma.appointment.findMany({
    where: { 
      userId: user.id,
      status: { in: ["CONFIRMED", "COMPLETED"] } 
    },
    include: {
      doctor: true,
    },
    orderBy: { date: "desc" },
  });

  return appointments.map((apt) => ({
    id: apt.id,
    date: apt.date,
    time: apt.time,
    reason: apt.reason,
    doctorName: apt.doctor.name,
    doctorImageUrl: apt.doctor.imageUrl,
    status: apt.status,
    type: apt.type,
  }));
}

export async function completeAppointment({ id, summary }: { id: string; summary?: string }) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: "COMPLETED",
        summary: summary?.trim() || "Consultation terminée."
      },
    });
    
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/health");
    revalidatePath(`/appointments/room/${id}`);
    
    return { success: true, appointment };
  } catch (error) {
    console.error("Error completing appointment:", error);
    return { success: false, error: "Erreur lors de la clôture du rendez-vous" };
  }
}

export async function getUserAppointmentStats() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return {
      totalAppointments: 0,
      completedAppointments: 0,
    };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  });

  if (!user) {
    return {
      totalAppointments: 0,
      completedAppointments: 0,
    };
  }

  const [totalAppointments, completedAppointments] = await Promise.all([
    prisma.appointment.count({
      where: { userId: user.id },
    }),
    prisma.appointment.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    }),
  ]);

  return {
    totalAppointments,
    completedAppointments,
  };
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: { time: true },
  });

  return appointments.map((apt) => apt.time);
}

export async function getDoctorAppointments(doctorId: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        user: true,
      },
      orderBy: { date: "asc" },
    });
    return { success: true, appointments };
  } catch (error) {
    return { success: false, error: "Failed to fetch appointments" };
  }
}

export async function updateAppointmentStatus({ id, status }: { id: string; status: any }) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/appointments");
  return appointment;
}

export async function getAppointments() {
    return await prisma.appointment.findMany({
        include: {
            user: true,
            doctor: true
        }
    });
}

export async function getAppointment(id: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        doctor: true,
      },
    });
    return appointment;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return null;
  }
}
