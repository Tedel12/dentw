"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, User, ShieldAlert, ShieldCheck, Lock, ChevronRight, History, PlusCircle, Stethoscope, QrCode,
  FileText, Upload, MapPin, Download, AlertCircle, Clock
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Spécialité *</Label>
            <Input className="bg-muted/10 border-white/10" placeholder="ex: Médecine générale" value={doctorForm.speciality} onChange={e => setDoctorForm({...doctorForm, speciality: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">N° Licence / Ordre *</Label>
            <Input className="bg-muted/10 border-white/10" placeholder="Ex: 1000123" value={doctorForm.licenseNumber} onChange={e => setDoctorForm({...doctorForm, licenseNumber: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Adresse du Cabinet / Clinique *</Label>
            <div className="relative">
                <Input className="bg-muted/10 border-white/10 pl-10" placeholder="Cotonou, Avenue de la Paix..." value={doctorForm.practiceAddress} onChange={e => setDoctorForm({...doctorForm, practiceAddress: e.target.value})} />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Téléphone Pro *</Label>
            <Input className="bg-muted/10 border-white/10" placeholder="+229 ..." value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Type de Structure</Label>
            <Select onValueChange={v => setDoctorForm({...doctorForm, workplaceType: v})} defaultValue={doctorForm.workplaceType || "Cabinet Privé"}>
              <SelectTrigger className="bg-muted/10 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cabinet Privé">Cabinet Privé</SelectItem>
                <SelectItem value="Clinique">Clinique</SelectItem>
                <SelectItem value="Centre de Santé Public">Hôpital / CSP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Pièces Justificatives
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Carte Professionnelle</p>
                            <p className="text-[10px] text-slate-500">Scan recto-verso obligatoire</p>
                        </div>
                    </div>
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                        <Upload className={`size-4 ${doctorForm.professionalCardUrl ? 'text-green-400' : 'text-primary'}`} />
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'professionalCardUrl')} />
                    </label>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <AlertCircle className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Certificat CIP (Bénin)</p>
                            <p className="text-[10px] text-slate-500">Justificatif d'identité nationale</p>
                        </div>
                    </div>
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
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
                                <p className="text-xs font-bold text-white">Contrat Benin Santé</p>
                                <p className="text-[10px] text-slate-500">À télécharger, signer et uploader</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={generateContractPDF} className="h-8 text-primary hover:bg-primary/10 rounded-lg">
                            <Download className="size-3 mr-2" /> MODÈLE
                        </Button>
                    </div>
                    <label className="cursor-pointer w-full bg-white/5 border border-dashed border-white/20 hover:bg-white/10 p-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                        <Upload className={`size-4 ${doctorForm.signedContractUrl ? 'text-green-400' : 'text-primary'}`} />
                        <span className="text-[10px] font-bold text-slate-400">
                            {doctorForm.signedContractUrl ? "CONTRAT CHARGÉ" : "Uploader le contrat signé"}
                        </span>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'signedContractUrl')} />
                    </label>
                </div>
            </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label className="text-[10px] uppercase font-black tracking-widest text-primary">Biographie / Présentation</Label>
          <Textarea placeholder="Présentez votre parcours aux futurs patients..." className="h-24 resize-none bg-muted/10 border-white/10 rounded-xl" value={doctorForm.bio} onChange={e => setDoctorForm({...doctorForm, bio: e.target.value})} />
        </div>
        <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/10 italic">
          Note : Votre accès sera débloqué après vérification manuelle de vos pièces par l'admin.
        </p>
      </div>
      <DialogFooter>
        <Button
          onClick={handleBecomeDoctor}
          className="w-full h-12 font-bold shadow-lg"
          disabled={isSubmittingDoctorProfile}
        >
          {isSubmittingDoctorProfile ? "Validation..." : "Valider mon profil professionnel"}
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
        <div className="w-full space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] text-center space-y-4 animate-pulse">
            <Clock className="w-12 h-12 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white italic">EXAMEN EN COURS</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Votre demande d'inscription est en cours d'étude par notre équipe de modération.
              </p>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl text-[11px] text-slate-500 text-left border border-white/5">
             <p className="font-bold text-primary mb-1 uppercase tracking-widest">Processus de sécurité</p>
             <p>Nous vérifions manuellement votre numéro de licence RPPS, votre certificat CIP ainsi que votre contrat signé pour garantir l'intégrité de la plateforme {APP_NAME}.</p>
          </div>
        </div>
      );
    }

    if (doctor?.verificationStatus === "REJECTED") {
      return (
        <div className="w-full space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white italic">PROFIL REJETÉ</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Votre demande n'a pas pu être validée. Cela peut être dû à une pièce illisible ou une information erronée.
              </p>
            </div>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black italic rounded-2xl shadow-xl">
                    CORRIGER MON DOSSIER
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl bg-[#020617] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                  <Stethoscope className="text-primary" /> Correction de Profil
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Mettez à jour vos informations pour une nouvelle tentative de validation.
                </DialogDescription>
              </DialogHeader>
              {renderDoctorForm()}
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
            <Stethoscope className="mr-2 w-5 h-5" /> Devenir Praticien
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] rounded-3xl bg-[#020617] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
              <Stethoscope className="text-primary" /> Inscription Praticien
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Remplissez vos informations professionnelles pour accéder à l'espace de gestion.
            </DialogDescription>
          </DialogHeader>
          {renderDoctorForm()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <Stethoscope className="w-10 h-10 text-primary" /> Espace Praticien
            </h1>
            <p className="text-muted-foreground font-medium">Bienvenue, Dr. {doctor?.name} | {doctor?.speciality}</p>
          </div>
          
          {!selectedPatient && (
             <QRScanner onSuccess={(patientId) => {
                const bootstrapScan = async () => {
                    const byIdRes = await getDoctorPatientById(patientId);
                    if (byIdRes.success && byIdRes.patient) {
                        await handleSelectPatient(byIdRes.patient, true);
                    }
                };
                bootstrapScan();
             }} />
          )}
        </div>

        {!selectedPatient ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* HISTORIQUE */}
            {recentPatients.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4" /> Patients consultés récemment
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                        {recentPatients.map(p => (
                            <Button key={p.id} variant="outline" size="sm" className="rounded-full border-primary/20 gap-2" onClick={() => handleSelectPatient(p)}>
                                <User className="w-4 h-4 text-primary" /> {p.firstName} {p.lastName}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 max-w-2xl bg-card/50 backdrop-blur-sm p-2 rounded-2xl border border-primary/10 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Chercher par nom, email ou pseudo..." 
                  className="pl-12 h-12 border-none bg-transparent text-lg focus-visible:ring-0 text-white placeholder:text-muted-foreground"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                {loading ? "Recherche..." : "Rechercher"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map(p => (
                <Card key={p.id} className="bg-card/40 backdrop-blur-sm border-primary/10 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-xl rounded-2xl" onClick={() => handleSelectPatient(p)}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{p.firstName} {p.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{p.pseudo || p.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedPatient(null);
                setPatientData(null);
                setHasAccess(false);
                setUrlParams(query, null);
              }}
              className="mb-2 font-bold text-white hover:bg-primary/10 hover:text-primary"
            >
              ← Retour à la liste
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-card/60 backdrop-blur-md p-8 rounded-[2rem] border border-primary/10 shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-black tracking-tight">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <p className="text-lg text-primary/70 font-medium">{selectedPatient.email}</p>
                </div>
              </div>

              {!hasAccess ? (
                <Button 
                    onClick={() => handleRequestAccess(selectedPatient.id)} 
                    size="lg" 
                    className="h-14 px-8 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/10"
                    disabled={requestStatus === 'PENDING' || requestStatus === 'REJECTED'}
                >
                  <ShieldAlert className="w-6 h-6" /> 
                  {requestStatus === 'PENDING' || requestStatus === 'REJECTED' ? "Demande en attente" : "Demander l'accès au carnet"}
                </Button>
              ) : (
                <div className="flex items-center gap-3 text-green-400 bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20 font-black">
                  <ShieldCheck className="w-6 h-6" /> ACCÈS APPROUVÉ (24H)
                </div>
              )}
            </div>

            {hasAccess && patientData ? (  
              <>
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 mb-6">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <p className="text-amber-500 text-xs font-black uppercase tracking-widest">
                  PROTECTION ACTIVE : Survolez les zones floutées pour afficher les données sensibles.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="bg-card/40 backdrop-blur-sm border-primary/10 rounded-3xl shadow-sm text-white">
                    <CardHeader><CardTitle className="text-xl text-primary font-bold uppercase tracking-tighter">Dossier Médical</CardTitle></CardHeader>
                    <CardContent className="space-y-5">
                       <div className="flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/10">
                          <span className="text-muted-foreground font-bold">G. Sanguin</span>
                          <BlurData>
                            <span className="font-black text-2xl text-red-500 tracking-tighter">
                              {formatBloodGroup(patientData.bloodGroup)}
                            </span>
                          </BlurData>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                         <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                           <p className="text-xs uppercase tracking-widest text-muted-foreground">Pseudo</p>
                           <p className="font-semibold">{patientData.pseudo || "Non renseigné"}</p>
                         </div>
                         <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                           <p className="text-xs uppercase tracking-widest text-muted-foreground">Age</p>
                           <p className="font-semibold">{patientData.age ? `${patientData.age} ans` : "Non renseigné"}</p>
                         </div>
                         <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                           <p className="text-xs uppercase tracking-widest text-muted-foreground">Poids</p>
                           <p className="font-semibold">{patientData.weight ? `${patientData.weight} kg` : "Non renseigné"}</p>
                         </div>
                         <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                           <p className="text-xs uppercase tracking-widest text-muted-foreground">Profil créé</p>
                           <p className="font-semibold">
                             {patientData.createdAt
                               ? format(new Date(patientData.createdAt), "dd MMM yyyy", { locale: fr })
                               : "Non renseigné"}
                           </p>
                         </div>
                       </div>
                       <div className="space-y-2">
                          <span className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Allergies</span>
                          <BlurData>
                            <p className="bg-amber-500/10 text-amber-200 p-4 rounded-2xl border border-amber-500/20 font-semibold leading-snug">
                              {patientData.allergies || "Aucune allergie connue"}
                            </p>
                          </BlurData>
                       </div>
                       <div className="space-y-2">
                          <span className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Pathologies</span>
                          <BlurData>
                            <p className="bg-blue-500/10 text-blue-200 p-4 rounded-2xl border border-blue-500/20 font-semibold">
                              {patientData.chronicDiseases || "Néant"}
                            </p>
                          </BlurData>
                       </div>
                       <div className="space-y-2">
                          <span className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Electrophorèse</span>
                          <BlurData>
                            <p className="bg-violet-500/10 text-violet-200 p-4 rounded-2xl border border-violet-500/20 font-semibold">
                              {patientData.electrophoresis || "Non renseigné"}
                            </p>
                          </BlurData>
                       </div>
                       <div className="space-y-2">
                          <span className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Vaccins</span>
                          <BlurData>
                            <p className="bg-emerald-500/10 text-emerald-200 p-4 rounded-2xl border border-emerald-500/20 font-semibold">
                              {patientData.vaccines || "Non renseigné"}
                            </p>
                          </BlurData>
                       </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 text-white">
                  <Card className="bg-card/40 backdrop-blur-sm rounded-3xl border-primary/20 shadow-2xl shadow-primary/5">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-black text-primary italic">
                        <PlusCircle className="w-8 h-8" /> NOUVELLE ORDONNANCE
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
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

                  <Card className="mt-8 bg-card/40 backdrop-blur-sm rounded-3xl border-primary/20 shadow-2xl shadow-primary/5">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-black text-primary italic">
                        <History className="w-8 h-8" /> HISTORIQUE DES TRAITEMENTS
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Tous les traitements déjà enregistrés pour ce patient.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {patientData.treatments?.length ? (
                        patientData.treatments.map((t: any) => (
                          <div
                            key={t.id}
                            className="rounded-2xl border border-primary/10 bg-primary/5 p-4 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-bold text-lg">{t.name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(t.createdAt), "dd MMM yyyy - HH:mm", { locale: fr })}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              <p><span className="text-muted-foreground">Posologie:</span> {t.dosage || "N/R"}</p>
                              <p><span className="text-muted-foreground">Fréquence:</span> {t.frequency || "N/R"}</p>
                              <p><span className="text-muted-foreground">Horaires:</span> {t.time || "N/R"}</p>
                              <p><span className="text-muted-foreground">Durée:</span> {t.duration ? `${t.duration} jours` : "N/R"}</p>
                              <p><span className="text-muted-foreground">Pathologie:</span> {t.pathology || "N/R"}</p>
                              <p><span className="text-muted-foreground">Voie:</span> {t.administrationRoute || "N/R"}</p>
                            </div>
                            {t.notes ? (
                              <p className="text-sm bg-muted/40 rounded-xl p-3">
                                <span className="text-muted-foreground">Notes:</span> {t.notes}
                              </p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Aucun traitement enregistré pour ce patient.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
                </>
            ) : !hasAccess && (
              <div className="flex flex-col items-center justify-center py-32 bg-primary/5 rounded-[3rem] border-4 border-dashed border-primary/10">
                <Lock className="w-16 h-16 text-primary/30 mb-6" />
                <h3 className="text-2xl font-black text-primary/40 uppercase tracking-tighter">Accès Verrouillé</h3>
                <p className="text-muted-foreground font-medium max-w-sm text-center mt-2 px-6">
                  Le secret médical est protégé. Une autorisation du patient est requise pour toute consultation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
