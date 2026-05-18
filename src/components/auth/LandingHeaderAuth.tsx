"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  return (
    <div className={className}>
      <SignedOut>
        <SignInButton mode="modal">
          <Button className="cursor-pointer" variant="ghost" size="sm">
            {signInLabel}
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="cursor-pointer" size="sm">
            {signUpLabel}
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <Button size="sm" className="font-bold">
            Mon espace
          </Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
