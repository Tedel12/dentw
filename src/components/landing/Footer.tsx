import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="px-6 py-16 border-t border-white/5 bg-[#020617]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo DentWise"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-bold text-xl tracking-tight text-white italic">DentWise</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              L'IA qui réinvente vos soins dentaires. Technologie de pointe, sécurité absolue.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Produit</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  Comment ça fonctionne
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary transition-colors">
                  À propos
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="mailto:contact@dentwise.ai" className="hover:text-primary transition-colors">
                  Contactez-nous
                </a>
              </li>
              <li>
                <span className="text-primary/50 cursor-default">
                  Centre d'aide (Bientôt)
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Légal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Sécurité HDS
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 text-center">
          <p className="text-xs text-slate-500 font-medium">
            &copy; 2026 DentWise. Conçu avec précision pour votre santé bucco-dentaire.
          </p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
