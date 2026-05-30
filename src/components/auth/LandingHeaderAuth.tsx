"use client";

import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";

type LandingHeaderAuthProps = {
  signInLabel?: string;
  signUpLabel?: string;
  className?: string;
};

export function LandingHeaderAuth({
  signInLabel = "Se connecter",
  signUpLabel = "S'inscrire",
  className = "flex items-center gap-3",
}: LandingHeaderAuthProps) {
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "sign-in" | "sign-up" }>({
    open: false,
    mode: "sign-in",
  });

  return (
    <>
      <div className={className}>
        <SignedOut>
          <Button 
            className="cursor-pointer font-bold" 
            variant="ghost" 
            size="sm"
            onClick={() => setAuthModal({ open: true, mode: "sign-in" })}
          >
            {signInLabel}
          </Button>
          <Button 
            className="cursor-pointer font-black italic bg-primary hover:bg-primary/90" 
            size="sm"
            onClick={() => setAuthModal({ open: true, mode: "sign-up" })}
          >
            {signUpLabel}
          </Button>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button size="sm" className="font-bold">
              Mon espace
            </Button>
          </Link>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "size-9 rounded-xl" } }} />
        </SignedIn>
      </div>

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode}
      />
    </>
  );
}
