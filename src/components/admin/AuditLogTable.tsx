import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  targetId: string;
  accessedBy: string;
  user: { email: string | null; firstName: string | null; lastName: string | null };
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">Aucun log trouvé.</div>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-widest font-black">
          <tr>
            <th className="px-6 py-4 text-left">Date</th>
            <th className="px-6 py-4 text-left">Action</th>
            <th className="px-6 py-4 text-left">Patient / Cible</th>
            <th className="px-6 py-4 text-left">Effectué par</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium">
                {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm", { locale: fr })}
              </td>
              <td className="px-6 py-4 font-bold text-primary">{log.action}</td>
              <td className="px-6 py-4">
                {log.user.firstName} {log.user.lastName} <span className="text-slate-500 text-xs">({log.user.email})</span>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-emerald-400">{log.accessedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
