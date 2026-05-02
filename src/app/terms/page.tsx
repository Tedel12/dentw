import Navbar from "@/components/Navbar";
import { ShieldCheck, Lock, Scale, Info } from "lucide-react";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground italic">Dernière mise à jour : 26 Mars 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h2 className="text-xl font-bold flex items-center gap-2 mt-0">
              <Info className="w-5 h-5 text-primary" /> 1. Objet du Service
            </h2>
            <p>
              Dentwise est une plateforme numérique visant à digitaliser le carnet de santé personnel au Bénin. 
              Le service permet aux patients de stocker, gérer et partager temporairement leurs données de santé avec des professionnels 
              de santé agréés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" /> 2. Protection des Données de Santé
            </h2>
            <p>
              Nous plaçons la confidentialité au cœur de notre technologie. Vos données de santé sont :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Anonymisées par défaut :</strong> L'utilisation d'un pseudo est encouragée pour limiter l'identification directe.</li>
              <li><strong>Souveraineté :</strong> Vous restez l'unique propriétaire de vos données. Aucun médecin ne peut accéder à votre carnet sans votre consentement explicite via le système d'invitation.</li>
              <li><strong>Révocation automatique :</strong> Tout accès accordé à un médecin est temporaire (24h maximum) et révoqué immédiatement après la soumission d'une ordonnance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" /> 3. Sécurité et Responsabilité de l'Utilisateur
            </h2>
            <p>
              Bien que nous utilisions des protocoles de sécurité avancés (chiffrement, sessions sécurisées), la protection de vos données est une responsabilité partagée :
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-4">
              <p className="text-sm text-amber-800 font-medium">L'utilisateur s'engage à :</p>
              <ul className="text-sm text-amber-800 list-disc pl-5 mt-2">
                <li>Maintenir la confidentialité de ses identifiants de connexion (Clerk).</li>
                <li>Utiliser un code PIN robuste pour la fonction d'exportation PDF.</li>
                <li>Ne pas partager son accès avec des tiers non autorisés.</li>
                <li>Vérifier l'identité du professionnel de santé avant d'accepter une demande d'accès.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" /> 4. Législation et Conformité (Bénin)
            </h2>
            <p>
              Ce service est conçu en conformité avec les directives de la <strong>Loi n° 2017-20 portant Code du numérique en République du Bénin</strong> 
              et les standards internationaux de protection des données de santé.
            </p>
            <div className="p-4 border rounded-lg bg-muted/50 mt-4">
              <h3 className="text-sm font-bold mb-2">Référence Juridique Étudiée :</h3>
              <a 
                href="#" 
                className="text-primary hover:underline flex items-center gap-2 text-sm"
              >
                Accéder à l'Article sur la Réglementation du Secteur de la Santé au Bénin (Lien à insérer)
              </a>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Cette étude garantit que la digitalisation du carnet de santé respecte le secret médical et les droits du patient.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">5. Limitation de Responsabilité</h2>
            <p>
              Dentwise est un outil d'aide à la gestion de la santé. Il ne remplace en aucun cas l'avis médical 
              direct d'un professionnel. En cas d'urgence, l'utilisateur doit se rendre dans le centre de santé le plus proche.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Dentwise. Tous droits réservés.</p>
        </div>
      </div>
    </>
  );
}
