"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";

export async function getNotifications() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false, error: "Non autorisé" };

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) return { success: false, error: "Utilisateur non trouvé" };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: "Erreur lors de la récupération des notifications" };
  }
}

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link,
      },
    });
    revalidatePath("/", "layout"); // Pour mettre à jour la cloche partout
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Erreur lors de la création de la notification" };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur" };
  }
}

export async function markAllAsRead() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { success: false };

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) return { success: false };

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
