import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Libellé genre pour affichage (PDF, fiches). */
export function formatGenderFr(gender: string | null | undefined): string {
  if (gender === "FEMALE") return "Femme";
  if (gender === "MALE") return "Homme";
  return "N/R";
}

export function generateAvatar(name: string, gender: "MALE" | "FEMALE") {
  const username = name.replace(/\s+/g, "").toLowerCase();
  const base = "https://avatar.iran.liara.run/public";
  if (gender === "FEMALE") return `${base}/girl?username=${username}`;
  // default to boy
  return `${base}/boy?username=${username}`;
}

// phone formatting function for BE numbers - ai generated 🎉
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;

 // supprimer tout sauf les chiffres
 const phoneNumber = value.replace(/\D/g, '');

 // si le user commence à taper
 if (phoneNumber.length < 4) {
  return phoneNumber;
 }

 // tjrs forcer l'indicatif béninois
 const country = '229';

 // supprimer l'indicatif s'il est déjà tapé
 let rest = phoneNumber.startsWith(country) ? phoneNumber.slice(3) : phoneNumber;

 // limiter à 10 chiffres after l'indicatif
 // Benin requires "01" prefix since Nov 2024
 if (!rest.startsWith('01')) {
   // If user typed old 8-digit format or is typing, prepend "01"
   rest = '01' + rest;
 }
 rest = rest.slice(0, 10);

  // préfixe opérateur
  if (rest.length <= 2) {
    return `+229 ${rest}`
  }

  // num principal
  const prefix = rest.slice(0, 2);
  const number = rest.slice(2);

  return `+229 ${prefix} ${number}`
};

//  ai generated
export const getNext5Days = () => {
  const dates = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < 5; i++) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
};

export const getAvailableTimeSlots = () => {
  return [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];
};


export const APPOINTMENT_TYPES = [
  { id: "checkup", name: "Contrôle de routine", duration: "60 min", price: "2000 FCFA" },
  { id: "cleaning", name: "Nettoyage dentaire", duration: "45 min", price: "5000 FCFA" },
  { id: "consultation", name: "Consultation", duration: "30 min", price: "3000 FCFA" },
  { id: "emergency", name: "Consultation d'urgence", duration: "30 min", price: "7000 FCFA" },
];
