'use client';

import React from 'react';
import { Shield, Lock, Eye, UserCheck, Clock, FileText, AlertTriangle, Award } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "29 mai 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-orange-100">
              <Shield className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comment Bénin Santé protège vos données de santé dans le respect total de la législation béninoise
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Dernière mise à jour : {lastUpdated}
          </p>
        </div>

        <div className="prose prose-lg max-w-none bg-white rounded-3xl shadow-sm p-10 md:p-16 border">
          <div className="mb-12">
            <p className="text-gray-700 leading-relaxed">
              Chez <strong>Bénin Santé</strong>, nous considérons que vos données de santé sont sacrées.
              Nous nous engageons à les protéger avec le plus haut niveau de sécurité et de transparence,
              en pleine conformité avec la <strong>Loi n° 2017-20 portant Code du numérique en République du Bénin</strong>
              et la <strong>Loi n° 2009-09 relative à la protection des données à caractère personnel</strong>.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">1. Informations que nous collectons</h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">1.1 Données personnelles et de santé</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Informations d’identification (nom, prénom, date de naissance, sexe, contact)</li>
                  <li>Données médicales : antécédents, allergies, groupe sanguin, ordonnances, résultats d’analyses, traitements en cours</li>
                  <li>Informations sur les rendez-vous et historique de consultations</li>
                  <li>Données techniques : logs d’utilisation, adresse IP (anonymisée), type d’appareil</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">1.2 Données collectées en mode offline</h3>
                <p className="text-gray-700">
                  Lorsque vous utilisez le carnet de santé en mode hors-ligne, toutes les données sont stockées localement
                  sur votre appareil via <strong>IndexedDB</strong> et chiffrées avec l’algorithme <strong>AES-GCM 256 bits</strong>
                  via l’API Web Crypto du navigateur.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">2. Comment nous utilisons vos données</h2>
            </div>
            <ul className="space-y-4 text-gray-700">
              <li className="flex gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                Permettre la prise de rendez-vous et la gestion de votre carnet de santé numérique
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                Envoyer des rappels (rendez-vous, prise de médicaments)
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                Permettre aux praticiens autorisés d’accéder temporairement à votre dossier avec votre consentement explicite
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                Améliorer l’expérience utilisateur et la sécurité de la plateforme
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <UserCheck className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">3. Partage des données</h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl">
              <p className="font-medium mb-4">Nous ne vendons, ne louons ni ne commercialisons vos données de santé à des tiers.</p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Partage avec les praticiens :</h4>
                  <p className="text-gray-700">
                    L’accès au carnet de santé par un médecin est strictement conditionné par un <strong>consentement explicite</strong> de votre part
                    (via génération d’un QR code temporaire). L’accès est révoqué automatiquement après la consultation ou à expiration du token.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Prestataires techniques :</h4>
                  <p className="text-gray-700">
                    Nous travaillons avec des sous-traitants de confiance (Clerk, Neon, Vercel, Resend) soumis à des accords de protection des données
                    stricts et conformes au RGPD et à la législation béninoise.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - Sécurité */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">4. Mesures de sécurité</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-2xl p-8 hover:border-orange-200 transition-colors">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="text-emerald-600" /> Chiffrement
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>• Chiffrement en transit : HTTPS + TLS 1.3 + HSTS</li>
                  <li>• Chiffrement des données offline : AES-GCM 256 bits</li>
                  <li>• Stockage serveur : chiffré au repos sur Neon PostgreSQL</li>
                </ul>
              </div>

              <div className="border rounded-2xl p-8 hover:border-orange-200 transition-colors">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Award className="text-emerald-600" /> Authentification
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>• Authentification multi-facteurs (MFA) via Clerk</li>
                  <li>• Tokens JWT sécurisés</li>
                  <li>• Sessions à durée limitée</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 - Vos droits */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <UserCheck className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">5. Vos droits (conformément à la loi béninoise)</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: "Droit d’accès", desc: "Consulter toutes les données que nous détenons sur vous" },
                { title: "Droit de rectification", desc: "Corriger les informations inexactes" },
                { title: "Droit à l’effacement (« droit à l’oubli »)", desc: "Demander la suppression définitive de vos données" },
                { title: "Droit d’opposition", desc: "Vous opposer à certains traitements" },
                { title: "Droit à la portabilité", desc: "Recevoir vos données dans un format lisible (PDF)" },
                { title: "Droit de retrait du consentement", desc: "Révoquer à tout moment l’accès accordé à un praticien" },
              ].map((right, i) => (
                <div key={i} className="border-l-4 border-orange-500 pl-6 py-1">
                  <h4 className="font-semibold text-lg">{right.title}</h4>
                  <p className="text-gray-600 mt-1">{right.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-gray-500 italic">
              Pour exercer ces droits, contactez-nous à <span className="font-medium text-orange-600">privacy@beninsante.bj</span>
            </p>
          </section>

          {/* Section 6 - Responsabilités */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">6. Responsabilités partagées</h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-10 space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-700">Notre responsabilité :</h3>
                <p className="text-gray-700">
                  Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données.
                  Bénin Santé agit comme un <strong>coffre-fort numérique</strong> dont vous êtes le seul détenteur de la clé.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-700">Votre responsabilité :</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Sécuriser votre appareil et votre code PIN/PIN biométrique</li>
                  <li>Ne pas partager vos identifiants de connexion</li>
                  <li>Être vigilant lors du partage temporaire de votre carnet avec un praticien</li>
                  <li>Nous informer rapidement en cas de soupçon de compromission de votre compte</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 - Mode Offline */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">7. Mode Offline-first</h2>
            </div>
            <p className="text-gray-700">
              Les données stockées localement sur votre appareil restent sous votre contrôle exclusif. Elles sont chiffrées et ne sont jamais transmises
              sans votre consentement ni sans une connexion sécurisée. La synchronisation ne s’effectue que lorsque vous êtes connecté à internet.
            </p>
          </section>

          {/* Section 8 - Modifications */}
          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">8. Modifications de la Politique</h2>
            <p className="text-gray-700">
              Nous pouvons mettre à jour cette politique. Toute modification importante sera notifiée via l’application et par email.
              Nous vous encourageons à consulter régulièrement cette page.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t pt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">Nous contacter</h2>
            </div>
            <p className="text-gray-700">
              Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous pouvez nous contacter à :
            </p>
            <div className="mt-6 p-8 bg-gray-50 rounded-2xl">
              <p className="font-medium">✉️ privacy@beninsante.bj</p>
              <p className="text-sm text-gray-500 mt-4">
                Conformément à la réglementation, nous répondons à toute demande dans un délai maximum d’un (1) mois.
              </p>
            </div>
          </section>
        </div>

        <div className="text-center text-xs text-gray-400 mt-12">
          Bénin Santé – Plateforme de santé numérique béninoise • Respect de la vie privée par design
        </div>
      </div>
    </div>
  );
}