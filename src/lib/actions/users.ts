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
  practiceAddress: string;
  professionalCardUrl?: string;
  cipCardUrl?: string;
  signedContractUrl?: string;
  imageUrl?: string;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false, error: "Unauthorized" };

  try {
    const speciality = data.speciality?.trim();
    const bio = data.bio?.trim();
    const phone = data.phone?.trim();
    const licenseNumber = data.licenseNumber?.trim();
    const practiceAddress = data.practiceAddress?.trim();

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
    if (!practiceAddress || practiceAddress.length < 5) {
      return { success: false, error: "L'adresse du cabinet est requise" };
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
        practiceAddress,
        workplaceType: data.workplaceType,
        gender: data.gender,
        clerkId: clerkUser.id,
        professionalCardUrl: data.professionalCardUrl,
        cipCardUrl: data.cipCardUrl,
        signedContractUrl: data.signedContractUrl,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
        verificationStatus: "PENDING",
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
        practiceAddress,
        workplaceType: data.workplaceType,
        imageUrl: data.imageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`,
        gender: data.gender,
        professionalCardUrl: data.professionalCardUrl,
        cipCardUrl: data.cipCardUrl,
        signedContractUrl: data.signedContractUrl,
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

export async function getProfileCompletion() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { doctorProfile: true }
    });

    if (!user) return null;

    let completion = 0;
    let steps: { label: string; completed: boolean; link: string }[] = [];

    if (user.role === "PATIENT") {
      const patientSteps = [
        { label: "Groupe Sanguin", field: user.bloodGroup, link: "/dashboard/health" },
        { label: "Allergies et Maladies", field: user.allergies || user.chronicDiseases, link: "/dashboard/health" },
        { label: "Paramètres Biométriques (Poids/Âge)", field: user.weight != null && user.age != null, link: "/dashboard/health" },
        { label: "Code PIN de Sécurité", field: user.exportPin, link: "/dashboard/health" },
      ];
      
      const completedCount = patientSteps.filter(s => !!s.field).length;
      completion = Math.round((completedCount / patientSteps.length) * 100);
      steps = patientSteps.map(s => ({ label: s.label, completed: !!s.field, link: s.link }));

    } else if (user.role === "DOCTOR" && user.doctorProfile) {
      const doc = user.doctorProfile;
      const doctorSteps = [
        { label: "Localisation du Cabinet", field: doc.practiceAddress, link: "/appointments" },
        { label: "Présentation / Biographie", field: doc.bio, link: "/appointments" },
        { label: "Configuration des Horaires", field: doc.availableDays, link: "/appointments" },
        { label: "Contact Professionnel", field: doc.phone, link: "/appointments" },
      ];

      const completedCount = doctorSteps.filter(s => !!s.field).length;
      completion = Math.round((completedCount / doctorSteps.length) * 100);
      steps = doctorSteps.map(s => ({ label: s.label, completed: !!s.field, link: s.link }));
    }

    return { completion, steps, role: user.role };
  } catch (error) {
    console.error("Completion error:", error);
    return null;
  }
}
