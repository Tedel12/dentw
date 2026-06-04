"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Lock, ShieldAlert, Timer, Send, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getOwnHealthData } from "@/lib/actions/health";
import { checkUserExportPin, getExportStatus, blockUserExport, requestExportUnblock } from "@/lib/actions/users";
import { logSecurityEvent } from "@/lib/actions/security";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { APP_NAME } from "@/lib/brand";
import { motion, AnimatePresence } from "framer-motion";

const MAX_ATTEMPTS = 7;
const LOCKOUT_DURATION = 60000;

/** Rose « santé » : bandeau + en-têtes de tableaux (RGB) */
const PDF_ROSE_PRIMARY: [number, number, number] = [214, 91, 138];

type PdfDoctor = {
  id: string;
  name: string;
  firstName?: string | null;  
  lastName?: string | null;
  speciality: string;
  phone: string;
  gender: string;
  practiceAddress?: string | null;
  user?: { firstName?: string | null; lastName?: string | null } | null;
};

function doctorNameParts(d: PdfDoctor) {
  let prenom = (d.firstName || d.user?.firstName || "").trim();
  let nom = (d.lastName || d.user?.lastName || "").trim();
  if (!prenom && !nom && d.name?.trim()) {
    const parts = d.name.trim().split(/\s+/);
    prenom = parts[0] || "";
    nom = parts.slice(1).join(" ") || "";
  }
  return { prenom: prenom || "—", nom: nom || "—" };
}

