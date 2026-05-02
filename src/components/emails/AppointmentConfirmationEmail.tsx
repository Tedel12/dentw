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

interface AppointmentConfirmationEmailProps {
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  duration: string;
  price: string;
}

function AppointmentConfirmationEmail({
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentType,
  duration,
  price,
}: AppointmentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre rendez-vous dentaire a été confirmé</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://i.ibb.co.com/tRy6cC2/logo.png"
              width="50"
              height="50"
              alt="DentWise"
              style={logo}
            />
            <Text style={logoText}>DentWise</Text>
          </Section>

          <Heading style={h1}>Rendez-vous confirmé ! </Heading>

          <Text style={text}>Bonjour,</Text>

          <Text style={text}>
            Votre rendez-vous dentaire a été réservé avec succès. Voici les détails :
          </Text>

          <Section style={appointmentDetails}>
            <Text style={detailLabel}>Médecin</Text>
            <Text style={detailValue}>{doctorName}</Text>

            <Text style={detailLabel}>Type de rendez-vous</Text>
            <Text style={detailValue}>{appointmentType}</Text>

            <Text style={detailLabel}>Date</Text>
            <Text style={detailValue}>{appointmentDate}</Text>

            <Text style={detailLabel}>Heure</Text>
            <Text style={detailValue}>{appointmentTime}</Text>

            <Text style={detailLabel}>Durée</Text>
            <Text style={detailValue}>{duration}</Text>

            <Text style={detailLabel}>Coût</Text>
            <Text style={detailValue}>{price}</Text>

            <Text style={detailLabel}>Lieu</Text>
            <Text style={detailValue}>Centre Dentaire</Text>
          </Section>

          <Text style={text}>
            Merci d’arriver 15 minutes avant votre rendez-vous. Si vous devez reporter ou annuler, veuillez nous contacter au moins 24 heures à l’avance.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={process.env.NEXT_PUBLIC_APP_URL + "/appointments"}>
              Voir mes rendez-vous
            </Link>
          </Section>

          <Text style={footer}>
            Cordialement,
            <br />
            L’équipe DentWise
          </Text>

          <Text style={footerText}>
            Pour toute question, veuillez nous contacter à support@dentwise.com
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
  color: "#2563eb",
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#2563eb",
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
