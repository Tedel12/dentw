"use client";

import { APP_NAME } from "@/lib/brand";
import { HeartPulse, Mail, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt={APP_NAME} width={40} height={40} className="w-12" />
                <span className="font-black italic text-xl tracking-tighter text-white">BENIN SANTÉ</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                La première plateforme de santé connectée au Bénin, alliant intelligence artificielle et suivi médical humain pour une prise en charge d'excellence.
            </p>
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer group">
                    <HeartPulse className="size-5 text-slate-500 group-hover:text-primary transition-colors" />
                </div>
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer group">
                    <ShieldCheck className="size-5 text-slate-500 group-hover:text-primary transition-colors" />
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Services</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="hover:text-primary transition-colors cursor-pointer">Carnet de Santé Digital</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Prise de Rendez-vous</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Assistant IA Médical</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Espace Praticien</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Légal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Conditions d'Utilisation</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer">Protection des Données</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Mentions Légales</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Code de Déontologie</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Contact</h4>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-primary shrink-0" />
                    <p className="text-sm font-bold text-slate-500">Cotonou, République du Bénin</p>
                </div>
                <div className="flex items-start gap-3">
                    <Mail className="size-5 text-primary shrink-0" />
                    <p className="text-sm font-bold text-slate-500">contact@beninsante.bj</p>
                </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                &copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés. Propulsé par l'IA au service de la vie.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
