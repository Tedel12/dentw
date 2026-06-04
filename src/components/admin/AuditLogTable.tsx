import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Info, ShieldCheck, Eye, FileText, Lock, ShieldAlert } from "lucide-react";
import { Badge } from "../ui/badge";

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  targetId: string;
  accessedBy: string;
  user: { email: string | null; firstName: string | null; lastName: string | null };
}

const ACTION_LEGEND: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  "VIEW_HEALTH_DATA": { 
    label: "Accès Carnet", 
    icon: Eye, 
    color: "text-blue-400", 
    desc: "Un praticien a consulté le dossier médical complet du patient." 
  },
  "EXPORT_PDF": { 
    label: "Export PDF", 
    icon: FileText, 
    color: "text-amber-400", 
    desc: "Le carnet de santé a été exporté sous format PDF sécurisé." 
  },
  "PIN_VERIFICATION_SUCCESS": { 
    label: "Auth PIN OK", 
    icon: ShieldCheck, 
    color: "text-emerald-400", 
    desc: "Le patient a réussi son authentification par code PIN." 
  },
  "PIN_VERIFICATION_FAILURE": { 
    label: "Échec PIN", 
    icon: ShieldAlert, 
    color: "text-red-400", 
    desc: "Tentative d'accès au carnet avec un code PIN incorrect." 
  },
  "UPDATE_SECURITY_PIN": { 
    label: "Changement PIN", 
    icon: Lock, 
    color: "text-purple-400", 
    desc: "Le code PIN de sécurité a été mis à jour par l'utilisateur." 
  }
};

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return <div className="text-center py-10 text-muted-foreground italic uppercase font-black text-xs opacity-30">Aucun log enregistré.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* LÉGENDE */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-6">
            <Info className="size-4" /> Comprendre les actions du système
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Object.entries(ACTION_LEGEND).map(([key, item]) => (
                <div key={key} className="flex gap-3">
                    <div className={`size-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0`}>
                        <item.icon className={`size-4 ${item.color}`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{item.label}</p>
                        <p className="text-[9px] text-slate-500 italic leading-snug">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* TABLEAU */}
      <div className="rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-slate-500 uppercase text-[9px] font-black tracking-[0.2em] border-b border-white/5">
                <tr>
                    <th className="px-6 py-5">Date & Heure</th>
                    <th className="px-6 py-5">Action réalisée</th>
                    <th className="px-6 py-5">Sujet (Patient)</th>
                    <th className="px-6 py-5">Auteur de l'action</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                {logs.map((log) => {
                    const config = ACTION_LEGEND[log.action] || { 
                        label: log.action, 
                        icon: Info, 
                        color: "text-slate-400", 
                        desc: "Action système enregistrée" 
                    };
                    const Icon = config.icon;

                    return (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-xs">{format(new Date(log.timestamp), "dd MMM yyyy", { locale: fr })}</span>
                                    <span className="text-[10px] text-slate-500 font-medium italic">{format(new Date(log.timestamp), "HH:mm:ss")}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <Icon className={`size-3.5 ${config.color}`} />
                                    <Badge variant="outline" className={`bg-white/5 border-white/10 text-[9px] font-black uppercase px-2 py-0.5 ${config.color}`}>
                                        {config.label}
                                    </Badge>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex flex-col min-w-[150px]">
                                    <span className="font-black text-slate-200 uppercase tracking-tight text-xs">
                                        {log.user.firstName} {log.user.lastName}
                                    </span>
                                    <span className="text-[10px] text-slate-600 truncate italic">{log.user.email}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-[11px] font-bold text-emerald-400/90 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                    {log.accessedBy}
                                </span>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
