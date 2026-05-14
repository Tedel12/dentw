"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BlurDataProps {
  children: React.ReactNode;
  className?: string;
}

export function BlurData({ children, className }: BlurDataProps) {
  const [isBlurred, setIsBlurred] = useState(true);

  return (
    <div 
      className={cn("transition-all duration-300", isBlurred ? "blur-[6px] hover:blur-none" : "blur-none", className)}
      onMouseEnter={() => setIsBlurred(false)}
      onMouseLeave={() => setIsBlurred(true)}
    >
      {children}
    </div>
  );
}
