"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { CalendarIcon, HomeIcon, MenuIcon, Shield, Sparkles, HeartPulse, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUserRole } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PWAInstallPrompt } from "./ui/pwa-install-prompt";
import { NotificationBell } from "./NotificationBell";

function Navbar() {
  const { user: clerkUser, isLoaded } = useUser();
  const pathname = usePathname();
  const [role, setRole] = useState<"PATIENT" | "DOCTOR" | null>(null);

  useEffect(() => {
    async function resolveRole() {
      if (!clerkUser) {
        setRole(null);
        return;
      }

      const cacheKey = `beninsante-role-${clerkUser.id}`;
      const cachedRole = sessionStorage.getItem(cacheKey);
      if (cachedRole === "PATIENT" || cachedRole === "DOCTOR") {
        setRole(cachedRole);
      }

      const fetchedRole = await getCurrentUserRole();
      if (fetchedRole === "PATIENT" || fetchedRole === "DOCTOR") {
        setRole(fetchedRole);
        sessionStorage.setItem(cacheKey, fetchedRole);
      }
    }
    resolveRole();
  }, [clerkUser]);

  const linkClass = (href: string) =>
    `flex items-center gap-2 transition-colors ${
      pathname === href ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
    }`;

  if (!isLoaded) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 py-2 border-b border-border/50 bg-background/90 backdrop-blur-md h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-8 min-w-0">
          <Link href={clerkUser ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt={`Logo ${APP_NAME}`} width={28} height={28} className="w-8 md:w-11" />
            {!clerkUser && <span className="font-bold text-sm md:text-lg hidden xs:inline tracking-tight truncate">{APP_NAME}</span>}
          </Link>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {clerkUser ? (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  <HomeIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>

                <Link href="/about-project" className={linkClass("/about-project")}>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden lg:inline">A propos</span>
                </Link>

                {/* Role-based links */}
                {role === "PATIENT" && (
                  <>
                    <Link
                      href="/dashboard/health"
                      className={linkClass("/dashboard/health")}
                    >
                      <HeartPulse className="w-4 h-4" />
                      <span className="hidden lg:inline">Mon Carnet</span>
                    </Link>
                    <Link
                      href="/pro/patients"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors italic"
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden lg:inline text-xs font-bold uppercase tracking-widest">Professionnel ?</span>
                    </Link>
                  </>
                )}

                {role === "DOCTOR" && (
                  <Link href="/pro/patients" className={linkClass("/pro/patients")}>
                    <Users className="w-4 h-4" />
                    <span className="hidden lg:inline">Espace Praticien</span>
                  </Link>
                )}

                {/* Lien Admin conditionnel */}
                {clerkUser.emailAddresses.some(e => e.emailAddress.trim().toLowerCase() === "benagbannon@gmail.com") && (
                  <Link href="/admin" className={linkClass("/admin")}>
                    <Shield className="w-4 h-4" />
                    <span className="hidden lg:inline">Administration</span>
                  </Link>
                )}

                <Link href="/appointments" className={linkClass("/appointments")}>
                  <CalendarIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Rendez-vous</span>
                </Link>
              </>
            ) : (
                <>
                    <Link href="/" className={linkClass("/")}>
                        <HomeIcon className="w-4 h-4" />
                        <span>Accueil</span>
                    </Link>
                    <Link href="/about-project" className={linkClass("/about-project")}>
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-bold italic">Le Projet</span>
                    </Link>
                </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {clerkUser ? (
            <>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden size-9 rounded-xl hover:bg-white/5" aria-label="Ouvrir le menu">
                    <MenuIcon className="w-5 h-5 text-slate-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:max-w-sm bg-slate-950 border-white/5 text-white">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-xl font-black italic uppercase tracking-tighter text-primary">Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="px-2 pb-6 space-y-4 pt-8">
                    <PWAInstallPrompt />
                    <div className="space-y-3">
                      <SheetClose asChild>
                        <Link href="/dashboard" className={`${linkClass("/dashboard")} p-4 rounded-2xl hover:bg-white/5 bg-white/[0.02] border border-white/5`}>
                          <HomeIcon className="w-5 h-5 text-primary" />
                          <span className="font-bold uppercase tracking-tight text-sm">Tableau de bord</span>
                        </Link>
                      </SheetClose>
                    <SheetClose asChild>
                      <Link href="/about-project" className={`${linkClass("/about-project")} p-4 rounded-2xl hover:bg-white/5 bg-white/[0.02] border border-white/5`}>
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-bold uppercase tracking-tight text-sm">Le Projet</span>
                      </Link>
                    </SheetClose>

                    {role === "PATIENT" && (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard/health"
                            className={`${linkClass("/dashboard/health")} p-4 rounded-2xl hover:bg-white/5 bg-white/[0.02] border border-white/5`}
                          >
                            <HeartPulse className="w-5 h-5 text-primary" />
                            <span className="font-bold uppercase tracking-tight text-sm">Mon Carnet Digital</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/pro/patients"
                            className="flex items-center gap-3 p-4 rounded-2xl text-slate-500 hover:text-primary hover:bg-white/5 transition-all bg-white/[0.01] border border-dashed border-white/10"
                          >
                            <Users className="w-4 h-4" />
                            <span className="font-black italic uppercase tracking-widest text-[10px]">Espace Professionnel</span>
                          </Link>
                        </SheetClose>
                      </>
                    )}

                    {role === "DOCTOR" && (
                      <SheetClose asChild>
                        <Link href="/pro/patients" className={`${linkClass("/pro/patients")} p-4 rounded-2xl hover:bg-white/5 bg-white/[0.02] border border-white/5`}>
                          <Users className="w-5 h-5 text-primary" />
                          <span className="font-bold uppercase tracking-tight text-sm">Espace Praticien</span>
                        </Link>
                      </SheetClose>
                    )}

                    <SheetClose asChild>
                      <Link href="/appointments" className={`${linkClass("/appointments")} p-4 rounded-2xl hover:bg-white/5 bg-white/[0.02] border border-white/5`}>
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <span className="font-bold uppercase tracking-tight text-sm">Rendez-vous</span>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
              </Sheet>
              <NotificationBell />
              <UserButton appearance={{ elements: { userButtonAvatarBox: "size-9 md:size-10 rounded-xl md:rounded-2xl" } }} />
            </>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2">
                <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="font-bold text-xs h-9 px-3 rounded-lg hover:bg-white/5">Connexion</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button size="sm" className="font-black italic text-xs h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">S'inscrire</Button>
                </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