function truncateCell(s: string, max: number) {
  const t = (s || "—").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

interface HealthPdfUser {
  id: string;
  clerkId: string;
  firstName?: string | null;
  lastName?: string | null;
  pseudo?: string | null;
  age?: number | null;
  weight?: number | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  electrophoresis?: string | null;
  vaccines?: string | null;
  birthDate?: string | Date | null;
  birthPlace?: string | null;
  address?: string | null;
  nationality?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  treatments?: Array<{
    id: string;
    createdAt: Date | string;
    name: string;
    type: string;
    dosage: string;
    frequency: string;
    time: string;
    pathology?: string | null;
    administrationRoute?: string | null;
    notes?: string | null;
    prescribingDoctor?: PdfDoctor | null;
  }>;
}

export function ExportCarnetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  
  // Security states
  const [isDbBlocked, setIsDbBlocked] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [unblockReason, setUnblockReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Check local lockout
    const storedLockout = localStorage.getItem("export_lockout_until");
    if (storedLockout) {
        const until = parseInt(storedLockout, 10);
        if (until > Date.now()) {
            setTimeLeft(Math.ceil((until - Date.now()) / 1000));
        }
    }

    // 2. Check DB status
    async function checkStatus() {
        const res = await getExportStatus();
        setIsDbBlocked(res.isBlocked);
        setHasPendingRequest(res.hasPendingRequest);
    }
    checkStatus();
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleFailure = async () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
        // Definitive block in DB
        await blockUserExport();
        setIsDbBlocked(true);

        // Local 60s cooldown
        const until = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem("export_lockout_until", until.toString());
        setTimeLeft(LOCKOUT_DURATION / 1000);
        
        toast.error("Sécurité : Exportation bloquée. Contactez l'admin.");
    }
  };

  const handleUnblockRequest = async () => {
    if (!unblockReason.trim()) return;
    setSubmittingRequest(true);
    const res = await requestExportUnblock(unblockReason);
    if (res.success) {
        toast.success("Demande envoyée à l'administrateur");
        setHasPendingRequest(true);
    } else {
        toast.error("Erreur lors de l'envoi");
    }
    setSubmittingRequest(false);
  };

  const handleExport = async () => {
    setLoading(true);
    const pinValidation = await checkUserExportPin(pin);
    if (!pinValidation.success) {
      toast.error("Code PIN invalide");
      await handleFailure();
      setLoading(false);
      return;
    }

    const res = await getOwnHealthData();
    if (!res.success || !res.data) {
      toast.error("Erreur de récupération");
      setLoading(false);
      return;
    }

    const user = res.data as HealthPdfUser;
    await logSecurityEvent({ userId: user.id, accessedBy: user.clerkId, action: "EXPORT_PDF", targetId: user.id });
    
    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const ROSE = [231, 138, 83]; // Benin Santé Primary
      const GRIS_TEXTE = [71, 85, 105];
      const NOIR = [15, 23, 42];

      // Header
      doc.setFillColor(NOIR[0], NOIR[1], NOIR[2]);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(APP_NAME.toUpperCase(), 20, 25);
      doc.setFontSize(10);
      doc.text("CARNET DE SANTÉ NUMÉRIQUE SÉCURISÉ", 20, 32);

      // Patient Info
      doc.setTextColor(NOIR[0], NOIR[1], NOIR[2]);
      doc.setFontSize(14);
      doc.text("IDENTITÉ DU PATIENT", 20, 55);
      
      const profileData = [
        ["Nom complet", `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()],
        ["Naissance", user.birthDate ? `${format(new Date(user.birthDate), "dd/MM/yyyy")} à ${user.birthPlace || "N/R"}` : "N/R"],
        ["Adresse", user.address || "N/R"],
        ["Groupe Sanguin", user.bloodGroup?.replace(/_/g, " ") || "N/R"],
        ["Contact Urgence", `${user.emergencyContactName || "N/R"} (${user.emergencyContactPhone || "N/R"})`],
        ["Allergies", user.allergies || "Néant"],
        ["Antécédents", user.chronicDiseases || "Néant"]
      ];

      autoTable(doc, {
        startY: 60,
        body: profileData,
        theme: "striped",
        headStyles: { fillColor: ROSE },
        styles: { fontSize: 9 }
      });

      let cursorY = (doc as any).lastAutoTable.finalY + 15;

      // Treatments History
      doc.setFontSize(14);
      doc.text("HISTORIQUE MÉDICAL", 20, cursorY);
      
      const treatments = (user.treatments ?? []);
      autoTable(doc, {
        startY: cursorY + 5,
        head: [["Date", "Acte", "Description", "Praticien"]],
        body: treatments.map(t => [
            format(new Date(t.createdAt), "dd/MM/yyyy"),
            t.type === 'MEDICATION' ? 'Ordonnance' : t.type === 'EXAM' ? 'Examen' : 'Suivi',
            `${t.name}${t.dosage ? ` (${t.dosage})` : ""}\n${t.notes || ""}`,
            t.prescribingDoctor?.name || "Patient"
        ]),
        headStyles: { fillColor: ROSE },
        styles: { fontSize: 8 }
      });

      // Annexes
      const images = treatments.filter(t => !!t.prescriptionUrl);
      for (const img of images) {
          doc.addPage();
          doc.text(`ANNEXE : ${img.name.toUpperCase()}`, 20, 20);
          try {
            doc.addImage(img.prescriptionUrl as string, "JPEG", 15, 30, 180, 240, undefined, 'FAST');
          } catch (e) {}
      }

      doc.save(`BeninSante_Export_${user.lastName}.pdf`);
      toast.success("Carnet téléchargé !");
      setIsOpen(false);
    } catch (error) {
      toast.error("Échec de génération PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl gap-2">
          <FileDown className="size-4" /> Exporter mon carnet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] w-[95vw] rounded-[2.5rem] bg-[#020617] border-white/10 p-0 overflow-hidden shadow-2xl text-left">
        <div className="p-8 md:p-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className={`size-16 rounded-2xl flex items-center justify-center border shadow-lg ${isDbBlocked ? 'bg-red-500/20 border-red-500/30' : 'bg-primary/20 border-primary/30'}`}>
                    {timeLeft > 0 ? <Timer className="size-8 text-red-500 animate-pulse" /> : isDbBlocked ? <ShieldAlert className="size-8 text-red-500" /> : <Lock className="size-8 text-primary animate-pulse" />}
                </div>
                <div className="space-y-2">
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">
                        {isDbBlocked ? "Exportation Bloquée" : "Accès Sécurisé"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium italic text-xs md:text-sm leading-relaxed">
                        {isDbBlocked 
                            ? "Votre accès à l'exportation PDF a été suspendu pour des raisons de sécurité après plusieurs échecs." 
                            : timeLeft > 0 
                            ? `Trop d'échecs. Veuillez patienter ${timeLeft} secondes.`
                            : "Entrez votre PIN pour déverrouiller l'exportation de vos données."}
                    </DialogDescription>
                </div>
            </div>

            {isDbBlocked ? (
                <div className="space-y-6">
                    {hasPendingRequest ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl text-center space-y-3">
                            <Clock className="size-8 text-amber-500 mx-auto" />
                            <p className="text-xs font-bold text-amber-200 uppercase tracking-widest italic">Demande en cours d&apos;étude</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">L&apos;administrateur vérifie votre identité avant de débloquer votre accès.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Motif de déblocage</Label>
                                <Textarea 
                                    placeholder="Expliquez pourquoi vous avez besoin de débloquer l'export (ex: j'ai oublié mon PIN)..." 
                                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px] text-xs italic"
                                    value={unblockReason}
                                    onChange={(e) => setUnblockReason(e.target.value)}
                                />
                            </div>
                            <Button 
                                onClick={handleUnblockRequest}
                                disabled={submittingRequest || !unblockReason.trim()}
                                className="w-full h-12 bg-white text-black hover:bg-slate-200 font-black italic rounded-xl gap-2 shadow-xl"
                            >
                                {submittingRequest ? <Loader2 className="animate-spin size-4" /> : <Send className="size-4" />}
                                ENVOYER LA DEMANDE
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Code PIN</Label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            disabled={timeLeft > 0}
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value.replace(/\D/g, ""));
                            }}
                            className="h-16 bg-white/5 border-white/10 rounded-2xl text-center text-3xl tracking-[0.5em] font-black focus:ring-primary shadow-inner"
                        />
                        {attempts > 0 && !isDbBlocked && (
                            <p className="text-center text-red-500 text-[9px] font-black uppercase mt-2">
                                {MAX_ATTEMPTS - attempts} tentatives restantes avant blocage définitif
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={handleExport}
                            disabled={loading || pin.length < 4 || timeLeft > 0}
                            className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black italic shadow-xl text-sm uppercase tracking-widest transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                            {timeLeft > 0 ? `BLOQUÉ (${timeLeft}s)` : "DÉVERROUILLER & TÉLÉCHARGER"}
                        </Button>
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Annuler</Button>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
