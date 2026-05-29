'use client';

import React from 'react';
import { Shield, Lock, Eye, UserCheck, Clock, FileText, AlertTriangle, Award, HeartPulse } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { APP_NAME } from '@/lib/brand';

export default function PrivacyPolicy() {
  const lastUpdated = "29 mai 2026";

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-24 px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 shadow-2xl shadow-primary/10 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Shield className="w-16 h-16 text-primary relative z-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">
            Politique de <span className="text-primary">Confidentialité</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium italic leading-relaxed">
            Comment {APP_NAME} protège vos données de santé dans le respect total de la législation béninoise.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Clock className="w-3 h-3" /> Dernière mise à jour : {lastUpdated}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-white/5 p-10 md:p-16 shadow-2xl space-y-16">
          <div className="bg-primary/5 border border-primary/10 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-32 bg-primary opacity-[0.03] rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
            <p className="text-slate-300 leading-relaxed font-medium relative z-10">
              Chez <strong className="text-white font-black italic">{APP_NAME}</strong>, nous considérons que vos données de santé sont sacrées.
              Nous nous engageons à les protéger avec le plus haut niveau de sécurité et de transparence,
              en pleine conformité avec la <strong className="text-primary">Loi n° 2017-20 portant Code du numérique en République du Bénin</strong>
              et la <strong className="text-primary">Loi n° 2009-09 relative à la protection des données à caractère personnel</strong>.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight uppercase">1. Informations collectées</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4">1.1 Données personnelles</h3>
                <ul className="space-y-3 text-sm text-slate-400 font-medium">
                  <li className="flex items-start gap-2 italic">
                    <span className="text-primary mt-1">•</span> 
                    Identification (nom, prénom, date de naissance, contact)
                  </li>
                  <li className="flex items-start gap-2 italic">
                    <span className="text-primary mt-1">•</span> 
                    Données médicales : antécédents, allergies, ordonnances
                  </li>
                  <li className="flex items-start gap-2 italic">
                    <span className="text-primary mt-1">•</span> 
                    Historique de consultations et rendez-vous
                  </li>
                  <li className="flex items-start gap-2 italic">
                    <span className="text-primary mt-1">•</span> 
                    Données techniques anonymisées
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest mb-4">1.2 Mode Offline</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                  En mode hors-ligne, les données sont stockées localement via <strong className="text-slate-200">IndexedDB</strong> et chiffrées en <strong className="text-slate-200">AES-GCM 256 bits</strong>. 
                  Vous gardez le contrôle total sur votre appareil.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight uppercase">2. Utilisation des données</h2>
            </div>
            <div className="grid gap-4">
                {[
                    "Gestion du carnet de santé numérique et prise de RDV",
                    "Envoi de rappels médicaux et notifications de sécurité",
                    "Accès temporaire pour les praticiens autorisés (24h)",
                    "Amélioration de l'IA médicale et de l'expérience utilisateur"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-colors">
                        <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <span className="text-emerald-400 text-[10px] font-black italic">OK</span>
                        </div>
                        <p className="text-slate-300 font-bold italic text-sm uppercase tracking-tight">{item}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight uppercase">3. Partage & Consentement</h2>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl space-y-6">
              <p className="font-black italic text-amber-500 uppercase tracking-tighter text-lg">Nous ne vendons jamais vos données.</p>
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                    L'accès par un médecin est <strong className="text-slate-200">uniquement</strong> possible via votre accord explicite (QR Code). 
                    Le token d'accès expire automatiquement après 24 heures pour garantir votre vie privée.
                </p>
                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/5">
                    <HeartPulse className="size-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Propulsé par Benin Santé – Protection par Design</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 - Sécurité */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight uppercase">4. Sécurité de niveau bancaire</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-primary/40 transition-all group">
                <h3 className="font-black italic text-lg mb-4 flex items-center gap-3 text-white uppercase tracking-tighter">
                  <Shield className="text-emerald-500 size-6" /> Chiffrement
                </h3>
                <ul className="space-y-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <li>• Transit : HTTPS + TLS 1.3</li>
                  <li>• Offline : AES-GCM 256 bits</li>
                  <li>• Serveur : Chiffrement au repos</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-primary/40 transition-all group">
                <h3 className="font-black italic text-lg mb-4 flex items-center gap-3 text-white uppercase tracking-tighter">
                  <Award className="text-emerald-500 size-6" /> Authentification
                </h3>
                <ul className="space-y-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <li>• MFA (Double Facteur) via Clerk</li>
                  <li>• Tokens JWT de courte durée</li>
                  <li>• Code PIN Biométrique en local</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 - Vos droits */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tight uppercase leading-tight">5. Vos droits (Loi Béninoise)</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: "Droit d’accès", desc: "Consulter toutes vos données détenues" },
                { title: "Droit de rectification", desc: "Corriger les informations inexactes" },
                { title: "Droit à l’effacement", desc: "Suppression définitive de vos données" },
                { title: "Droit à la portabilité", desc: "Recevoir vos données au format PDF" },
                { title: "Droit de retrait", desc: "Révoquer l'accès à un praticien" },
                { title: "Droit d'opposition", desc: "S'opposer à certains traitements" },
              ].map((right, i) => (
                <div key={i} className="border-l-4 border-primary pl-6 py-2 bg-white/[0.02] rounded-r-2xl">
                  <h4 className="font-black italic text-white uppercase tracking-tighter">{right.title}</h4>
                  <p className="text-slate-500 text-sm font-medium italic">{right.desc}</p>
                </div>
              ))}
            </div>

            <p className="p-4 bg-primary/5 rounded-2xl text-[11px] text-slate-400 text-center border border-primary/10 font-bold italic">
              Pour exercer ces droits, contactez notre délégué à la protection des données : <span className="text-primary underline">privacy@beninsante.bj</span>
            </p>
          </section>

          {/* Contact Final */}
          <section className="border-t border-white/5 pt-12 text-center space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Besoin d'aide ?</h2>
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 inline-block min-w-[300px] hover:border-primary/20 transition-all">
              <p className="text-slate-400 font-bold text-sm mb-2 uppercase">Service Juridique & Support</p>
              <p className="text-primary font-black italic text-xl">contact@beninsante.bj</p>
            </div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-8">
                {APP_NAME} – Plateforme de santé numérique béninoise • Respect de la vie privée par design
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
