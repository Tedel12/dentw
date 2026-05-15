"use client"

import { useUpdateDoctor } from "@/hooks/use-doctors";
import { formatPhoneNumber } from "@/lib/utils";
import { Doctor, Gender } from "@prisma/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface EditDoctorDialogProps {
  isOpen: boolean,
  onClose: () => void;
  doctor: Doctor | null;
}

function EditDoctorDialog ({ doctor, isOpen, onClose} : EditDoctorDialogProps) {
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(doctor);

  const updateDoctorMutation = useUpdateDoctor();

  const  handlePhoneChange = (value: string) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    if (editingDoctor) {
      setEditingDoctor({ ...editingDoctor, phone: formattedPhoneNumber });
    }
  };


  const handleSave = () => {
    if (editingDoctor) {
      updateDoctorMutation.mutate({ ...editingDoctor }, { onSuccess: () => { handleClose(); onClose(); } });
    }
  }


  const handleClose = () => {
    onClose();
    setEditingDoctor(null);
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
       <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Mettre à jour un médécin</DialogTitle>
                    <DialogDescription>Mettez à jour les informations et le statut du docteur dans votre cabinet.</DialogDescription>
                </DialogHeader>

                {editingDoctor && (
                  <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className="space-y-2">
                        <Label htmlFor='name'>Nom complet *</Label>
                        <Input id='name' value={editingDoctor.name} onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor='speciality'>Spécialité *</Label>
                        <Input id='speciality' value={editingDoctor.speciality} onChange={(e) => setEditingDoctor({ ...editingDoctor, speciality: e.target.value })} />
                      </div>
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor='email'>Email *</Label>
                    <Input id='email' type='email' value={editingDoctor.email} onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor='phone'>Téléphone</Label>
                    <Input id='phone' value={editingDoctor.phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                  </div>



                  <div className='grid grid-cols-2 gap-4'>
                    <div className="space-y-2">
                      <Label htmlFor='new-gender'>Sexe *</Label>
                      <Select
                          value={editingDoctor.gender || ""}
                          onValueChange={(value) => setEditingDoctor({ ...editingDoctor, gender: value as Gender})}
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
                      <Label htmlFor='status'>Statut *</Label>
                      <Select
                          value={editingDoctor.isActive ? "actif" : 'inactif'}
                          onValueChange={(value) => setEditingDoctor({ ...editingDoctor, isActive: value === "actif" })}
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
                )}

                <DialogFooter>
                  <Button variant='outline' onClick={handleClose}>
                      Annuler
                  </Button>

                  <Button
                      onClick={handleSave}
                      className='bg-primary hover:bg-primary/90'
                      disabled={updateDoctorMutation.isPending}
                  >
                      {updateDoctorMutation.isPending ? 'En cours' : 'Mettre à jour'}
                  </Button>
                </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}


export default EditDoctorDialog