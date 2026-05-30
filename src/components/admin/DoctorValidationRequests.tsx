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
    
    const pendingRequests = doctors.filter((doc: any) => doc.verificationStatus === 'PENDING');

    const handleVerifyStatus = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            const res = await verifyDoctorStatus(id, status as any);
            if (res.success) {
                toast.success(status === 'VERIFIED' ? "Certifié avec succès" : "Médecin rejeté");
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
        <Card className='mb-8 md:mb-12 border-amber-500/20 bg-amber-500/5 shadow-xl overflow-hidden rounded-[2rem] text-white text-left'>
            <CardHeader className='border-b border-white/5 bg-amber-500/10 p-6 md:p-8'>
                <div className='flex items-center gap-3 md:gap-4'>
                    <div className='p-2 md:p-3 bg-amber-500/20 rounded-xl md:rounded-2xl shrink-0'>
                        <ShieldAlertIcon className='size-6 md:size-8 text-amber-500' />
                    </div>
                    <div>
                        <CardTitle className='text-xl md:text-3xl font-black italic tracking-tighter uppercase'>Validations</CardTitle>
                        <CardDescription className='text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-xs mt-0.5'>
                            {pendingRequests.length} praticien(s) en attente
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className='p-4 md:p-8 bg-slate-950/30'>
                <div className="grid gap-6 md:gap-12">
                    {pendingRequests.map((doctor: any) => (
                        <div
                            key={doctor.id}
                            className='bg-white/5 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:border-amber-500/30 transition-all duration-500'
                        >
                            {/* PHOTO ET INFOS DE BASE */}
                            <div className='p-6 md:p-8 lg:w-1/3 bg-white/5 lg:border-r border-white/5 flex flex-col items-center text-center space-y-4 md:space-y-6'>
                                <div className='relative shrink-0'>
                                    <div className='absolute inset-0 bg-amber-500/20 rounded-full blur-2xl'></div>
                                    <Image
                                        src={doctor.imageUrl}
                                        alt={doctor.name}
                                        width={100}
                                        height={100}
                                        className='size-24 md:size-32 rounded-full object-cover ring-4 ring-white/5 shadow-2xl relative z-10'
                                    />
                                    <div className='absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full border-4 border-slate-900 z-20'>
                                        <Clock className='size-4 animate-spin-slow' />
                                    </div>
                                </div>
                                
                                <div className="min-w-0 w-full px-2">
                                    <h4 className='text-lg md:text-2xl font-black italic tracking-tight uppercase truncate'>{doctor.name}</h4>
                                    <Badge className='mt-1.5 md:mt-2 bg-primary text-white border-none font-black uppercase tracking-widest text-[8px] md:text-[10px] px-3 py-1'>
                                        {doctor.speciality}
                                    </Badge>
                                </div>

                                <div className='w-full pt-4 md:pt-6 space-y-2 md:space-y-3 text-xs md:text-sm'>
                                    <div className='flex items-center gap-2 md:gap-3 justify-center text-slate-400 min-w-0'>
                                        <MailIcon className='size-3.5 shrink-0' />
                                        <span className='font-medium truncate'>{doctor.email}</span>
                                    </div>
                                    <div className='flex items-center gap-2 md:gap-3 justify-center text-slate-400'>
                                        <PhoneIcon className='size-3.5 shrink-0' />
                                        <span className='font-medium'>{doctor.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DÉTAILS PROFESSIONNELS & PIÈCES */}
                            <div className='p-6 md:p-8 lg:flex-1 flex flex-col space-y-6 md:space-y-8'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8'>
                                    <div className='space-y-2 md:space-y-3'>
                                        <span className='text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 ml-1'>
                                            <BadgeCheckIcon className='size-3.5' /> Licence
                                        </span>
                                        <div className='bg-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/5'>
                                            <p className='text-base md:text-lg font-black text-white italic tracking-tight'>{doctor.licenseNumber}</p>
                                            <p className='text-[10px] font-bold text-slate-500 uppercase mt-0.5'>{doctor.workplaceType || "Cabinet Privé"}</p>
                                        </div>
                                    </div>
                                    <div className='space-y-2 md:space-y-3'>
                                        <span className='text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 ml-1'>
                                            <MapPinIcon className='size-3.5' /> Localisation
                                        </span>
                                        <div className='bg-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/5'>
                                            <p className='text-xs md:text-sm font-bold text-slate-200 line-clamp-1'>{doctor.practiceAddress || "N/R"}</p>
                                            <p className='text-[9px] italic text-slate-500 line-clamp-1 mt-0.5'>{doctor.cabinetInfo || "Aucune précision"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PIÈCES JUSTIFICATIVES */}
                                <div className='space-y-3 md:space-y-4'>
                                    <span className='text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2 ml-1'>
                                        <FileTextIcon className='size-3.5' /> Documents
                                    </span>
                                    <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4'>
                                        {[
                                            { label: "Carte Pro", icon: UserCheck, url: doctor.professionalCardUrl },
                                            { label: "CIP Bénin", icon: AlertCircle, url: doctor.cipCardUrl },
                                            { label: "Contrat", icon: FileTextIcon, url: doctor.signedContractUrl }
                                        ].map((doc, idx) => (
                                            <Button 
                                                key={idx}
                                                variant="outline" 
                                                className="h-14 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 justify-between px-3 md:px-4 group transition-all"
                                                onClick={() => openDocument(doc.url)}
                                                disabled={!doc.url}
                                            >
                                                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                                    <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 text-primary shrink-0"><doc.icon className="size-3.5 md:size-4" /></div>
                                                    <span className="text-[9px] md:text-[10px] font-black uppercase truncate">{doc.label}</span>
                                                </div>
                                                <ExternalLink className="size-3 md:size-4 text-slate-600 group-hover:text-primary transition-colors shrink-0" />
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className='flex flex-col xs:flex-row items-center justify-end gap-3 md:gap-4 pt-6 md:pt-8 border-t border-white/5'>
                                    <Button 
                                        variant="outline" 
                                        className='w-full xs:w-auto h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-black uppercase tracking-widest text-[10px] transition-all'
                                        onClick={() => handleVerifyStatus(doctor.id, 'REJECTED')}
                                    >
                                        <XIcon className='mr-2 size-4' /> Rejeter
                                    </Button>
                                    <Button 
                                        className='w-full xs:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-green-500/20 transition-all hover:scale-105'
                                        onClick={() => handleVerifyStatus(doctor.id, 'VERIFIED')}
                                    >
                                        <CheckIcon className='mr-2 size-4 md:size-5' /> Certifier
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
