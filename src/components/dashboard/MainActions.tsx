"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { MessageSquareIcon, CalendarIcon, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function MainActions({ role }: { role: string }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12"
    >
      {/* AI Voice Assistant */}
      <motion.div variants={item}>
        <Card className="h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 shadow-sm bg-background rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="relative p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Image src="/audio.png" alt="Voice AI" width={32} height={32} className="w-8 md:w-10" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black mb-1">Assistant vocal IA</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Conseils dentaires par appels vocaux</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span className="text-xs md:text-sm font-medium">Disponible 24h/24 et 7j/7</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span className="text-xs md:text-sm font-medium">Conseils pour soulager la douleur</span>
              </div>
            </div>

            <Link
              href="/voice"
              className={buttonVariants({
                variant: "default",
                className:
                  "w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-5 md:py-6 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all duration-300 group-hover:-translate-y-1 text-sm",
              })}
            >
              <MessageSquareIcon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Démarrer un appel
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Record */}
      <motion.div variants={item}>
        <Card className="h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 border-primary/40 bg-primary/5 shadow-md shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="relative p-8 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-lg shadow-primary/20">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-1 text-primary">Carnet de Santé</h3>
                <p className="text-sm text-primary/70">{role === 'DOCTOR' ? 'Accès dossier patient' : 'Gérez vos antécédents'}</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span className="text-sm font-bold">{role === 'DOCTOR' ? 'Consultation sécurisée' : 'Profil médical sécurisé'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                <span className="text-sm font-bold">Historique des traitements</span>
              </div>
            </div>

            <Link href={role === 'DOCTOR' ? '/appointments' : '/dashboard/health'} className="w-full mt-6">
              <Button
                className="w-full bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white font-black py-6 rounded-2xl transition-all duration-500 group-hover:-translate-y-1 shadow-sm"
              >
                <Stethoscope className="mr-2 h-5 w-5" />
                {role === 'DOCTOR' ? 'Accéder aux RDV' : 'Accéder au carnet'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Book Appointment (Caché pour le docteur) */}
      {role !== 'DOCTOR' && (
        <motion.div variants={item}>
            <Card className="h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 shadow-sm bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="relative p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Image src="/calendar.png" alt="Calendar" width={32} height={32} className="w-10" />
                </div>
                <div>
                    <h3 className="text-xl font-black mb-1">Prendre rendez-vous</h3>
                    <p className="text-sm text-muted-foreground">Planifiez avec des dentistes vérifiés</p>
                </div>
                </div>

                <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="text-sm font-medium">Professionnels dentaires vérifiés</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                    <span className="text-sm font-medium">Confirmations instantanées</span>
                </div>
                </div>

                <Link href="/appointments" className="w-full mt-6">
                <Button
                    variant="outline"
                    className="w-full border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 font-bold py-6 rounded-2xl transition-all duration-500 group-hover:-translate-y-1 shadow-sm"
                >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Planifier maintenant
                </Button>
                </Link>
            </CardContent>
            </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
