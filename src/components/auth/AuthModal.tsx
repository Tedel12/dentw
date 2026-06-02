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
  ArrowLeft, CheckCircle2, ShieldCheck, HeartPulse
} from "lucide-react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/brand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserProfile } from "@/lib/actions/users";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "sign-in" | "sign-up";
}

export function AuthModal({ isOpen, onClose, initialMode = "sign-in" }: AuthModalProps) {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  const [mode, setMode] = useState<"sign-in" | "sign-up" | "verify">("sign-in");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Form State
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
        toast.success("Bon retour sur Benin Santé !");
      } else {
        console.log(result);
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
      toast.info("Code de vérification envoyé à " + formData.email);
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
        
        // Sync extra data to our DB
        await updateUserProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            birthDate: formData.birthDate,
            birthPlace: formData.birthPlace,
            address: formData.address,
            gender: formData.gender,
        });

        toast.success("Bienvenue sur Benin Santé !");
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-white/10 bg-[#020617] text-white rounded-[2.5rem] shadow-2xl">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex justify-center mb-6">
                <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <HeartPulse className="size-8 text-primary animate-pulse" />
                </div>
            </div>
            <DialogTitle className="text-3xl font-black italic tracking-tighter text-center uppercase">
                {mode === 'sign-in' ? 'Connexion' : mode === 'verify' ? 'Vérification' : 'Inscription'}
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400 font-medium italic">
                {mode === 'sign-in' 
                    ? 'Accédez à votre espace santé sécurisé.' 
                    : mode === 'verify' 
                    ? 'Saisissez le code envoyé par email.' 
                    : 'Créez votre carnet de santé digital en 1 minute.'}
            </DialogDescription>
          </DialogHeader>

          {mode === "verify" ? (
            <form onSubmit={handleVerification} className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Code de vérification</Label>
                    <Input 
                        placeholder="123456" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-center text-2xl tracking-[0.5em] font-black"
                    />
                </div>
                <Button disabled={verifying} className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black italic shadow-xl">
                    {verifying ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                    VÉRIFIER MON EMAIL
                </Button>
                <Button type="button" variant="ghost" onClick={() => setMode("sign-up")} className="w-full text-slate-500 font-bold uppercase text-[10px]">
                    <ArrowLeft className="size-3 mr-2" /> Retour au formulaire
                </Button>
            </form>
          ) : (
            <div className="space-y-6">
                {/* SOCIAL AUTH */}
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => handleSocialAuth("oauth_google")}
                        className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 font-bold text-xs gap-2"
                    >
                        <Chrome className="size-4 text-red-500" /> Google
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => handleSocialAuth("oauth_github")}
                        className="h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 font-bold text-xs gap-2"
                    >
                        <Github className="size-4 text-white" /> GitHub
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600"><span className="bg-[#020617] px-4 italic">Ou via email</span></div>
                </div>

                <form onSubmit={mode === 'sign-in' ? handleSignIn : handleSignUp} className="space-y-4">
                    {mode === 'sign-up' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Prénom</Label>
                                <Input 
                                    placeholder="Jean" 
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    className="bg-white/5 border-white/10 h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Nom</Label>
                                <Input 
                                    placeholder="Koffi" 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className="bg-white/5 border-white/10 h-11 rounded-xl"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Adresse Email</Label>
                        <Input 
                            type="email"
                            placeholder="votre@email.com" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="bg-white/5 border-white/10 h-11 rounded-xl"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Mot de passe</Label>
                        <Input 
                            type="password"
                            placeholder="••••••••" 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="bg-white/5 border-white/10 h-11 rounded-xl"
                        />
                    </div>

                    {mode === 'sign-up' && (
                        <div className="space-y-4 pt-2">
                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Téléphone</Label>
                                    <Input 
                                        placeholder="+229 01..." 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="bg-white/5 border-white/10 h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Sexe</Label>
                                    <Select value={formData.gender} onValueChange={(v: any) => setFormData({...formData, gender: v})}>
                                        <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-white">
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
                                    <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Né(e) le</Label>
                                    <Input 
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                        className="bg-white/5 border-white/10 h-11 rounded-xl [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Lieu de naissance</Label>
                                    <Input 
                                        placeholder="Cotonou" 
                                        value={formData.birthPlace}
                                        onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                                        className="bg-white/5 border-white/10 h-11 rounded-xl"
                                    />
                                </div>
                             </div>
                        </div>
                    )}

                    <Button disabled={loading} className="w-full h-12 mt-6 bg-primary hover:bg-primary/90 rounded-xl font-black italic shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="animate-spin" /> : mode === 'sign-in' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
                    </Button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        {mode === 'sign-in' ? "Nouveau sur la plateforme ?" : "Vous avez déjà un compte ?"}
                        <button 
                            onClick={() => handleModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
                            className="text-primary ml-2 hover:underline cursor-pointer font-black italic italic"
                        >
                            {mode === 'sign-in' ? "S'INSCRIRE" : "SE CONNECTER"}
                        </button>
                    </p>
                </div>
            </div>
          )}
        </div>

        <div className="bg-white/5 p-4 text-center">
            <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">
                Données cryptées AES-256 • Sécurisé par Benin Santé & Clerk
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
