import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { APP_NAME, APP_SUPPORT_EMAIL } from "@/lib/brand";

interface AppointmentConfirmationEmailProps {
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: string;
  price: string;
  mode?: "IN_PERSON" | "ONLINE";
  roomId?: string;
}

function AppointmentConfirmationEmail({
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  duration,
  price,
  mode = "IN_PERSON",
  roomId,
}: AppointmentConfirmationEmailProps) {
  const isOnline = mode === "ONLINE";

  return (
    <Html>
      <Head />
      <Preview>Votre rendez-vous médical a été confirmé</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://i.ibb.co.com/tRy6cC2/logo.png"
              width="50"
              height="50"
              alt={APP_NAME}
              style={logo}
            />
            <Text style={logoText}>{APP_NAME}</Text>
          </Section>

          <Heading style={h1}>Rendez-vous confirmé ! </Heading>

          <Text style={text}>Bonjour,</Text>

          <Text style={text}>
            Votre rendez-vous médical a été réservé avec succès. Voici les détails :
          </Text>

          <Section style={appointmentDetails}>
            <Text style={detailLabel}>Médecin</Text>
            <Text style={detailValue}>{doctorName}</Text>

            <Text style={detailLabel}>Type de rendez-vous</Text>
            <Text style={detailValue}>{appointmentType}</Text>

            <Text style={detailLabel}>Mode de consultation</Text>
            <Text style={isOnline ? onlineValue : detailValue}>
                {isOnline ? "📹 Téléconsultation (Vidéo)" : "📍 En Cabinet (Présentiel)"}
            </Text>

            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{appointmentDate}</Text>

            <Text style={detailLabel}>Heure</Text>
            <Text style={detailValue}>{appointmentTime}</Text>

            <Text style={detailLabel}>Durée</Text>
            <Text style={detailValue}>{duration}</Text>

            <Text style={detailLabel}>Coût</Text>
            <Text style={detailValue}>{price}</Text>

            <Text style={detailLabel}>Lieu</Text>
            <Text style={detailValue}>
                {isOnline ? `Salle virtuelle ${APP_NAME}` : "Centre de soins"}
            </Text>
          </Section>

          {isOnline ? (
            <Section style={alertBox}>
                <Text style={alertText}>
                    <strong>Note importante :</strong> Votre consultation se fera en ligne. Vous pourrez rejoindre la salle vidéo directement depuis votre tableau de bord 5 minutes avant l'heure prévue.
                </Text>
            </Section>
          ) : (
            <Text style={text}>
                Merci d’arriver 15 minutes avant votre rendez-vous au cabinet.
            </Text>
          )}

          <Section style={buttonContainer}>
            <Link style={button} href={process.env.NEXT_PUBLIC_APP_URL + (isOnline && roomId ? `/appointments/room/${roomId}` : "/appointments")}>
              {isOnline ? "Rejoindre la salle vidéo" : "Voir mes rendez-vous"}
            </Link>
          </Section>

          <Text style={footer}>
            Cordialement,
            <br />
            L’équipe {APP_NAME}
          </Text>

          <Text style={footerText}>
            Pour toute question, veuillez nous contacter à {APP_SUPPORT_EMAIL}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AppointmentConfirmationEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  borderRadius: "8px",
  display: "inline",
  verticalAlign: "middle",
};

const logoText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#e78a53",
  margin: "0",
  display: "inline",
  marginLeft: "12px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const appointmentDetails = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "8px 0 4px 0",
};

const detailValue = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const onlineValue = {
    color: "#2563eb",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 16px 0",
};

const alertBox = {
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
};

const alertText = {
    color: "#1d4ed8",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#e78a53",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "32px 0 16px 0",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0 0 0",
  textAlign: "center" as const,
};
