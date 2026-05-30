import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { FadeIn } from "../ui/motion-wrapper";
import { APP_NAME } from "@/lib/brand";

interface WelcomeSectionProps {
  role?: string;
}

export default async function WelcomeSection({ role }: WelcomeSectionProps) {
  const user = await currentUser();

  return (
    <FadeIn>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-[2rem] md:rounded-3xl p-5 md:p-8 border border-primary/20 mb-6 md:mb-8 overflow-hidden shadow-sm text-center sm:text-left gap-4 md:gap-6">
        <div className="space-y-3 md:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 animate-in zoom-in duration-500 delay-200 mx-auto sm:mx-0">
            <div className="size-1.5 md:size-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-primary">Prêt à vous aider</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black mb-1 md:mb-2 tracking-tighter italic uppercase text-white leading-tight">
              {new Date().getHours() < 12
                ? "Bonjour"
                : new Date().getHours() < 18
                ? "Bon après-midi"
                : "Bonsoir"}
              ,<br className="sm:hidden" /> {role === 'DOCTOR' ? `Dr. ${user?.firstName}` : user?.firstName} 👋
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed text-[11px] md:text-base font-medium italic">
              {role === 'DOCTOR' 
                ? "Gérez vos consultations et accédez aux dossiers patients."
                : `Votre assistant ${APP_NAME} vous accompagne au quotidien.`}
            </p>
          </div>
        </div>

        <div className="sm:flex hidden items-center justify-center size-24 md:size-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full relative group transition-transform duration-700 hover:scale-110 shrink-0">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
          <Image 
            src="/logo.png" 
            alt={APP_NAME} 
            width={64} 
            height={64} 
            className="w-12 h-12 md:w-16 md:h-16 relative z-10 drop-shadow-2xl animate-in slide-in-from-right-8 duration-1000" 
          />
        </div>
      </div>
    </FadeIn>
  );
}
