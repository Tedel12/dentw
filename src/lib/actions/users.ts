"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Gender } from "@prisma/client";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { doctorProfile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          role: "PATIENT",
        },
        include: { doctorProfile: true }
      });
    }

    return user;
  } catch (error) {
    console.error("Sync error:", error);
    return null;
  }
}

export async function getCurrentUserRole() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    });

    if (user) return user.role;

    // Ensure user exists once, then return role
    const synced = await syncUser();
    return synced?.role ?? null;
  } catch (error) {
    console.error("Role fetch error:", error);
    return null;
  }
}

export async function completeDoctorProfile(data: {
  speciality: string;
  bio: string;
  phone: string;
  gender: Gender;
  licenseNumber: string;
  workplaceType: string;
  imageUrl?: string;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false, error: "Unauthorized" };

  try {
    const speciality = data.speciality?.trim();
    const bio = data.bio?.trim();
    const phone = data.phone?.trim();
    const licenseNumber = data.licenseNumber?.trim();

    if (!speciality || speciality.length < 2) {
      return { success: false, error: "La specialite est requise" };
    }
    if (!phone || phone.length < 8) {
      return { success: false, error: "Le telephone professionnel est invalide" };
    }
    if (!bio || bio.length < 10) {
      return { success: false, error: "La biographie doit contenir au moins 10 caracteres" };
    }
    if (!licenseNumber || licenseNumber.length < 5) {
      return { success: false, error: "Un numero de licence valide est requis pour verification" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    });

    if (!user) return { success: false, error: "User not synced" };

    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        speciality,
        bio,
        phone,
        licenseNumber,
        workplaceType: data.workplaceType,
        gender: data.gender,
        clerkId: clerkUser.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
        verificationStatus: "PENDING", // Always reset to pending on update if someone tries to cheat
      },
      create: {
        userId: user.id,
        clerkId: clerkUser.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
        email: user.email,
        phone,
        speciality,
        bio,
        licenseNumber,
        workplaceType: data.workplaceType,
        imageUrl: data.imageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
        gender: data.gender,
        verificationStatus: "PENDING",
      }
    });

    // WE REMOVE THE AUTO-ROLE UPDATE HERE. 
    // The user stays "PATIENT" until the Admin verifies them.

    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/pro/patients");
    
    return { success: true, doctor };
  } catch (error) {
    console.error("Error completing doctor profile:", error);
    return { success: false, error: "Failed to create doctor profile" };
  }
}

export async function updateExportPin(pin: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false, error: "Unauthorized" };

  try {
    if (pin.length < 4) {
      return { success: false, error: "Le PIN doit contenir au moins 4 chiffres" };
    }

    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { exportPin: pin },
    });

    revalidatePath("/dashboard/health");
    return { success: true };
  } catch (error) {
    console.error("Error updating PIN:", error);
    return { success: false, error: "Failed to update PIN" };
  }
}

export async function checkUserExportPin(pin: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { exportPin: true },
    });

    if (!user?.exportPin) {
      return { success: false, error: "Aucun PIN configuré. Veuillez le configurer dans votre profil." };
    }

    if (user.exportPin !== pin) {
      return { success: false, error: "Code PIN incorrect" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error checking PIN:", error);
    return { success: false, error: "Verification failed" };
  }
}
