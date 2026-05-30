import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { LandingHeaderAuth } from "@/components/auth/LandingHeaderAuth";

const Header = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-3 md:px-6 py-2 border-b border-border/50 bg-background/30 backdrop-blur-md h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full gap-2">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt={`Logo ${APP_NAME}`} width={28} height={28} className="w-8 md:w-11" />
          <span className="font-bold text-base md:text-lg tracking-tight truncate max-w-[120px] sm:max-w-none">{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Comment ça marche ?
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Tarification
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            À propos
          </a>
          <Link href="/about-project" className="text-primary font-bold hover:text-primary/80 transition-colors text-sm">
            Le Projet
          </Link>
        </div>

        <LandingHeaderAuth className="hidden md:flex items-center gap-3 cursor-pointer" />

        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-xl" aria-label="Ouvrir le menu">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950 border-white/5 text-white">
              <SheetHeader className="text-left">
                <SheetTitle className="text-xl font-black italic text-primary uppercase tracking-tighter">Menu</SheetTitle>
              </SheetHeader>
              <div className="p-2 space-y-3 mt-8">
                <SheetClose asChild>
                  <a
                    href="#how-it-works"
                    className="block rounded-xl p-4 text-slate-300 font-bold uppercase tracking-tight text-sm hover:bg-white/5 transition-colors border border-white/5 bg-white/[0.02]"
                  >
                    Comment ça marche ?
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href="#pricing"
                    className="block rounded-xl p-4 text-slate-300 font-bold uppercase tracking-tight text-sm hover:bg-white/5 transition-colors border border-white/5 bg-white/[0.02]"
                  >
                    Tarification
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href="#about"
                    className="block rounded-xl p-4 text-slate-300 font-bold uppercase tracking-tight text-sm hover:bg-white/5 transition-colors border border-white/5 bg-white/[0.02]"
                  >
                    A propos
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/about-project"
                    className="block rounded-xl p-4 text-primary font-black italic uppercase tracking-tighter text-sm hover:bg-primary/10 transition-colors border border-primary/20 bg-primary/5"
                  >
                    Le Projet
                  </Link>
                </SheetClose>
                
                <div className="pt-6 border-t border-white/5 mt-4">
                    <LandingHeaderAuth 
                        signInLabel="Connexion" 
                        className="flex flex-col gap-3" 
                    />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Header;
