import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import resend from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      price,
      mode,
      roomId
    } = body;

    // Vérification des champs obligatoires
    if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Certains champs obligatoires sont manquants" },
        { status: 400 }
      );
    }

    // Envoi de l'email
    const { data, error } = await resend.emails.send({
      from: "DentWise <no-reply@resend.dev>",
      to: [userEmail],
      subject: "Confirmation de rendez-vous - DentWise",
      react: AppointmentConfirmationEmail({
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
        price,
        mode,
        roomId
      }),
    });

    if (error) {
      console.error("Erreur Resend :", error);
      return NextResponse.json(
        { error: "Échec de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email envoyé avec succès", emailId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
