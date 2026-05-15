import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAuditLogs } from "@/lib/actions/security";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import Navbar from "@/components/Navbar";

async function AuditPage() {
    const user = await currentUser();

    if (!user) redirect("/");

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!adminEmail || userEmail !== adminEmail) redirect("/dashboard");

    const { logs, success } = await getAuditLogs();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
                <div className="mb-8">
                    <h1 className="text-3xl font-black italic">Audit de Sécurité</h1>
                    <p className="text-muted-foreground">Historique des accès aux données sensibles.</p>
                </div>
                {success ? (
                    <AuditLogTable logs={logs as any} />
                ) : (
                    <div className="text-red-500">Erreur lors du chargement des logs.</div>
                )}
            </div>
        </div>
    );
}

export default AuditPage;
