"use client";

import { useEffect, useState } from "react";
import { AccessStatus, Doctor } from "@prisma/client";
import { respondToAccessRequest } from "@/lib/actions/health";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Check, X, UserPlus, Eye } from "lucide-react";
import { toast } from "sonner";
import { DoctorProfileModal } from "./DoctorProfileModal";
import { useSearchParams } from "next/navigation";

interface HealthAccessNotificationsProps {
  requests: {
    id: string;
    status: AccessStatus;
    doctor: Doctor;
  }[];
}

export function HealthAccessNotifications({ requests }: HealthAccessNotificationsProps) {
  const searchParams = useSearchParams();
  const [localRequests, setLocalRequests] = useState(requests);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const requestId = searchParams.get("requestId");
    if (requestId) {
      const request = localRequests.find(r => r.id === requestId);
      if (request && request.status === 'PENDING') {
        setSelectedRequest(request);
      }
    }
  }, [searchParams, localRequests]);

  const handleResponse = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true);
    const result = await respondToAccessRequest(requestId, status as any);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success(status === 'APPROVED' ? "Accès accordé pour 24h" : "Accès refusé");
      setLocalRequests(prev => prev.filter(r => r.id !== requestId));
      setSelectedRequest(null);
      // Remove requestId from URL
      window.history.replaceState({}, '', '/dashboard');
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
        <h2 className="text-white">Demandes d'accès au carnet (Invitations)</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingRequests.map((request: any) => (
          <Card 
            key={request.id} 
            className="border-white/5 bg-slate-900/40 backdrop-blur-md rounded-3xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => setSelectedRequest(request)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={request.doctor.imageUrl} alt={request.doctor.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20" />
                    <div>
                        <CardTitle className="text-sm font-bold text-white">Dr. {request.doctor.name}</CardTitle>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{request.doctor.speciality}</p>
                    </div>
                </div>
                <ShieldAlert className="w-4 h-4 text-amber-500 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-xs text-slate-400 mb-4">
                Souhaite consulter votre carnet de santé digital pour assurer votre suivi.
              </p>
              <div className="flex gap-2">
                <Button 
                    variant="outline"
                    size="sm" 
                    className="flex-1 border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-xl h-9 text-xs font-bold gap-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                    }}
                >
                    <Eye className="w-3 h-3" /> VOIR PROFIL
                </Button>
                <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-9 text-xs font-black italic gap-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                    }}
                >
                    RÉPONDRE
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRequest && (
        <DoctorProfileModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          doctor={selectedRequest.doctor}
          onApprove={() => handleResponse(selectedRequest.id, 'APPROVED')}
          onReject={() => handleResponse(selectedRequest.id, 'REJECTED')}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
