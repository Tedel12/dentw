import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { doctorName, date, reason, summary } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Créer un docteur "fantôme" pour les entrées manuelles si nécessaire 
    // ou stocker le nom directement dans un champ notes/summary amélioré.
    // Ici on va créer le RDV marqué comme COMPLETED
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        date: new Date(date),
        time: "00:00",
        status: "COMPLETED",
        type: "IN_PERSON",
        reason: reason,
        summary: `[Consultation Externe avec ${doctorName}] : ${summary || ""}`,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("API Manual Appointment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
