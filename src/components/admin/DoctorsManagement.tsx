"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useGetDoctors } from '@/hooks/use-doctors'
import { EditIcon, MailIcon, PhoneIcon, PlusIcon, HeartPulse, CheckIcon, XIcon, ShieldCheckIcon, ShieldAlertIcon, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import AddDoctorDialog from './AddDoctorDialog'
import EditDoctorDialog from './EditDoctorDialog'
import { Doctor } from '@prisma/client'
import { verifyDoctorStatus } from '@/lib/actions/doctors'
import { toast } from 'sonner'

const DoctorsManagement = () => {
    const {data: doctors = [], refetch} = useGetDoctors()

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const handleEditDoctor = (doctor:Doctor) => {
        setSelectedDoctor(doctor);
        setIsEditDialogOpen(true)
    }

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setSelectedDoctor(null)
    }

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

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1'><ShieldCheckIcon className='size-3' /> Vérifié</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className='gap-1'><ShieldAlertIcon className='size-3' /> Rejeté</Badge>;
            default:
                return <Badge variant="outline" className='bg-amber-50 text-amber-700 border-amber-200 animate-pulse gap-1'><Clock className='size-3' /> En attente</Badge>;
        }
    }


  return (
    <>
        <Card className='mb-12'>
            <CardHeader className='flex items-center justify-between'>
                <div>
                    <CardTitle className='flex items-center gap-2'>
                        <HeartPulse className='size-5 text-primary' />
                        Gestion des praticiens
                    </CardTitle>
                    <CardDescription>Gérez et supervisez tous les praticiens certifiés sur Benin Santé.</CardDescription>
                </div>

                <Button onClick={() => setIsAddDialogOpen(true)} className='bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/100'>
                    <PlusIcon className='mr-2 size-4' />
                    Ajouter un médecin
                </Button>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {doctors.map((doctor: any) => (
                        <div
                            key={doctor.id}
                            className='flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50'
                        >
                            <div className='flex items-center gap-4'>
                                <Image
                                    src={doctor.imageUrl}
                                    alt={doctor.name}
                                    width={48}
                                    height={48}
                                    className='size-12 rounded-full object-cover ring-2 ring-background'
                                />

                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{doctor.name}</div>
                                        {getVerificationBadge(doctor.verificationStatus)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {doctor.speciality}

                                        <span className='ml-2 px-2 py-0.5 bg-muted rounded text-xs'>
                                            {doctor.gender === "MALE" ? "Masculin" : "Féminin"}
                                        </span>         
                                    </div>

                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MailIcon className='h-3 w-3' />
                                            {doctor.email}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <PhoneIcon className='h-3 w-3' />
                                            {doctor.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-center gap-3'>
                                {doctor.verificationStatus === 'PENDING' && (
                                    <div className='flex items-center gap-1 mr-2'>
                                        <Button 
                                            size="sm" 
                                            title="Approuver"
                                            className="h-8 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleVerifyStatus(doctor.id, 'VERIFIED')}
                                        >
                                            <CheckIcon className="size-4" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            title="Rejeter"
                                            variant="outline"
                                            className="h-8 text-destructive border-destructive hover:bg-destructive/10"
                                            onClick={() => handleVerifyStatus(doctor.id, 'REJECTED')}
                                        >
                                            <XIcon className="size-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="font-semibold text-primary">{doctor.appointmentCount}</div>
                                    <div className="text-xs text-muted-foreground">Rendez-vous</div>
                                </div>

                                {doctor.isActive ? (
                                    <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Actif</Badge>
                                ) : (
                                    <Badge variant='secondary'>Inactif</Badge>
                                )}
                                <Button size="sm" variant="outline" className='h-8 px-3' onClick={() => handleEditDoctor(doctor)}>
                                    <EditIcon className='size-4 mr-1' />
                                    Editer
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <AddDoctorDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />
        <EditDoctorDialog 
            key={selectedDoctor?.id}
            isOpen={isEditDialogOpen} onClose={handleCloseEditDialog}
            doctor={selectedDoctor}
        />
    </>
  )
}

export default DoctorsManagement