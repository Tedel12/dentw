import { APP_NAME } from "@/lib/brand";

export const metadata = { title: `Politique de Confidentialité — ${APP_NAME}` };

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-24 px-6 text-slate-300">
      <h1 className="text-4xl font-black italic text-white mb-8">Politique de Confidentialité & Responsabilités</h1>
      
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-white">1. Données de santé</h2>
        <p>Vos données sont chiffrées. {APP_NAME} agit comme un coffre-fort numérique dont vous êtes le seul détenteur de la clé (PIN).</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-white">2. Responsabilité Partagée</h2>
        <p>Notre responsabilité se limite à la mise à disposition d'outils de protection. Votre responsabilité est engagée concernant la sécurisation de votre terminal, la non-divulgation de votre PIN et le contrôle des accès que vous accordez aux praticiens.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3. Accès</h2>
        <p>Vous pouvez révoquer tout accès médecin depuis votre dashboard à tout moment.</p>
      </section>
    </div>
  );
}