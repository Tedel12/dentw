"use client"

import { useState } from 'react'
import { Gender } from '@prisma/client'
import { useCreateDoctor } from '@/hooks/use-doctors';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { formatPhoneNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface AddDoctorDialogProps {
    isOpen: boolean,
    onClose: () => void;
}

function AddDoctorDialog({ isOpen, onClose} : AddDoctorDialogProps) {
    const [newDoctor, setNewDoctor] = useState({
        name: "",
        email: "",
        phone: "",
        speciality: "",
        gender: "MALE" as Gender,
        isActive: true,
        licenseNumber: "",
        workplaceType: "Cabinet Privé",
        practiceAddress: "",
    });

    const createDoctorMutation = useCreateDoctor()

    const handlePhoneChange = (value:string) => {
        const formattedPhoneNumber = formatPhoneNumber(value)
        setNewDoctor({...newDoctor, phone: formattedPhoneNumber})
    }

    const handleSave = () => {
        if (!newDoctor.practiceAddress) {
            toast.error("L'adresse du cabinet est obligatoire");
            return;
        }

        createDoctorMutation.mutate({...newDoctor }, { 
            onSuccess: () => { 
                toast.success("Praticien ajouté avec succès");
                handleClose(); 
                onClose(); 
            },
            onError: (error: any) => {
                toast.error(error.message || "Erreur lors de l'ajout");
            }
        });
    }

    const handleClose = () => {
        onClose();
        setNewDoctor({
            name: "",
            email: "",
            phone: "",
            speciality: "",
            gender: "MALE" as Gender,
            isActive: true,
            licenseNumber: "",
            workplaceType: "Cabinet Privé",
            practiceAddress: "",
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Ajoutez un praticien</DialogTitle>
                    <DialogDescription>Inscrivez manuellement un nouveau professionnel de santé.</DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className="space-y-2">
                            <Label htmlFor='new-name'>Nom complet *</Label>
                            <Input id='new-name' value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} placeholder='Dr. Jean Agossou' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor='new-speciality'>Spécialité *</Label>
                            <Input id='new-speciality' value={newDoctor.speciality} onChange={(e) => setNewDoctor({ ...newDoctor, speciality: e.target.value })} placeholder='Médecine générale' />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor='new-email'>Email professionnel *</Label>
                        <Input id='new-email' type='email' value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} placeholder='doctor@ex.com' />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className="space-y-2">
                            <Label htmlFor='new-license'>Numéro de licence *</Label>
                            <Input id='new-license' value={newDoctor.licenseNumber} onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })} placeholder='Ex: 1000123' />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor='new-workplace'>Lieu de travail</Label>
                            <Select
                                value={newDoctor.workplaceType}
                                onValueChange={(value) => setNewDoctor({ ...newDoctor, workplaceType: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Cabinet Privé'>Cabinet Privé</SelectItem>
                                    <SelectItem value='Clinique'>Clinique</SelectItem>
                                    <SelectItem value='Centre de Santé Public'>Centre de Santé Public</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor='new-address'>Adresse du Cabinet *</Label>
                        <Input id='new-address' value={newDoctor.practiceAddress} onChange={(e) => setNewDoctor({ ...newDoctor, practiceAddress: e.target.value })} placeholder='Cotonou, Avenue de la Paix' />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor='new-phone'>Téléphone</Label>
                        <Input id='new-phone' value={newDoctor.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder='(229) 01 90909012' />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className="space-y-2">
                            <Label htmlFor='new-gender'>Sexe *</Label>
                            <Select
                                value={newDoctor.gender || ""}
                                onValueChange={(value) => setNewDoctor({ ...newDoctor, gender: value as Gender})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sexe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='MALE'>Masculin</SelectItem>
                                    <SelectItem value='FEMALE'>Féminin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor='new-status'>Statut *</Label>
                            <Select
                                value={newDoctor.isActive ? "actif" : 'inactif'}
                                onValueChange={(value) => setNewDoctor({ ...newDoctor, isActive: value === "actif" })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='actif'>Actif</SelectItem>
                                    <SelectItem value='inactif'>Inactif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>


                <DialogFooter>
                    <Button variant='outline' onClick={handleClose}>
                        Annuler
                    </Button>

                    <Button
                        onClick={handleSave}
                        className='bg-primary hover:bg-primary/90'
                        disabled={!newDoctor.name || !newDoctor.email || !newDoctor.speciality || !newDoctor.licenseNumber || !newDoctor.practiceAddress || createDoctorMutation.isPending}
                    >
                        {createDoctorMutation.isPending ? 'En cours...' : 'Ajouter'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
  


export default AddDoctorDialog