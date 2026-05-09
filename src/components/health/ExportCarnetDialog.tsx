"use client";

import { useState } from "react";
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
import { FileDown, Lock } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getOwnHealthData } from "@/lib/actions/health";
import { checkUserExportPin } from "@/lib/actions/users";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatGenderFr } from "@/lib/utils";

/** Rose « santé » : bandeau + en-têtes de tableaux (RGB) */
const PDF_ROSE_PRIMARY: [number, number, number] = [214, 91, 138];
const PDF_TABLE_HEAD = { fillColor: PDF_ROSE_PRIMARY, textColor: 255, fontStyle: "bold" as const };

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

function doctorShortLabel(d: PdfDoctor | null | undefined): string {
  if (!d) return "—";
  const { prenom, nom } = doctorNameParts(d);
  let base = [prenom, nom].filter((x) => x !== "—").join(" ").trim();
  if (!base) base = d.name?.trim() || "—";
  const label = base.startsWith("Dr.") ? base : `Dr. ${base}`;
  return label.length > 40 ? `${label.slice(0, 37)}…` : label;
}

function truncateCell(s: string, max: number) {
  const t = (s || "—").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Données carnet pour export (aligné sur Prisma après `prisma generate`) */
interface HealthPdfUser {
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
  treatments?: Array<{
    id: string;
    createdAt: Date | string;
    name: string;
    dosage: string;
    frequency: string;
    pathology?: string | null;
    administrationRoute?: string | null;
    notes?: string | null;
    prescribingDoctor?: PdfDoctor | null;
  }>;
}

export function ExportCarnetDialog() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const pinValidation = await checkUserExportPin(pin);
    if (!pinValidation.success) {
      toast.error(pinValidation.error || "Code de sécurité incorrect");
      setLoading(false);
      return;
    }

    const res = await getOwnHealthData();

    if (!res.success || !res.data) {
      toast.error("Erreur lors de la récupération des données");
      setLoading(false);
      return;
    }

    const user = res.data as HealthPdfUser;

    try {
      const doc = new jsPDF();

      doc.setFillColor(PDF_ROSE_PRIMARY[0], PDF_ROSE_PRIMARY[1], PDF_ROSE_PRIMARY[2]);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("DENTWISE", 105, 15, { align: "center" });
      doc.setFontSize(14);
      doc.text("Carnet de Santé Personnel Digitalisé", 105, 25, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Généré le : ${format(new Date(), "PPP", { locale: fr })}`, 105, 32, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text("INFORMATIONS DU PATIENT", 15, 55);

      const bloodGroupLabel = user.bloodGroup ? String(user.bloodGroup).replace(/_/g, " ") : "N/A";

      const profileData = [
        ["Nom complet", `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "N/A"],
        ["Pseudo", user.pseudo || "N/A"],
        ["Âge", user.age ? `${user.age} ans` : "N/A"],
        ["Poids (kg)", user.weight != null ? String(user.weight) : "N/A"],
        ["Groupe Sanguin", bloodGroupLabel],
        ["Allergies", user.allergies || "Aucune connue"],
        ["Maladies Chroniques", user.chronicDiseases || "Aucun antécédent"],
        ["Électrophorèse", user.electrophoresis || "Non renseigné"],
        ["Vaccins", user.vaccines || "Non renseigné"],
      ];

      autoTable(doc, {
        startY: 60,
        head: [["Champ", "Détail"]],
        body: profileData,
        theme: "striped",
        headStyles: PDF_TABLE_HEAD,
        styles: { fontSize: 9 },
      });

      let cursorY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 60;

      const treatments = (user.treatments ?? []) as Array<{
        id: string;
        createdAt: Date | string;
        name: string;
        dosage: string;
        frequency: string;
        pathology?: string | null;
        administrationRoute?: string | null;
        notes?: string | null;
        prescribingDoctor?: PdfDoctor | null;
      }>;

      const prescriberMap = new Map<string, PdfDoctor>();
      for (const t of treatments) {
        const d = t.prescribingDoctor;
        if (d?.id) prescriberMap.set(d.id, d);
      }
      const prescribers = [...prescriberMap.values()];

      if (prescribers.length > 0) {
        cursorY += 12;
        doc.setFontSize(14);
        doc.text("IDENTIFICATION DES PRATICIENS PRESCRIPTEURS", 15, cursorY);
        cursorY += 6;

        const prescriberRows = prescribers.map((d: any) => {
          const { prenom, nom } = doctorNameParts(d);
          return [
            prenom,
            nom,
            d.speciality,
            d.phone,
            d.practiceAddress?.trim() || "—",
            formatGenderFr(d.gender),
          ];
        });

        autoTable(doc, {
          startY: cursorY,
          head: [["Prénom", "Nom", "Spécialité", "Téléphone", "Adresse cabinet / hôpital", "Sexe"]],
          body: prescriberRows,
          theme: "grid",
          headStyles: PDF_TABLE_HEAD,
          styles: { fontSize: 8, cellPadding: 2 },
        });
        cursorY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY;
      }

      cursorY += 14;
      doc.setFontSize(16);
      doc.text("HISTORIQUE DES TRAITEMENTS & ORDONNANCES", 15, cursorY);

      const treatmentRows =
        treatments.length > 0
          ? treatments.map((t: any, idx: number) => {
              const hasImage = !!t.prescriptionUrl;
              return [
                format(new Date(t.createdAt), "dd/MM/yy"),
                truncateCell(t.name, 22),
                truncateCell(t.dosage, 12),
                truncateCell(t.frequency, 10),
                truncateCell(t.pathology || "—", 18),
                truncateCell(t.administrationRoute || "—", 14),
                doctorShortLabel(t.prescribingDoctor ?? undefined),
                hasImage ? "🔗 (Voir annexe)" : truncateCell(t.notes || "—", 28),
              ];
            })
          : [["—", "Aucun traitement", "—", "—", "—", "—", "—", "—"]];

      autoTable(doc, {
        startY: cursorY + 5,
        head: [["Date", "Médicament", "Posologie", "Fréq.", "Pathologie", "Voie", "Prescripteur", "Notes"]],
        body: treatmentRows,
        theme: "grid",
        headStyles: PDF_TABLE_HEAD,
        styles: { fontSize: 7, cellPadding: 1.5 },
      });

      // SECTION ANNEXES (Photos d'ordonnances)
      const treatmentsWithImages = treatments.filter((t: any) => !!t.prescriptionUrl);
      if (treatmentsWithImages.length > 0) {
        for (const t of treatmentsWithImages) {
          doc.addPage();
          doc.setFillColor(PDF_ROSE_PRIMARY[0], PDF_ROSE_PRIMARY[1], PDF_ROSE_PRIMARY[2]);
          doc.rect(0, 0, 210, 20, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.text(`ANNEXE : PREUVE MÉDICALE - ${t.name.toUpperCase()}`, 105, 13, { align: "center" });

          doc.setTextColor(100);
          doc.setFontSize(8);
          doc.text(`Prescription du ${format(new Date(t.createdAt), "dd MMMM yyyy", { locale: fr })}`, 15, 30);

          try {
            // Ajout de l'image (base64)
            doc.addImage(t.prescriptionUrl as string, "JPEG", 15, 35, 180, 240, undefined, 'FAST');
          } catch (e) {
            doc.setTextColor(255, 0, 0);
            doc.text("Erreur lors du chargement de l'image de l'ordonnance.", 15, 45);
          }
        }
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Ce document est confidentiel et protégé par la Loi sur le Numérique du Bénin.", 105, 285, {
          align: "center",
        });
        doc.text(`Page ${i} sur ${pageCount}`, 190, 285, { align: "right" });
      }

      doc.save(`Carnet_Sante_${user.lastName ?? "patient"}.pdf`);
      toast.success("Votre carnet a été téléchargé avec succès !");
      setIsOpen(false);
      setPin("");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" /> Exporter PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Validation de sécurité</DialogTitle>
          <DialogDescription>
            Veuillez entrer votre code PIN de sécurité pour déverrouiller l'exportation de vos données médicales.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Code PIN (4 chiffres min.)</Label>
            <Input
              id="pin"
              type="password"
              placeholder="••••"
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-2xl tracking-[0.5em]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={loading || pin.length < 4}>
            {loading ? "Génération..." : "Confirmer & Télécharger"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
