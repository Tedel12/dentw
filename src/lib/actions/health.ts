"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AccessStatus, BloodGroup } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

async function getAuthenticatedDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { doctorProfile: true },
  });
  return user;
}

export async function updateHealthProfile(userId: string, data: {
  pseudo?: string;
  age?: number;
  weight?: number | null;
  bloodGroup?: BloodGroup;
  allergies?: string;
  electrophoresis?: string;
  chronicDiseases?: string;
  vaccines?: string;
}) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser || authUser.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    revalidatePath("/dashboard/health");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating health profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/** Ajout par le patient sur son propre carnet (pas de révocation d’accès praticien). */
export async function addTreatment(
  userId: string,
  data: {
    name: string;
    dosage: string;
    frequency: string;
    time: string;
    duration?: number;
    pathology?: string;
    administrationRoute?: string;
    notes?: string;
    prescriptionUrl?: string;
  },
) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser || authUser.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    const treatment = await prisma.treatment.create({
      data: {
        ...data,
        pathology: data.pathology?.trim() || undefined,
        administrationRoute: data.administrationRoute?.trim() || undefined,
        userId,
      },
    });

    revalidatePath("/dashboard/health");
    revalidatePath("/pro/patients");
    return { success: true, treatment };
  } catch (error) {
    console.error("Error adding treatment:", error);
    return { success: false, error: "Failed to add treatment" };
  }
}

export type TreatmentLineInput = {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  duration?: number;
  pathology: string;
  administrationRoute: string;
  notes?: string;
  prescriptionUrl?: string;
};

/**
 * Ordonnance multi-lignes (1 à 5) : création en une transaction, puis révocation unique de l’accès praticien.
 */
export async function addTreatmentsBatch(
  userId: string,
  doctorId: string,
  items: TreatmentLineInput[],
) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser) {
      return { success: false, error: "Unauthorized" };
    }
    if (authUser.role !== "DOCTOR" || authUser.doctorProfile?.id !== doctorId) {
      return { success: false, error: "Doctor access required" };
    }
    const hasAccess = await checkDoctorAccess(userId, doctorId);
    if (!hasAccess) {
      return { success: false, error: "Access denied or expired" };
    }

    const cleaned = items.filter((row) => row.name.trim().length >= 2);
    if (cleaned.length === 0) {
      return { success: false, error: "Au moins une ligne de médicament est requise" };
    }
    if (cleaned.length > 5) {
      return { success: false, error: "Maximum 5 lignes par ordonnance" };
    }

    for (const row of cleaned) {
      if (!row.dosage?.trim() || !row.frequency?.trim() || !row.time?.trim()) {
        return { success: false, error: "Chaque ligne doit avoir posologie, fréquence et horaires" };
      }
      if (!row.pathology?.trim() || !row.administrationRoute?.trim()) {
        return { success: false, error: "Chaque ligne doit préciser la pathologie et la voie d'administration" };
      }
    }

    const treatments = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const data of cleaned) {
        const duration =
          data.duration != null && Number.isFinite(Number(data.duration))
            ? Math.floor(Number(data.duration))
            : undefined;
        const t = await tx.treatment.create({
          data: {
            name: data.name.trim(),
            dosage: data.dosage.trim(),
            frequency: data.frequency.trim(),
            time: data.time.trim(),
            duration,
            pathology: data.pathology.trim(),
            administrationRoute: data.administrationRoute.trim(),
            notes: data.notes?.trim() || undefined,
            prescriptionUrl: data.prescriptionUrl,
            prescribingDoctorId: doctorId,
            userId,
          },
        });
        created.push(t);
      }

      await tx.healthAccessRequest.updateMany({
        where: {
          userId,
          doctorId,
          status: AccessStatus.APPROVED,
        },
        data: {
          status: AccessStatus.EXPIRED,
        },
      });

      return created;
    });

    revalidatePath("/dashboard/health");
    revalidatePath("/pro/patients");
    return { success: true, treatments, count: treatments.length };
  } catch (error) {
    console.error("Error adding treatments batch:", error);
    return { success: false, error: "Failed to add prescriptions" };
  }
}

