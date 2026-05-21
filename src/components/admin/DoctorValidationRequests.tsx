"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useGetDoctors } from '@/hooks/use-doctors'
import { 
    CheckIcon, 
    XIcon, 
    ShieldAlertIcon, 
    FileTextIcon, 
    MapPinIcon, 
    BadgeCheckIcon, 
    MailIcon, 
    PhoneIcon, 
    Clock,
    ExternalLink,
    AlertCircle,
    UserCheck
} from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { verifyDoctorStatus } from '@/lib/actions/doctors'
import { toast } from 'sonner'

const DoctorValidationRequests = () => {
    const {data: doctors = [], refetch} = useGetDoctors()
    
    // On ne garde que ceux en attente
    const pendingRequests = doctors.filter((doc: any) => doc.verificationStatus === 'PENDING');

    const handleVerifyStatus = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            const res = await verifyDoctorStatus(id, status as any);
            if (res.success) {
                toast.success(status === 'VERIFIED' ? "Médecin validé avec succès" : "Médecin rejeté");
                refetch();
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        }
    }

    const openDocument = (dataUrl: string) => {
        if (!dataUrl) return;
        const win = window.open();
        if (win) {
            win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    }

    if (pendingRequests.length === 0) return null;

    return (
        <Card className='mb-12 border-amber-200 bg-amber-50/5 shadow-xl shadow-amber-500/5 overflow-hidden rounded-[2rem] text-white'>
            <CardHeader className='border-b border-white/5 bg-amber-500/10 p-8'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-amber-500/20 rounded-2xl shadow-inner'>
                        <ShieldAlertIcon className='size-8 text-amber-500' />
                    </div>
                    <div>
                        <CardTitle className='text-3xl font-black italic tracking-tighter'>Demandes de Validation</CardTitle>
                        <CardDescription className='text-slate-400 font-bold uppercase tracking-widest text-xs mt-1'>
                            {pendingRequests.length} praticien(s) en attente de certification rigoureuse
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className='p-8 bg-slate-950/50'>
                <div className="grid gap-12">
                    {pendingRequests.map((doctor: any) => (
                        <div
                            key={doctor.id}
                            className='bg-white/5 rounded-[2.5rem] border border-white/5 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:border-amber-500/30 transition-all duration-500 group'
                        >
                            {/* PHOTO ET INFOS DE BASE */}
                            <div className='p-8 lg:w-1/3 bg-white/5 border-r border-white/5 flex flex-col items-center text-center space-y-6'>
                                <div className='relative'>
                                    <div className='absolute inset-0 bg-amber-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform'></div>
                                    <Image
                                        src={doctor.imageUrl}
                                        alt={doctor.name}
                                        width={120}
                                        height={120}
                                        className='size-32 rounded-full object-cover ring-4 ring-white/5 shadow-2xl relative z-10'
                                    />
                                    <div className='absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full border-4 border-slate-900 z-20 shadow-lg'>
                                        <Clock className='size-5 animate-spin-slow' />
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className='text-2xl font-black italic tracking-tight'>{doctor.name}</h4>
                                    <Badge className='mt-2 bg-primary text-white border-none font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1'>
                                        {doctor.speciality}
                                    </Badge>
                                </div>

                                <div className='w-full pt-6 space-y-3 text-sm'>
                                    <div className='flex items-center gap-3 justify-center text-slate-400 hover:text-primary transition-colors'>
                                        <div className='p-1.5 bg-white/5 rounded-lg border border-white/5'><MailIcon className='size-4' /></div>
                                        <span className='font-medium'>{doctor.email}</span>
                                    </div>
                                    <div className='flex items-center gap-3 justify-center text-slate-400 hover:text-primary transition-colors'>
                                        <div className='p-1.5 bg-white/5 rounded-lg border border-white/5'><PhoneIcon className='size-4' /></div>
                                        <span className='font-medium'>{doctor.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DÉTAILS PROFESSIONNELS & PIÈCES */}
                            <div className='p-8 lg:flex-1 flex flex-col space-y-8'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                    <div className='space-y-3'>
                                        <span className='text-[11px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2'>
                                            <BadgeCheckIcon className='size-4' /> Licence & Établissement
                                        </span>
                                        <div className='bg-white/5 p-5 rounded-3xl border border-white/5 space-y-2'>
                                            <p className='text-lg font-black text-white italic tracking-tight'>{doctor.licenseNumber}</p>
                                            <p className='text-xs font-bold text-slate-500 uppercase'>{doctor.workplaceType || "Cabinet Privé"}</p>
                                        </div>
                                    </div>
                                    <div className='space-y-3'>
                                        <span className='text-[11px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2'>
                                            <MapPinIcon className='size-4' /> Adresse du Cabinet
                                        </span>
                                        <div className='bg-white/5 p-5 rounded-3xl border border-white/5 space-y-1'>
                                            <p className='text-sm font-bold text-slate-200'>{doctor.practiceAddress || "Non renseignée"}</p>
                                            <p className='text-[10px] italic text-slate-500'>{doctor.cabinetInfo || "Aucune info complémentaire"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PIÈCES JUSTIFICATIVES */}
                                <div className='space-y-4'>
                                    <span className='text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400 flex items-center gap-2'>
                                        <FileTextIcon className='size-4' /> Pièces justificatives numériques
                                    </span>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                        <Button 
                                            variant="outline" 
                                            className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 justify-between px-4 group"
                                            onClick={() => openDocument(doctor.professionalCardUrl)}
                                            disabled={!doctor.professionalCardUrl}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary"><UserCheck className="size-4" /></div>
                                                <span className="text-[10px] font-black uppercase">Carte Pro</span>
                                            </div>
                                            <ExternalLink className="size-4 text-slate-500 group-hover:text-primary transition-colors" />
                                        </Button>

                                        <Button 
                                            variant="outline" 
                                            className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 justify-between px-4 group"
                                            onClick={() => openDocument(doctor.cipCardUrl)}
                                            disabled={!doctor.cipCardUrl}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary"><AlertCircle className="size-4" /></div>
                                                <span className="text-[10px] font-black uppercase">CIP Bénin</span>
                                            </div>
                                            <ExternalLink className="size-4 text-slate-500 group-hover:text-primary transition-colors" />
                                        </Button>

                                        <Button 
                                            variant="outline" 
                                            className="h-16 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 justify-between px-4 group"
                                            onClick={() => openDocument(doctor.signedContractUrl)}
                                            disabled={!doctor.signedContractUrl}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><FileTextIcon className="size-4" /></div>
                                                <span className="text-[10px] font-black uppercase">Contrat Signé</span>
                                            </div>
                                            <ExternalLink className="size-4 text-slate-500 group-hover:text-primary transition-colors" />
                                        </Button>
                                    </div>
                                </div>

                                <div className='flex items-center justify-end gap-4 pt-8 border-t border-white/5'>
                                    <Button 
                                        variant="outline" 
                                        className='h-14 px-8 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-black uppercase tracking-widest text-[10px] transition-all duration-300'
                                        onClick={() => handleVerifyStatus(doctor.id, 'REJECTED')}
                                    >
                                        <XIcon className='mr-2 size-4' /> Rejeter
                                    </Button>
                                    <Button 
                                        className='h-14 px-10 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105'
                                        onClick={() => handleVerifyStatus(doctor.id, 'VERIFIED')}
                                    >
                                        <CheckIcon className='mr-2 size-5' /> Certifier Praticien
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default DoctorValidationRequests;
