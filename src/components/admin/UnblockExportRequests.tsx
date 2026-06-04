"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, MessageSquare, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getUsersWithUnblockRequests, unblockUserExport } from "@/lib/actions/users";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function UnblockExportRequests() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const res = await getUsersWithUnblockRequests();
        if (res.success) {
            setUsers(res.users);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUnblock = async (userId: string) => {
        setActionId(userId);
        const res = await unblockUserExport(userId);
        if (res.success) {
            toast.success("Accès export débloqué");
            fetchData();
        } else {
            toast.error("Erreur technique");
        }
        setActionId(null);
    };

    if (loading) return (
        <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    if (users.length === 0) return null;

    return (
        <div className="space-y-6 mb-12 animate-in slide-in-from-top duration-700">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
                    <ShieldCheck className="size-5 text-amber-500" />
                </div>
                <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tight text-white">Demandes de déblocage</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Action manuelle requise pour restaurer les droits d&apos;exportation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((user) => (
                    <Card key={user.id} className="bg-slate-900/40 border-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="size-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                                        <User className="size-6 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-white text-lg tracking-tight uppercase italic truncate">{user.firstName} {user.lastName}</h3>
                                        <p className="text-[10px] text-slate-500 font-medium truncate italic">{user.email}</p>
                                    </div>
                                </div>
                                <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black uppercase tracking-widest">Compte Verrouillé</Badge>
                            </div>

                            <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-amber-500 tracking-widest">
                                    <MessageSquare className="size-3" /> Justification du patient
                                </div>
                                <p className="text-xs text-slate-300 italic leading-relaxed">&quot;{user.unblockRequestReason}&quot;</p>
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    onClick={() => handleUnblock(user.id)}
                                    disabled={actionId === user.id}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black italic rounded-xl h-12 uppercase tracking-widest shadow-lg shadow-emerald-600/20"
                                >
                                    {actionId === user.id ? <Loader2 className="animate-spin size-4" /> : <CheckCircle2 className="size-4 mr-2" />}
                                    DÉBLOQUER L&apos;ACCÈS
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
