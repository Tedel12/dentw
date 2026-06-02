"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, User, ShieldAlert, ShieldCheck, Lock, ChevronRight, History, PlusCircle, Stethoscope, QrCode,
  FileText, Upload, MapPin, Download, AlertCircle, Clock, HeartPulse, Globe, Phone, UserCircle, Calendar as CalendarIcon
} from "lucide-react";
import {
  searchPatient,
  requestHealthAccess,
  checkDoctorAccess,
  getPatientHealthData,
  getDoctorPatientById,
  getHealthAccessRequest,
} from "@/lib/actions/health";
import { trackRecentPatient, getRecentPatients } from "@/lib/actions/history";
import { completeDoctorProfile } from "@/lib/actions/users";
import { toast } from "sonner";
import { AddPrescriptionForm } from "@/components/health/AddPrescriptionForm";
import { BlurData } from "@/components/ui/blur-data";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QRScanner } from "@/components/pro/QRScanner";
import { CONTRACT_TEMPLATE } from "@/lib/contract-template";
import jsPDF from "jspdf";
import { APP_NAME } from "@/lib/brand";

interface DoctorPatientsClientProps {
  isInitialPatient: boolean;
  userId: string;
  doctor?: any;
}

export function DoctorPatientsClient({ isInitialPatient, userId, doctor }: DoctorPatientsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingDoctorProfile, setIsSubmittingDoctorProfile] = useState(false);
  const initializedFromUrl = useRef(false);

  const [doctorForm, setDoctorForm] = useState({ 
    speciality: doctor?.speciality || "", 
    bio: doctor?.bio || "", 
    phone: doctor?.phone || "", 
    gender: (doctor?.gender || "MALE") as any,
    licenseNumber: doctor?.licenseNumber || "",
    workplaceType: doctor?.workplaceType || "Cabinet Privé",
    practiceAddress: doctor?.practiceAddress || "",
    professionalCardUrl: doctor?.professionalCardUrl || "",
    cipCardUrl: doctor?.cipCardUrl || "",
    signedContractUrl: doctor?.signedContractUrl || ""
  });

  const setUrlParams = (nextQuery: string, patientId?: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    if (patientId) {
      params.set("patientId", patientId);
    } else {
      params.delete("patientId");
    }

    const qs = params.toString();
    router.replace(qs ? `/pro/patients?${qs}` : "/pro/patients", { scroll: false });
  };

  const formatBloodGroup = (bloodGroup?: string | null) => {
    if (!bloodGroup) return "N/D";
    return bloodGroup
      .replace("_POSITIVE", "+")
      .replace("_NEGATIVE", "-")
      .replace("_", "");
  };

  const generateContractPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(CONTRACT_TEMPLATE.title, margin, y, { maxWidth: 170 });
    y += 20;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const introLines = doc.splitTextToSize(CONTRACT_TEMPLATE.introduction, 170);
    doc.text(introLines, margin, y);
    y += introLines.length * 5 + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("PREAMBULE", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const preambleLines = doc.splitTextToSize(CONTRACT_TEMPLATE.preamble, 170);
    doc.text(preambleLines, margin, y);
    y += preambleLines.length * 5 + 10;
    
    CONTRACT_TEMPLATE.articles.forEach(art => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`ARTICLE ${art.id} : ${art.title}`, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        const contentLines = doc.splitTextToSize(art.content, 170);
        doc.text(contentLines, margin, y);
        y += contentLines.length * 5 + 10;
    });
    
    y += 10;
    doc.text(CONTRACT_TEMPLATE.footer, margin, y);
    y += 15;
    doc.text("Signature du Praticien (Précédée de 'Lu et approuvé')", margin, y);
    y += 10;
    doc.rect(margin, y, 60, 30);
    
    doc.save(`Contrat_BeninSante_${new Date().getTime()}.pdf`);
    toast.success("Contrat généré ! Veuillez le signer et l'uploader.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
        setDoctorForm(prev => ({ ...prev, [field]: reader.result as string }));
        toast.success(`Fichier chargé !`);
    };
    reader.readAsDataURL(file);
  };

  const handleBecomeDoctor = async () => {
    const speciality = doctorForm.speciality.trim();
    const phone = doctorForm.phone.trim();
    const bio = doctorForm.bio.trim();
    const licenseNumber = doctorForm.licenseNumber.trim();
    const practiceAddress = doctorForm.practiceAddress.trim();

    if (!speciality || !phone || !licenseNumber || !bio || !practiceAddress) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (!doctorForm.professionalCardUrl || !doctorForm.cipCardUrl || !doctorForm.signedContractUrl) {
        toast.error("Veuillez uploader tous les documents de vérification requis");
        return;
    }

    setIsSubmittingDoctorProfile(true);
    try {
      const res = await completeDoctorProfile(doctorForm);
      if (res.success) {
        toast.success("Demande d'inscription envoyée ! L'administrateur va vérifier vos pièces.");
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        toast.error(res.error || "Erreur lors de la création du profil");
        setIsSubmittingDoctorProfile(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Une erreur technique est survenue lors de l'envoi.");
      setIsSubmittingDoctorProfile(false);
    }
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setUrlParams("", null);
      return;
    }

    setLoading(true);
    const res = await searchPatient(q);
    if (res.success) {
      setResults(res.patients || []);
      setUrlParams(q, null);
    }
    setLoading(false);
  };

  const handleSelectPatient = async (p: any, shouldOpenHealth: boolean = false) => {
    setSelectedPatient(p);
    setUrlParams(query, p.id);
    // Track in history
    await trackRecentPatient(doctor.id, p.id);
    
    // Refresh recent list
    const res = await getRecentPatients(doctor.id);
    if (res.success) setRecentPatients(res.patients || []);
    
    const accessRes = await checkDoctorAccess(p.id, doctor.id);
    setHasAccess(accessRes);

    if (accessRes) {
      const dataRes = await getPatientHealthData(p.id, doctor.id);
      if (dataRes.success) setPatientData(dataRes.data);
    } else {
      // Check for pending/rejected requests
      const requestRes = await getHealthAccessRequest(p.id, doctor.id);
      if (requestRes.success && requestRes.request) {
        setRequestStatus(requestRes.request.status);
      } else {
        setRequestStatus(null);
      }
      if (shouldOpenHealth) {
        toast.info("L'accès au carnet a expiré ou n'est pas encore actif.");
      }
    }
  };

  const handleRequestAccess = async (patientId: string) => {
    const res = await requestHealthAccess(patientId, doctor.id);
    if (res.success) {
      toast.success("Invitation envoyée !");
      setRequestStatus("PENDING");
    }
    else toast.error(res.error || "Erreur");
  };

  const renderDoctorForm = () => (
    <>
      <div className="grid gap-5 py-4 text-white max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Spécialité *</Label>
            <Input className="bg-muted/10 border-white/10 h-11 md:h-12" placeholder="ex: Médecine générale" value={doctorForm.speciality} onChange={e => setDoctorForm({...doctorForm, speciality: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">N° Licence / Ordre *</Label>
            <Input className="bg-muted/10 border-white/10 h-11 md:h-12" placeholder="Ex: 1000123" value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2 text-left">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Adresse du Cabinet / Clinique *</Label>
            <div className="relative">
                <Input className="bg-muted/10 border-white/10 pl-10 h-11 md:h-12" placeholder="Cotonou, Avenue de la Paix..." value={doctorForm.practiceAddress} onChange={e => setDoctorForm({...doctorForm, practiceAddress: e.target.value})} />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Téléphone Pro *</Label>
            <Input className="bg-muted/10 border-white/10 h-11 md:h-12" placeholder="+229 ..." value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Type de Structure</Label>
            <Select onValueChange={v => setDoctorForm({...doctorForm, workplaceType: v})} defaultValue={doctorForm.workplaceType || "Cabinet Privé"}>
              <SelectTrigger className="bg-muted/10 border-white/10 h-11 md:h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cabinet Privé">Cabinet Privé</SelectItem>
                <SelectItem value="Clinique">Clinique</SelectItem>
                <SelectItem value="Centre de Santé Public">Hôpital / CSP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Pièces Justificatives
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate uppercase">Carte Pro</p>
                            <p className="text-[9px] text-slate-500 truncate italic">Scan recto-verso</p>
                        </div>
                    </div>
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-colors shrink-0">
                        <Upload className={`size-4 ${doctorForm.professionalCardUrl ? 'text-green-400' : 'text-primary'}`} />
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'professionalCardUrl')} />
                    </label>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <AlertCircle className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate uppercase">Certificat CIP</p>
                            <p className="text-[9px] text-slate-500 truncate italic">Identité nationale</p>
                        </div>
                    </div>
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-colors shrink-0">
                        <Upload className={`size-4 ${doctorForm.cipCardUrl ? 'text-green-400' : 'text-primary'}`} />
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'cipCardUrl')} />
                    </label>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white uppercase">Contrat</p>
                                <p className="text-[9px] text-slate-500 italic">Signé & Approuvé</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={generateContractPDF} className="h-8 text-primary hover:bg-primary/10 rounded-lg text-[9px] uppercase font-black">
                            <Download className="size-3 mr-1.5" /> MODÈLE
                        </Button>
                    </div>
                    <label className="cursor-pointer w-full bg-white/5 border border-dashed border-white/20 hover:bg-white/10 p-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Upload className={`size-3.5 ${doctorForm.signedContractUrl ? 'text-green-400' : 'text-primary'}`} />
                        <span className="text-[10px] font-black uppercase text-slate-400">
                            {doctorForm.signedContractUrl ? "CONTRAT CHARGÉ" : "Uploader signature"}
                        </span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'signedContractUrl')} />
                    </label>
                </div>
            </div>
        </div>

        <div className="space-y-2 pt-2 text-left">
          <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Biographie / Présentation</Label>
          <Textarea placeholder="Votre parcours..." className="h-20 md:h-24 resize-none bg-muted/10 border-white/10 rounded-xl text-sm" value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})} />
        </div>
      </div>
      <DialogFooter className="p-1">
        <Button
          onClick={handleBecomeDoctor}
          className="w-full h-12 md:h-14 font-black italic shadow-lg uppercase tracking-widest text-sm"
          disabled={isSubmittingDoctorProfile}
        >
          {isSubmittingDoctorProfile ? "Validation..." : "Envoyer mon dossier"}
        </Button>
      </DialogFooter>
    </>
  );

  useEffect(() => {
    const fetchRecent = async () => {
        if (!doctor?.id) return;
        const res = await getRecentPatients(doctor.id);
        if (res.success) setRecentPatients(res.patients || []);
    };
    fetchRecent();
  }, [doctor?.id]);

  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery) setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    if (initializedFromUrl.current) return;
    let isCancelled = false;

    const bootstrapFromUrl = async () => {
      if (isInitialPatient || !doctor?.id) return;

      const urlQuery = searchParams.get("q") || "";
      const patientId = searchParams.get("patientId");

      if (urlQuery) {
        setQuery(urlQuery);
        setLoading(true);
        const searchRes = await searchPatient(urlQuery);
        if (!isCancelled && searchRes.success) {
          const patients = searchRes.patients || [];
          setResults(patients);

          if (patientId) {
            const found = patients.find((p: any) => p.id === patientId);
            if (found) {
              await handleSelectPatient(found, searchParams.get("openHealth") === "true");
            } else {
              const byIdRes = await getDoctorPatientById(patientId);
              if (!isCancelled && byIdRes.success && byIdRes.patient) {
                await handleSelectPatient(byIdRes.patient, searchParams.get("openHealth") === "true");
              }
            }
          }
        }
        if (!isCancelled) setLoading(false);
      } else if (patientId) {
        const byIdRes = await getDoctorPatientById(patientId);
        if (!isCancelled && byIdRes.success && byIdRes.patient) {
          await handleSelectPatient(byIdRes.patient, searchParams.get("openHealth") === "true");
        }
      }
    };

    initializedFromUrl.current = true;
    void bootstrapFromUrl();
    return () => {
      isCancelled = true;
    };
  }, [doctor?.id, isInitialPatient, searchParams]);

  if (isInitialPatient) {
    if (doctor?.verificationStatus === "PENDING") {
      return (
        <div className="w-full space-y-6 animate-in fade-in duration-700">
          <div className="bg-amber-500/10 border border-amber-500/20 p-8 md:p-10 rounded-[2.5rem] text-center space-y-4 md:space-y-6 animate-pulse">
            <Clock className="w-16 h-16 text-amber-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Examen en cours</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic max-w-xs mx-auto">
                Votre demande est en cours d'étude par notre équipe de modération.
              </p>
            </div>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl text-[10px] md:text-[11px] text-slate-500 text-left border border-white/5">
             <p className="font-black text-primary mb-1 uppercase tracking-[0.2em]">Processus de sécurité</p>
             <p className="italic font-medium leading-relaxed">Nous vérifions manuellement votre numéro de licence, votre certificat CIP ainsi que votre contrat signé pour garantir l'intégrité de {APP_NAME}.</p>
          </div>
        </div>
      );
    }

    if (doctor?.verificationStatus === "REJECTED") {
      return (
        <div className="w-full space-y-6 animate-in fade-in duration-700">
          <div className="bg-red-500/10 border border-red-500/20 p-8 md:p-10 rounded-[2.5rem] text-center space-y-4 md:space-y-6">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Profil rejeté</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic max-w-xs mx-auto">
                Votre demande n'a pas pu être validée. Pièce illisible ou information erronée.
              </p>
            </div>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black italic rounded-2xl shadow-xl uppercase tracking-widest text-sm">
                    CORRIGER MON DOSSIER
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-[2rem] bg-[#020617] border-white/10 p-6 md:p-8">
              <DialogHeader className="text-left mb-6">
                <DialogTitle className="text-2xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                  <Stethoscope className="text-primary" /> Correction
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium italic text-xs md:text-sm">
                  Mettez à jour vos informations pour une nouvelle validation.
                </DialogDescription>
              </DialogHeader>
              {renderDoctorForm()}
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return (
      <div className="w-full animate-in fade-in zoom-in duration-500">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
            <Button className="w-full h-14 md:h-16 text-lg md:text-xl font-black italic uppercase tracking-tighter rounded-[1.5rem] md:rounded-3xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                <Stethoscope className="mr-3 w-6 h-6" /> Devenir Praticien
            </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-[2rem] bg-[#020617] border-white/10 p-6 md:p-8">
            <DialogHeader className="text-left mb-6">
                <DialogTitle className="text-2xl font-black flex items-center gap-3 text-white uppercase italic tracking-tighter">
                <Stethoscope className="text-primary" /> Inscription
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-medium italic text-xs md:text-sm">
                Renseignez vos informations professionnelles.
                </DialogDescription>
            </DialogHeader>
            {renderDoctorForm()}
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-20 md:pt-24 overflow-x-hidden">
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white text-left animate-in slide-in-from-top-4 duration-700">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter flex items-center gap-2 md:gap-3 uppercase italic">
              <HeartPulse className="w-8 h-8 md:w-10 md:h-10 text-primary shrink-0" /> Espace Praticien
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium italic truncate">Bienvenue, Dr. {doctor?.name}</p>
          </div>
          
          {!selectedPatient && (
             <div className="w-full md:w-auto">
                 <QRScanner onSuccess={(patientId) => {
                    const bootstrapScan = async () => {
                        const byIdRes = await getDoctorPatientById(patientId);
                        if (byIdRes.success && byIdRes.patient) {
                            await handleSelectPatient(byIdRes.patient, true);
                        }
                    };
                    bootstrapScan();
                 }} />
             </div>
          )}
        </div>

        {!selectedPatient ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* HISTORIQUE */}
            {recentPatients.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                        <History className="w-3.5 h-3.5" /> Patients récents
                    </h3>
                    <div className="flex gap-2 md:gap-3 flex-wrap">
                        {recentPatients.map(p => (
                            <Button key={p.id} variant="outline" size="sm" className="rounded-full border-white/5 bg-white/5 gap-2 h-9 text-[10px] md:text-xs font-bold px-4" onClick={() => handleSelectPatient(p)}>
                                <User className="w-3 h-3 text-primary" /> {p.firstName} {p.lastName}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 md:gap-3 w-full max-w-2xl bg-slate-900/40 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl border border-white/5 shadow-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500" />
                <Input 
                  placeholder="Chercher patient..." 
                  className="pl-9 md:pl-12 h-10 md:h-12 border-none bg-transparent text-sm md:text-lg focus-visible:ring-0 text-white placeholder:text-slate-500"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} size="sm" className="rounded-xl px-4 md:px-8 h-10 md:h-12 font-black italic shadow-lg shadow-primary/20 uppercase text-[10px] md:text-sm">
                {loading ? "..." : "Rechercher"}
              </Button>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(p => (
                <Card key={p.id} className="bg-slate-900/40 backdrop-blur-sm border-white/5 hover:border-primary/50 transition-all cursor-pointer group rounded-[1.5rem] md:rounded-[2rem] overflow-hidden" onClick={() => handleSelectPatient(p)}>
                  <CardContent className="p-4 md:p-6 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary/20 transition-all">
                        <User className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm md:text-lg text-white truncate uppercase tracking-tight italic leading-tight">{p.firstName} {p.lastName}</h3>
                        <p className="text-[10px] md:text-sm text-slate-500 truncate italic font-medium">{p.pseudo || p.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              ))}
              {query && results.length === 0 && !loading && (
                  <div className="col-span-full py-12 text-center">
                      <p className="text-slate-600 font-bold uppercase tracking-widest text-xs italic">Aucun résultat trouvé.</p>
                  </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right duration-500">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedPatient(null);
                setPatientData(null);
                setHasAccess(false);
                setUrlParams(query, null);
              }}
              className="mb-2 font-bold text-white hover:bg-primary/10 hover:text-primary rounded-xl"
            >
              ← Retour
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-5 md:gap-8 bg-slate-900/40 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl text-left relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex items-center gap-4 md:gap-6 min-w-0 relative z-10">
                <div className="w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                  <User className="w-7 h-7 md:w-12 md:h-12 text-primary" />
                </div>
                <div className="text-white min-w-0">
                  <h2 className="text-xl md:text-4xl font-black tracking-tighter truncate uppercase leading-tight italic">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <p className="text-xs md:text-xl text-primary/70 font-medium truncate italic leading-tight">{selectedPatient.email}</p>
                </div>
              </div>

              {!hasAccess ? (
                <Button 
                    onClick={() => handleRequestAccess(selectedPatient.id)} 
                    size="lg" 
                    className="w-full md:w-auto h-12 md:h-16 px-6 md:px-10 rounded-xl md:rounded-[1.5rem] gap-2 md:gap-3 text-xs md:text-lg font-black italic shadow-2xl shadow-primary/20 uppercase tracking-widest relative z-10"
                    disabled={requestStatus === 'PENDING' || requestStatus === 'REJECTED'}
                >
                  <ShieldAlert className="w-4 h-4 md:w-6 md:h-6" /> 
                  {requestStatus === 'PENDING' || requestStatus === 'REJECTED' ? "En attente" : "Demander l'accès"}
                </Button>
              ) : (
                <div className="w-full md:w-auto flex items-center justify-center gap-2 md:gap-4 text-emerald-400 bg-emerald-500/10 px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] border border-emerald-500/20 font-black text-[10px] md:text-xs tracking-[0.2em] uppercase relative z-10 shadow-lg shadow-emerald-500/5">
                  <ShieldCheck className="w-4 h-4 md:w-7 md:h-7 animate-in zoom-in duration-500" /> ACCÈS APPROUVÉ (24H)
                </div>
              )}
            </div>

            {hasAccess && patientData ? (  
              <div className="animate-in fade-in duration-700">
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center gap-3 mb-6 md:mb-10 text-left">
                <ShieldAlert className="size-4 md:size-5 text-amber-500 shrink-0" />
                <p className="text-amber-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed">
                  Confidentialité : Survolez les données sensibles pour les afficher.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl text-white overflow-hidden text-left">
                    <CardHeader className="p-6 md:p-8 bg-white/5 border-b border-white/5">
                        <CardTitle className="text-lg md:text-xl text-primary font-black uppercase tracking-widest italic">Profil Médical</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-5 md:space-y-6">
                       <div className="flex justify-between items-center bg-black/40 p-4 md:p-5 rounded-2xl border border-white/5 shadow-inner">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">G. Sanguin</span>
                          <BlurData>
                            <span className="font-black text-2xl md:text-3xl text-red-500 tracking-tighter drop-shadow-md">
                              {formatBloodGroup(patientData.bloodGroup)}
                            </span>
                          </BlurData>
                       </div>

                       <div className="grid grid-cols-2 gap-3 md:gap-4 text-left">
                         <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 shadow-sm">
                           <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500">Âge</p>
                           <BlurData>
                            <p className="font-black text-white text-base md:text-lg italic tracking-tight">{patientData.age ? `${patientData.age} ans` : "N/R"}</p>
                           </BlurData>
                         </div>
                         <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 shadow-sm">
                           <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-slate-500">Poids</p>
                           <BlurData>
                            <p className="font-black text-white text-base md:text-lg italic tracking-tight">{patientData.weight ? `${patientData.weight} kg` : "N/R"}</p>
                           </BlurData>
                         </div>
                       </div>

                       <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 italic"><CalendarIcon className="size-3.5 text-primary" /> Naissance</span>
                                <BlurData>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 shadow-inner">
                                        <p className="text-sm font-bold">{patientData.birthDate ? format(new Date(patientData.birthDate), "dd MMMM yyyy", { locale: fr }) : "Non renseigné"}</p>
                                        <p className="text-[10px] text-primary/70 uppercase font-black tracking-widest flex items-center gap-1.5"><Globe className="size-3" /> {patientData.birthPlace || "Lieu non renseigné"}</p>
                                    </div>
                                </BlurData>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 italic"><MapPin className="size-3.5 text-primary" /> Résidence</span>
                                <BlurData>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-sm font-medium italic text-slate-300">{patientData.address || "Adresse non renseignée"}</p>
                                        <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-widest">{patientData.nationality || "Béninoise"}</p>
                                    </div>
                                </BlurData>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 italic"><AlertCircle className="size-3.5 text-red-500" /> Urgence</span>
                                <BlurData>
                                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/20">
                                        <p className="text-sm font-black text-red-100 uppercase tracking-tight">{patientData.emergencyContactName || "Non renseigné"}</p>
                                        <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-2"><Phone className="size-3" /> {patientData.emergencyContactPhone || "Pas de numéro"}</p>
                                    </div>
                                </BlurData>
                            </div>
                       </div>

                       {[
                         { label: "Allergies", data: patientData.allergies, color: "amber" },
                         { label: "Pathologies", data: patientData.chronicDiseases, color: "blue" },
                         { label: "Electrophorèse", data: patientData.electrophoresis, color: "violet" },
                         { label: "Vaccins", data: patientData.vaccines, color: "emerald" }
                       ].map((section, idx) => (
                        <div key={idx} className="space-y-2 text-left">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">{section.label}</span>
                          <BlurData>
                            <div className={`bg-${section.color}-500/10 text-${section.color}-200 p-4 md:p-5 rounded-2xl border border-${section.color}-500/20 text-xs md:text-sm font-medium leading-relaxed italic shadow-sm`}>
                              {section.data || "Néant."}
                            </div>
                          </BlurData>
                        </div>
                       ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 text-white text-left space-y-6 md:space-y-10">
                  <Card className="bg-slate-900/40 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/5 px-6 md:px-10 py-5 md:py-8">
                      <CardTitle className="flex items-center gap-3 text-lg md:text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        <PlusCircle className="size-6 md:w-10 md:h-10 shrink-0" /> Prescription
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                      <AddPrescriptionForm 
                        patientId={selectedPatient.id} 
                        doctorId={doctor.id} 
                        onSuccess={() => {
                          setHasAccess(false);
                          setPatientData(null);
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/40 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/5 px-6 md:px-10 py-5 md:py-8">
                      <CardTitle className="flex items-center gap-3 text-lg md:text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        <History className="size-6 md:w-10 md:h-10 shrink-0" /> Journal de soins
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 md:p-10 space-y-6">
                      {patientData.treatments?.length ? (
                        patientData.treatments.map((t: any) => (
                          <div
                            key={t.id}
                            className="rounded-2xl md:rounded-[1.5rem] border border-white/5 bg-black/30 p-5 md:p-8 space-y-6 hover:border-primary/30 transition-all group shadow-inner"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h4 className="font-black text-white text-base md:text-2xl uppercase tracking-tight italic group-hover:text-primary transition-colors truncate leading-tight">{t.name}</h4>
                                <p className="text-[10px] md:text-sm font-bold text-primary/70 uppercase tracking-widest mt-1">{t.pathology || "Suivi général"}</p>
                              </div>
                              <span className="text-[9px] md:text-[11px] font-black text-slate-500 bg-white/5 px-3 md:px-5 py-1.5 rounded-full uppercase tracking-widest border border-white/5 shrink-0">
                                {format(new Date(t.createdAt), "dd MMM yyyy", { locale: fr })}
                              </span>
                            </div>

                            <BlurData>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 border-y border-white/5 py-6 mt-6">
                                    <div className="space-y-1">
                                        <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] block">Posologie</span>
                                        <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.dosage || "N/R"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] block">Fréquence</span>
                                        <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.frequency || "N/R"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] block">Horaires</span>
                                        <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.time || "N/R"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] block">Durée</span>
                                        <span className="font-bold text-slate-200 block text-xs md:text-base italic">{t.duration ? `${t.duration} jours` : "N/R"}</span>
                                    </div>
                                </div>
                            </BlurData>

                            <BlurData>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] block">Voie d&apos;administration</span>
                                        <p className="text-xs md:text-sm font-medium text-slate-300 italic">{t.administrationRoute || "N/R"}</p>
                                    </div>
                                    {t.notes && (
                                        <div className="space-y-2">
                                            <span className="text-slate-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] block">Notes & Conseils</span>
                                            <p className="text-xs md:text-sm font-medium text-slate-400 italic bg-white/[0.02] p-3 rounded-xl border border-white/5">{t.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </BlurData>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center space-y-4 opacity-20">
                            <Lock className="size-16 mx-auto text-slate-500" />
                            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs md:text-sm italic">Historique de traitements vide</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              </div>
            ) : !hasAccess && (
              <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-slate-900/40 rounded-[2.5rem] md:rounded-[4rem] border-4 border-dashed border-white/5 mx-4 shadow-inner animate-in zoom-in duration-700">
                <div className="size-16 md:size-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 md:mb-10 ring-4 ring-primary/5 animate-pulse">
                    <Lock className="size-8 md:size-12 text-primary/20" />
                </div>
                <h3 className="text-xl md:text-4xl font-black text-primary/30 uppercase tracking-tighter italic">Accès Verrouillé</h3>
                <p className="text-slate-500 font-medium max-w-xs text-center mt-3 px-6 text-xs md:text-lg italic leading-relaxed">
                  L'autorisation du patient est nécessaire pour déchiffrer ce dossier médical.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
