"use client";

import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, Lock, User, Phone, MapPin, Calendar, 
  ChevronRight, Github, Chrome, Loader2, 
  ArrowLeft, CheckCircle2, ShieldCheck, HeartPulse,
  AlertCircle, UserCircle, Briefcase, Globe
} from "lucide-react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/brand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserProfile } from "@/lib/actions/users";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "sign-in" | "sign-up";
}

export function AuthModal({ isOpen, onClose, initialMode = "sign-in" }: AuthModalProps) {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  const [mode, setMode] = useState<"sign-in" | "sign-up" | "verify">(initialMode);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    gender: "MALE" as "MALE" | "FEMALE",
    emergencyName: "",
    emergencyPhone: "",
  });

  const handleModeChange = (newMode: "sign-in" | "sign-up") => {
    setMode(newMode);
    setLoading(false);
  };

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_github") => {
    if (!signInLoaded || !signUpLoaded) return;
    try {
        setLoading(true);
        const signInOrSignUp = mode === "sign-in" ? signIn : signUp;
        await signInOrSignUp.authenticateWithRedirect({
            strategy,
            redirectUrl: "/api/auth/callback",
            redirectUrlComplete: "/dashboard",
        });
    } catch (err: any) {
        toast.error("Erreur de connexion sociale");
        setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.push("/dashboard");
        onClose();
        toast.success("Bon retour sur " + APP_NAME + " !");
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.birthDate) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verify");
      toast.info("Code de vérification envoyé");
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;

    setVerifying(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
        
        await updateUserProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            birthDate: formData.birthDate,
            birthPlace: formData.birthPlace,
            address: formData.address,
            gender: formData.gender,
            emergencyContactName: formData.emergencyName,
            emergencyContactPhone: formData.emergencyPhone,
        });

        toast.success("Bienvenue sur " + APP_NAME);
        router.push("/dashboard");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || "Code invalide");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] w-[95vw] p-0 overflow-hidden border-white/10 bg-[#020617] text-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="flex justify-center mb-4">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
                  <HeartPulse className="size-7 text-primary animate-pulse" />
              </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black italic tracking-tighter text-center uppercase leading-none">
                {mode === 'sign-in' ? 'Connexion' : mode === 'verify' ? 'Vérification' : 'Rejoindre'}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-medium italic text-xs mt-2">
                {mode === 'sign-in' 
                    ? 'Accédez à votre espace santé sécurisé.' 
                    : mode === 'verify' 
                    ? 'Code envoyé par email.' 
                    : 'Créez votre carnet digital en quelques secondes.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            {mode === "verify" ? (
              <motion.form 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerification} 
                className="space-y-6 py-4"
              >
                  <div className="space-y-3 text-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Code reçu par mail</Label>
                      <Input 
                          placeholder="123456" 
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="h-16 bg-white/5 border-white/10 rounded-2xl text-center text-3xl tracking-[0.5em] font-black focus:ring-primary shadow-inner"
                      />
                      <p className="text-[10px] text-slate-500 font-medium italic">Vérifiez vos courriers indésirables si besoin.</p>
                  </div>
                  <Button disabled={verifying} className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black italic shadow-xl text-sm uppercase tracking-widest">
                      {verifying ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                      CONFIRMER LE CODE
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setMode("sign-up")} className="w-full text-slate-500 font-bold uppercase text-[10px] hover:text-white">
                    <ArrowLeft className="size-3 mr-2" /> Retour au formulaire
                  </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="auth-main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                  {/* Social Buttons Container */}
                  <div className="grid grid-cols-2 gap-3">
                      <Button 
                          variant="outline" 
                          onClick={() => handleSocialAuth("oauth_google")}
                          className="h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 font-black text-[10px] uppercase gap-2 transition-all"
                      >
                          <Chrome className="size-4 text-red-500" /> Google
                      </Button>
                      <Button 
                          variant="outline"
                          onClick={() => handleSocialAuth("oauth_github")}
                          className="h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 font-black text-[10px] uppercase gap-2 transition-all"
                      >
                          <Github className="size-4 text-white" /> GitHub
                      </Button>
                  </div>

                  <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                      <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-600"><span className="bg-[#020617] px-4 italic tracking-widest">Ou via email</span></div>
                  </div>

                  <form onSubmit={mode === 'sign-in' ? handleSignIn : handleSignUp} className="space-y-4">
                      {mode === 'sign-up' && (
                          <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Prénom</Label>
                                  <div className="relative">
                                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                    <Input placeholder="Jean" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                                  </div>
                              </div>
                              <div className="space-y-1.5">
                                  <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Nom</Label>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                    <Input placeholder="Koffi" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                                  </div>
                              </div>
                          </div>
                      )}

                      <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Adresse Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                            <Input type="email" placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Mot de passe</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                            <Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                          </div>
                      </div>

                      {mode === 'sign-up' && (
                          <div className="space-y-4 pt-2 border-t border-white/5 mt-4">
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Téléphone</Label>
                                      <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                        <Input placeholder="+229..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                                      </div>
                                  </div>
                                  <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Sexe</Label>
                                      <Select value={formData.gender} onValueChange={(v: any) => setFormData({...formData, gender: v})}>
                                          <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-slate-300">
                                              <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            <SelectItem value="MALE">Masculin</SelectItem>
                                            <SelectItem value="FEMALE">Féminin</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Date de naissance</Label>
                                      <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
                                        <Input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl [color-scheme:dark] focus:border-primary/50 transition-colors" />
                                      </div>
                                  </div>
                                  <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Lieu de naissance</Label>
                                      <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                        <Input placeholder="Cotonou" value={formData.birthPlace} onChange={(e) => setFormData({...formData, birthPlace: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                                      </div>
                                  </div>
                               </div>

                               <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Adresse de résidence</Label>
                                    <div className="relative">
                                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                      <Input placeholder="Quartier, Ville..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="bg-white/5 border-white/10 h-11 pl-10 rounded-xl focus:border-primary/50 transition-colors" />
                                    </div>
                                </div>

                               <div className="space-y-3 pt-2 bg-primary/5 p-4 rounded-[1.5rem] border border-primary/10 shadow-inner">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <AlertCircle className="size-3.5" /> Contact d&apos;urgence
                                  </p>
                                  <div className="grid grid-cols-2 gap-3">
                                      <Input placeholder="Nom du contact" value={formData.emergencyName} onChange={(e) => setFormData({...formData, emergencyName: e.target.value})} className="bg-black/20 border-white/5 h-10 rounded-xl text-[11px] focus:border-primary/30 transition-all" />
                                      <Input placeholder="Téléphone" value={formData.emergencyPhone} onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})} className="bg-black/20 border-white/5 h-10 rounded-xl text-[11px] focus:border-primary/30 transition-all" />
                                  </div>
                               </div>
                          </div>
                      )}

                      <Button disabled={loading} className="w-full h-12 md:h-14 mt-6 bg-primary hover:bg-primary/90 rounded-2xl font-black italic shadow-xl shadow-primary/20 uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                          {loading ? <Loader2 className="animate-spin" /> : mode === 'sign-in' ? 'SE CONNECTER' : 'VALIDER L\'INSCRIPTION'}
                      </Button>
                  </form>

                  <div className="text-center pt-2">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          {mode === 'sign-in' ? "Nouveau sur Benin Santé ?" : "Déjà membre de la plateforme ?"}
                          <button onClick={() => handleModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in')} className="text-primary ml-2 hover:underline cursor-pointer font-black italic">
                              {mode === 'sign-in' ? "S'INSCRIRE" : "SE CONNECTER"}
                          </button>
                      </p>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        <div className="bg-white/5 p-5 text-center border-t border-white/5 shrink-0">
            <p className="text-[8px] font-black uppercase text-slate-600 tracking-[0.2em] leading-relaxed">
                SÉCURISÉ PAR BENIN SANTÉ & CLERK SDK <br />
                CHIFFREMENT BANCAIRE AES-256
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
