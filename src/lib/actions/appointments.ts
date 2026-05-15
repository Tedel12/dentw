"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { AppointmentType, AppointmentStatus } from "@prisma/client";

import { createNotification } from "./notifications";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
      doctor: {
        include: {
          user: true
        }
      },
    },
  });

  // Notification pour le Docteur
  await createNotification({
    userId: appointment.doctor!.userId,
    type: "APPOINTMENT_CONFIRMED",
    title: "Nouveau Rendez-vous",
    content: `Vous avez un nouveau rendez-vous avec ${user.firstName} ${user.lastName} le ${format(new Date(data.date), "dd MMMM yyyy", { locale: fr })} à ${data.time}.`,
    link: "/appointments",
  });

  // Notification pour le Patient
  await createNotification({
    userId: user.id,
    type: "APPOINTMENT_CONFIRMED",
    title: "Rendez-vous Confirmé",
    content: `Votre rendez-vous avec Dr. ${appointment.doctor!.name} est confirmé pour le ${format(new Date(data.date), "dd MMMM yyyy", { locale: fr })} à ${data.time}.`,
    link: "/appointments",
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  return {
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
    type: appointment.type,
    doctorName: appointment.doctor!.name,
    patientEmail: user.email,
  };
}

export async function requestReschedule(data: {
  appointmentId: string;
  newDate: string;
  newTime: string;
  reason: string;
  proposedBy: "PATIENT" | "DOCTOR";
}) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: {
        status: "REQUESTED_RESCHEDULE",
        proposedDate: new Date(data.newDate),
        proposedTime: data.newTime,
        rescheduleReason: data.reason,
        proposedBy: data.proposedBy,
      },
      include: {
        user: true,
        doctor: true,
      },
    });

    const recipientId = data.proposedBy === "DOCTOR" ? appointment.userId : appointment.doctor!.userId;
    const senderName = data.proposedBy === "DOCTOR" ? `Dr. ${appointment.doctor!.name}` : `${appointment.user.firstName} ${appointment.user.lastName}`;

    await createNotification({
      userId: recipientId,
      type: "RESCHEDULE_REQUEST",
      title: "Demande de report",
      content: `${senderName} souhaite reporter votre rendez-vous au ${format(new Date(data.newDate), "dd MMMM", { locale: fr })} à ${data.newTime}. Motif : ${data.reason}`,
      link: "/appointments",
    });

    revalidatePath("/appointments");
    return { success: true };
  } catch (error) {
    console.error("Reschedule request error:", error);
    return { success: false, error: "Erreur lors de la demande de report" };
  }
}

export async function respondToReschedule(appointmentId: string, accept: boolean) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, user: true },
    });

    if (!appointment) throw new Error("Rendez-vous non trouvé");

    if (accept) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CONFIRMED",
          date: appointment.proposedDate!,
          time: appointment.proposedTime!,
          proposedDate: null,
          proposedTime: null,
          proposedBy: null,
          rescheduleReason: null,
        },
      });

      const recipientId = appointment.proposedBy === "DOCTOR" ? appointment.doctor!.userId : appointment.userId;
      await createNotification({
        userId: recipientId,
        type: "RESCHEDULE_RESPONSE",
        title: "Report Accepté",
        content: `La demande de report pour votre rendez-vous du ${format(appointment.proposedDate!, "dd MMMM", { locale: fr })} à ${appointment.proposedTime} a été acceptée.`,
        link: "/appointments",
      });
    } else {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CONFIRMED",
          proposedDate: null,
          proposedTime: null,
          proposedBy: null,
          rescheduleReason: null,
        },
      });

      const recipientId = appointment.proposedBy === "DOCTOR" ? appointment.doctor!.userId : appointment.userId;
      await createNotification({
        userId: recipientId,
        type: "RESCHEDULE_RESPONSE",
        title: "Report Refusé",
        content: `La demande de report pour votre rendez-vous a été refusée. L'horaire initial est maintenu.`,
        link: "/appointments",
      });
    }

    revalidatePath("/appointments");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la réponse au report" };
  }
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
      status: { in: ["CONFIRMED", "COMPLETED", "REQUESTED_RESCHEDULE"] } 
    },
    include: {
      doctor: true,
    },
    orderBy: { date: "asc" },
  });

  return appointments.map((apt) => ({
    id: apt.id,
    date: apt.date,
    time: apt.time,
    reason: apt.reason,
    doctorName: apt.doctor?.name || "Médecin",
    doctorImageUrl: apt.doctor?.imageUrl || "/logo.png",
    status: apt.status,
    type: apt.type,
    proposedDate: apt.proposedDate,
    proposedTime: apt.proposedTime,
    proposedBy: apt.proposedBy,
    rescheduleReason: apt.rescheduleReason,
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
      where: { 
        doctorId,
        status: { in: ["CONFIRMED", "COMPLETED", "REQUESTED_RESCHEDULE"] }
      },
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
