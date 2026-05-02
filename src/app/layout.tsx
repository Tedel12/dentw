import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import UserSync from "@/components/UserSync";
import TanStackProvider from "@/components/providers/TanStackProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dentwise",
  description: "Your voice assitant for a better appointement",
};

import Footer from "@/components/landing/Footer";
import { CustomCursor } from "@/components/ui/custom-cursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanStackProvider>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary:"#e78a53",
            colorBackground: "#ffffff",
            colorText: "#ffffff",
            colorTextSecondary: "#94a3b8",
            colorInputBackground: "#1e293b"
          }
        }}
      >
        <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-[#020617] text-white`}
        >
          <Toaster />
          <CustomCursor />
           {/* <UserSync /> */}
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          </body>
        </html>
      </ClerkProvider>
    </TanStackProvider>
  );
}
