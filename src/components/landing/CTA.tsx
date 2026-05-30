import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MicIcon, CalendarIcon } from "lucide-react";

function CTA() {
  return (
    <section className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden bg-slate-900/20 border-y border-white/5">
      {/* Fond subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.03),transparent_70%)]"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenu gauche */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mx-auto lg:mx-0">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary">Prêt quand vous l’êtes</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-[1.1] text-white">
                VOTRE SANTÉ <br /> 
                <span className="text-primary drop-shadow-[0_0_15px_rgba(231,138,83,0.4)] uppercase">COMMENCE ICI</span>
              </h2>

              <p className="text-base md:text-xl text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium italic">
                Rejoignez les patients qui font confiance à notre IA pour des conseils instantanés et un suivi médical d'excellence.
              </p>
            </div>

            {/* Boutons CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="h-14 md:h-16 px-8 md:px-10 font-black italic bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all duration-300 rounded-[1.5rem] text-sm md:text-base w-full sm:w-auto"
              >
                <MicIcon className="mr-2 h-5 w-5" />
                DÉMARRER LE CHAT IA
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 md:h-16 px-8 md:px-10 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-[1.5rem] transition-all text-sm md:text-base w-full sm:w-auto"
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                PRENDRE RENDEZ-VOUS
              </Button>
            </div>
          </div>

          {/* Contenu droit - Image CTA */}
          <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="relative">
              {/* Badge flottant */}
              <div className="absolute -top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl z-30">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  Disponible 24/7
                </div>
              </div>

              {/* Image principale */}
              <div className="relative group">
                {/* Lueur subtile */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] md:blur-[100px] scale-110 opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>

                <Image
                  src="/cta.png"
                  alt="Assistant IA Benin Santé"
                  width={350}
                  height={350}
                  className="relative w-72 md:w-96 h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>

              {/* Éléments décoratifs */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default CTA;