export async function searchPatient(query: string) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser || authUser.role !== "DOCTOR" || !authUser.doctorProfile) {
      return { success: false, error: "Unauthorized" };
    }

    const patients = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { pseudo: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        pseudo: true,
      },
    });
    return { success: true, patients };
  } catch (error) {
    return { success: false, error: "Search failed" };
  }
}

export async function getDoctorPatientById(patientId: string) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser || authUser.role !== "DOCTOR" || !authUser.doctorProfile) {
      return { success: false, error: "Unauthorized" };
    }

    const patient = await prisma.user.findFirst({
      where: { id: patientId, role: "PATIENT" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        pseudo: true,
      },
    });

    if (!patient) return { success: false, error: "Patient introuvable" };
    return { success: true, patient };
  } catch (error) {
    console.error("Error fetching patient by id:", error);
    return { success: false, error: "Failed to fetch patient" };
  }
}

export async function logTreatmentTake(treatmentId: string) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: { userId: true },
    });

    if (!treatment || treatment.userId !== authUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    const log = await prisma.treatmentLog.create({
      data: {
        treatmentId,
      },
    });
    revalidatePath("/dashboard/health");
    return { success: true, log };
  } catch (error) {
    console.error("Error logging treatment:", error);
    return { success: false, error: "Failed to log treatment" };
  }
}

import { createNotification } from "./notifications";
import { logSecurityEvent } from "./security";

// Doctor Access Actions
export async function requestHealthAccess(userId: string, doctorId: string) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser || authUser.role !== "DOCTOR" || authUser.doctorProfile?.id !== doctorId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if a request already exists
    const existingRequest = await prisma.healthAccessRequest.findFirst({
      where: {
        userId,
        doctorId,
      },
    });

    if (existingRequest) {
      if (existingRequest.status === AccessStatus.PENDING) {
        return { success: false, error: "Request already pending for this doctor." };
      } else if (existingRequest.status === AccessStatus.APPROVED) {
        if (existingRequest.expiresAt && existingRequest.expiresAt > new Date()) {
          return { success: false, error: "Access already granted and not expired." };
        } else {
          // If approved but expired, we can potentially update it or create a new one.
          // For now, let's treat it as if no active request exists and proceed to create/update.
          // Or, update the existing one to PENDING to avoid duplicates if business logic allows.
          await prisma.healthAccessRequest.update({
            where: { id: existingRequest.id },
            data: { status: AccessStatus.PENDING, expiresAt: null, createdAt: new Date() },
          });
          // No need to create a new one, we just updated the old one to PENDING
          // We can notify the patient again here if needed.
          return { success: true, request: existingRequest }; // Return the updated request
        }
      } else if (existingRequest.status === AccessStatus.REJECTED || existingRequest.status === AccessStatus.EXPIRED) {
         // If rejected or expired, we can simply update the existing one to PENDING.
         await prisma.healthAccessRequest.update({
            where: { id: existingRequest.id },
            data: { status: AccessStatus.PENDING, expiresAt: null, createdAt: new Date() },
          });
         // We can notify the patient again here if needed.
         return { success: true, request: existingRequest }; // Return the updated request
      }
    }

    const request = await prisma.healthAccessRequest.create({
      data: {
        userId,
        doctorId,
        status: AccessStatus.PENDING,
      },
      include: {
        doctor: true,
      }
    });

    // Notification pour le Patient
    await createNotification({
      userId,
      type: "HEALTH_ACCESS",
      title: "Demande d'accès médical",
      content: `Le Dr. ${request.doctor.name} souhaite accéder à votre carnet de santé pour une consultation.`,
      link: `/dashboard?requestId=${request.id}`,
    });

    revalidatePath("/pro"); // Assuming doctors search from here
    return { success: true, request };
  } catch (error) {
    console.error("Error requesting access:", error);
    return { success: false, error: "Failed to request access" };
  }
}

