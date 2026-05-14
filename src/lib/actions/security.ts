"use server";

import { prisma } from "@/lib/prisma";

export async function logSecurityEvent({
  userId,
  accessedBy,
  action,
  targetId,
}: {
  userId: string;
  accessedBy: string;
  action: string;
  targetId: string;
}) {
  try {
    await prisma.securityAuditLog.create({
      data: {
        userId,
        accessedBy,
        action,
        targetId,
      },
    });
  } catch (error) {
    console.error("Security Audit Log Failed:", error);
  }
}
