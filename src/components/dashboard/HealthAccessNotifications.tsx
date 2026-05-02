"use client";

import { useState } from "react";
import { AccessStatus, Doctor } from "@prisma/client";
import { respondToAccessRequest } from "@/lib/actions/health";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Check, X, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface HealthAccessNotificationsProps {
  requests: {
    id: string;
    status: AccessStatus;
    doctor: Doctor;
  }[];
}

export function HealthAccessNotifications({ requests }: HealthAccessNotificationsProps) {
  const [localRequests, setLocalRequests] = useState(requests);

  const handleResponse = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const result = await respondToAccessRequest(requestId, status as any);
    if (result.success) {
      toast.success(status === 'APPROVED' ? "Accès accordé pour 24h" : "Accès refusé");
      setLocalRequests(prev => prev.filter(r => r.id !== requestId));
    } else {
      toast.error("Une erreur est survenue");
    }
  };

  const pendingRequests = localRequests.filter(r => r.status === 'PENDING');

  if (pendingRequests.length === 0) return null;

  return (
    <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 text-primary font-semibold">
        <UserPlus className="w-5 h-5" />
        <h2>Demandes d'accès au carnet (Invitations)</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingRequests.map((request: any) => (
          <Card key={request.id} className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Dr. {request.doctor.name}</CardTitle>
                <ShieldAlert className="w-4 h-4 text-primary" />
              </div>
              <CardDescription>
                Souhaite consulter votre carnet de santé digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleResponse(request.id, 'APPROVED')}
              >
                <Check className="w-4 h-4" /> Accepter
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-1 text-destructive hover:text-destructive"
                onClick={() => handleResponse(request.id, 'REJECTED')}
              >
                <X className="w-4 h-4" /> Refuser
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