export async function respondToAccessRequest(requestId: string, status: "APPROVED" | "REJECTED") {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const existingRequest = await prisma.healthAccessRequest.findUnique({
      where: { id: requestId },
      include: { 
        user: true,
        doctor: true,
      },
    });

    if (!existingRequest || existingRequest.userId !== authUser.id) {
      return { success: false, error: "Unauthorized" };
    }

    const expiresAt = status === AccessStatus.APPROVED 
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      : null;

    const request = await prisma.healthAccessRequest.update({
      where: { id: requestId },
      data: {
        status,
        expiresAt,
      },
    });

    // Notification pour le Docteur
    await createNotification({
      userId: existingRequest.doctor.userId,
      type: "HEALTH_ACCESS",
      title: status === "APPROVED" ? "Accès Santé Approuvé" : "Accès Santé Refusé",
      content: status === "APPROVED" 
        ? `${existingRequest.user.firstName} ${existingRequest.user.lastName} a approuvé votre demande d'accès au carnet pour 24h.`
        : `${existingRequest.user.firstName} ${existingRequest.user.lastName} a refusé votre demande d'accès.`,
      link: status === "APPROVED" ? `/pro/patients?patientId=${existingRequest.userId}&openHealth=true` : "/pro/patients",
    });

    revalidatePath("/dashboard");
    revalidatePath("/pro/patients");
    return { success: true, request };
  } catch (error) {
    console.error("Error responding to access request:", error);
    return { success: false, error: "Failed to respond to request" };
  }
}

export async function getOwnHealthData() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        treatments: {
          orderBy: { createdAt: "desc" },
          include: {
            prescribingDoctor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        appointments: {
          where: { status: "COMPLETED" },
          orderBy: { date: "desc" },
          include: {
            doctor: true
          }
        }
      },
    });

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: "Failed to fetch health data" };
  }
}

export async function getPatientHealthData(patientId: string, doctorId: string) {
  try {
    const authUser = await getAuthenticatedDbUser();
    const hasAccess = await checkDoctorAccess(patientId, doctorId);
    if (!hasAccess || !authUser) {
      return { success: false, error: "Access denied" };
    }

    // Log this access for security audit
    await logSecurityEvent({
      userId: patientId,
      accessedBy: `${authUser.firstName} ${authUser.lastName} (Dr. ${authUser.doctorProfile?.name})`,
      action: "VIEW_HEALTH_DATA",
      targetId: patientId,
    });

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: {
        treatments: {
          orderBy: { createdAt: "desc" },
          include: {
            prescribingDoctor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        appointments: {
          where: { status: "COMPLETED" },
          orderBy: { date: "desc" },
          include: {
            doctor: true
          }
        }
      },
    });

    return { success: true, data: patient };
  } catch (error) {
    return { success: false, error: "Failed to fetch patient data" };
  }
}

export async function getHealthAccessRequest(userId: string, doctorId: string) {
  try {
    const authUser = await getAuthenticatedDbUser();
    if (!authUser || authUser.role !== "DOCTOR" || authUser.doctorProfile?.id !== doctorId) {
      return { success: false, error: "Unauthorized" };
    }

    const request = await prisma.healthAccessRequest.findFirst({
      where: {
        userId,
        doctorId,
      },
    });

    return { success: true, request };
  } catch (error) {
    console.error("Error fetching access request:", error);
    return { success: false, error: "Failed to fetch access request" };
  }
}

export async function checkDoctorAccess(userId: string, doctorId: string) {
  const authUser = await getAuthenticatedDbUser();
  if (!authUser || authUser.role !== "DOCTOR" || authUser.doctorProfile?.id !== doctorId) {
    return false;
  }

  const access = await prisma.healthAccessRequest.findFirst({
    where: {
      userId,
      doctorId,
      status: "APPROVED",
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  });
  return !!access;
}

export async function verifyExportPin(pin: string) {
  const authUser = await getAuthenticatedDbUser();
  if (!authUser) return { success: false, error: "Unauthorized" };

  const expectedPin = process.env.HEALTH_EXPORT_PIN;
  if (!expectedPin) {
    return { success: false, error: "Export PIN is not configured" };
  }

  if (pin !== expectedPin) {
    return { success: false, error: "Invalid PIN" };
  }

  return { success: true };
}
