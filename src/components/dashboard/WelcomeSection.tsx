import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { FadeIn } from "../ui/motion-wrapper";

export default async function WelcomeSection() {
  const user = await currentUser();

  return (
    <FadeIn>
      <div className="relative z-10 flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20 mb-12 overflow-hidden shadow-sm">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 animate-in zoom-in duration-500 delay-200">
            <div className="size-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">Prêt à vous aider</span>
          </div>
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">
              {new Date().getHours() < 12
                ? "Bonjour"
                : new Date().getHours() < 18
                ? "Bon après-midi"
                : "Bonsoir"}
              , {user?.firstName} 👋
            </h1>
            <p className="text-muted-foreground max-w-lg leading-relaxed">
              Votre assistant IA DentWise surveille votre santé bucco-dentaire. Que souhaitez-vous faire aujourd'hui ?
            </p>
          </div>
        </div>

        <div className="lg:flex hidden items-center justify-center size-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full relative group transition-transform duration-700 hover:scale-110">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
          <Image 
            src="/logo.png" 
            alt="DentWise" 
            width={64} 
            height={64} 
            className="w-16 h-16 relative z-10 drop-shadow-2xl animate-in slide-in-from-right-8 duration-1000" 
          />
        </div>
      </div>
    </FadeIn>
  );
}
