import { Activity, Brain, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/brand";

const features = [
  {
    title: "Carnet de Santé Digital",
    description: `Centralisez tout votre historique médical : allergies, antécédents et traitements, accessible 24h/24 en toute sécurité.`,
    icon: Activity,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "IA Médicale Vocale",
    description: "Interagissez avec notre assistant vocal intelligent pour obtenir des conseils de premier niveau et comprendre vos symptômes.",
    icon: Brain,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Protection des Données",
    description: "Vos données de santé sont cryptées et protégées. Vous seul décidez quel praticien peut consulter votre dossier.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Prise de RDV Instantanée",
    description: "Trouvez les meilleurs praticiens près de chez vous et réservez votre consultation en quelques clics.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  }
];

export function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Pourquoi nous choisir ?</h2>
          <p className="text-3xl md:text-5xl font-black italic text-white tracking-tighter">
            REPENSER LA SANTÉ <br className="hidden md:block" /> AU BÉNIN.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="bg-white/5 border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-500 group">
              <CardContent className="p-8 space-y-6">
                <div className={`size-14 rounded-2xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className={`size-7 ${feature.color}`} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white italic">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
