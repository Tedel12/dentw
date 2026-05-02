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
    Clock 
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

    if (pendingRequests.length === 0) return null;

    return (
        <Card className='mb-12 border-amber-200 bg-amber-50/5 shadow-xl shadow-amber-500/5 overflow-hidden rounded-[2rem]'>
            <CardHeader className='border-b border-amber-100 bg-amber-50/20 p-8'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-amber-100 rounded-2xl shadow-inner'>
                        <ShieldAlertIcon className='size-8 text-amber-600' />
                    </div>
                    <div>
                        <CardTitle className='text-3xl font-black italic tracking-tighter'>Demandes de Validation</CardTitle>
                        <CardDescription className='text-amber-700/70 font-bold uppercase tracking-widest text-xs mt-1'>
                            {pendingRequests.length} praticien(s) en attente de certification
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className='p-8 bg-background/50'>
                <div className="grid gap-8">
                    {pendingRequests.map((doctor: any) => (
                        <div
                            key={doctor.id}
                            className='bg-background rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:shadow-xl hover:border-amber-200 transition-all duration-500 group'
                        >
                            {/* PHOTO ET INFOS DE BASE */}
                            <div className='p-8 lg:w-1/3 bg-muted/20 border-r border-border/50 flex flex-col items-center text-center space-y-6'>
                                <div className='relative'>
                                    <div className='absolute inset-0 bg-amber-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform'></div>
                                    <Image
                                        src={doctor.imageUrl}
                                        alt={doctor.name}
                                        width={120}
                                        height={120}
                                        className='size-32 rounded-full object-cover ring-4 ring-background shadow-2xl relative z-10'
                                    />
                                    <div className='absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full border-4 border-background z-20 shadow-lg'>
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
                                    <div className='flex items-center gap-3 justify-center text-muted-foreground hover:text-primary transition-colors'>
                                        <div className='p-1.5 bg-background rounded-lg border'><MailIcon className='size-4' /></div>
                                        <span className='font-medium'>{doctor.email}</span>
                                    </div>
                                    <div className='flex items-center gap-3 justify-center text-muted-foreground hover:text-primary transition-colors'>
                                        <div className='p-1.5 bg-background rounded-lg border'><PhoneIcon className='size-4' /></div>
                                        <span className='font-medium'>{doctor.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DÉTAILS PROFESSIONNELS */}
                            <div className='p-8 lg:flex-1 flex flex-col'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                                    <div className='space-y-3'>
                                        <span className='text-[11px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2'>
                                            <BadgeCheckIcon className='size-4' /> Numéro de Licence (RPPS)
                                        </span>
                                        <div className='font-mono font-black text-lg bg-primary/5 p-4 rounded-2xl border-2 border-dashed border-primary/20 text-primary shadow-inner'>
                                            {doctor.licenseNumber || "NON RENSEIGNÉ"}
                                        </div>
                                    </div>
                                    <div className='space-y-3'>
                                        <span className='text-[11px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2'>
                                            <MapPinIcon className='size-4' /> Établissement d'exercice
                                        </span>
                                        <div className='font-black p-4 bg-muted/50 rounded-2xl border border-border/50 text-foreground'>
                                            {doctor.workplaceType || "Cabinet Privé"}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3 flex-1'>
                                    <span className='text-[11px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2'>
                                        <FileTextIcon className='size-4' /> Expertise & Biographie
                                    </span>
                                    <div className='text-base text-muted-foreground leading-relaxed italic bg-muted/10 p-6 rounded-[2rem] border border-border/50 relative'>
                                        <div className='absolute top-4 right-6 text-4xl text-primary/10 font-serif'>""</div>
                                        {doctor.bio}
                                    </div>
                                </div>

                                <div className='flex items-center justify-end gap-4 pt-8 mt-8 border-t border-border/50'>
                                    <Button 
                                        variant="outline" 
                                        className='h-14 px-8 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-black uppercase tracking-widest text-xs transition-all duration-300'
                                        onClick={() => handleVerifyStatus(doctor.id, 'REJECTED')}
                                    >
                                        <XIcon className='mr-2 size-4' /> Rejeter
                                    </Button>
                                    <Button 
                                        className='h-14 px-10 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105'
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
