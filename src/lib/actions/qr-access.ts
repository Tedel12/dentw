"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { AccessStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function generateQRToken() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });
    if (!user) return { success: false, error: "User not found" };

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const qrToken = await prisma.qRToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return { success: true, token: qrToken.token, expiresAt };
  } catch (error) {
    console.error("Error generating QR token:", error);
    return { success: false, error: "Failed to generate token" };
  }
}

export async function validateQRToken(token: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return { success: false, error: "Unauthorized" };

    // Trouver le médecin
    const doctor = await prisma.doctor.findUnique({
      where: { userId: (await prisma.user.findUnique({ where: { clerkId: clerkUser.id } }))?.id },
    });
    if (!doctor) return { success: false, error: "Vous devez être médecin pour scanner ce code." };

    // Trouver le token
    const qrToken = await prisma.qRToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!qrToken) return { success: false, error: "Code QR invalide." };
    if (qrToken.expiresAt < new Date()) return { success: false, error: "Ce code QR a expiré." };

    // Créer ou mettre à jour l'accès (24h)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.healthAccessRequest.upsert({
      where: {
        userId_doctorId: {
          userId: qrToken.userId,
          doctorId: doctor.id,
        },
      },
      update: {
        status: AccessStatus.APPROVED,
        expiresAt,
      },
      create: {
        userId: qrToken.userId,
        doctorId: doctor.id,
        status: AccessStatus.APPROVED,
        expiresAt,
      },
    });

    // Supprimer le token utilisé
    await prisma.qRToken.delete({ where: { id: qrToken.id } });

    revalidatePath("/pro/patients");
    return { success: true, patientId: qrToken.userId };
  } catch (error) {
    console.error("Error validating QR token:", error);
    return { success: false, error: "Erreur lors de la validation du code." };
  }
}
