"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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

export async function getAuditLogs() {
  const user = await currentUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!user || user.emailAddresses[0]?.emailAddress !== adminEmail) {
    throw new Error("Unauthorized");
  }

  try {
    const logs = await prisma.securityAuditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } }
      }
    });
    return { success: true, logs };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: "Failed to fetch logs" };
  }
}
