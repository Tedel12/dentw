import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatToAsk from "@/components/landing/WhatToAsk";
import PricingSection from "@/components/landing/PricingSection";
import CTA from "@/components/landing/CTA";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/actions/users";

export default async function Home() {

  const user = await currentUser();

  await syncUser();

  //redirect auth user to dashboard
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-primary/30">
      <Header/>
      <main>
        <Hero />
        <About />
        <HowItWorks/>
        <WhatToAsk/>
        <PricingSection/>
        <CTA/>
      </main>
    </div>
  );
}
