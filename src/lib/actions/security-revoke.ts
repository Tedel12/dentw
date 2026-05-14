"use server";

import { prisma } from "@/lib/prisma";

export async function revokeAllAccess(userId: string) {
  try {
    await prisma.healthAccessRequest.deleteMany({
      where: { userId, status: "APPROVED" },
    });
    return { success: true };
  } catch (error) {
    console.error("Revocation failed:", error);
    return { success: false };
  }
}
