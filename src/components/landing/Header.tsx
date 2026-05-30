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
import { SignedOut, SignUpButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-3 md:px-6 py-2 border-b border-border/50 bg-background/30 backdrop-blur-md h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full gap-2">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt={`Logo ${APP_NAME}`} width={28} height={28} className="w-8 md:w-11" />
          <span className="font-bold text-base md:text-lg tracking-tight truncate max-w-[120px] sm:max-w-none">{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            Comment ça marche ?
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Tarification
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            À propos
          </a>
          <Link href="/about-project" className="text-primary font-bold hover:text-primary/80 transition-colors">
            Le Projet
          </Link>
        </div>

        <LandingHeaderAuth className="hidden md:flex items-center gap-3 cursor-pointer" />

        <div className="md:hidden flex items-center gap-2">
          <LandingHeaderAuth signInLabel="Connexion" className="flex items-center gap-2" />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-3">
                <SheetClose asChild>
                  <a
                    href="#how-it-works"
                    className="block rounded-xl p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Comment ça marche ?
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href="#pricing"
                    className="block rounded-xl p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    Tarification
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href="#about"
                    className="block rounded-xl p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    A propos
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/about-project"
                    className="block rounded-xl p-3 text-primary font-bold hover:bg-primary/10 transition-colors"
                  >
                    Le Projet
                  </Link>
                </SheetClose>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button className="w-full mt-2">S&apos;inscrire</Button>
                  </SignUpButton>
                </SignedOut>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Header;

