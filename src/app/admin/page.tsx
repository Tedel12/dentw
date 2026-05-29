import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashbardClient from "./AdminDashbardClient";

async function AdminPage() {
    const user = await currentUser();

    //user is not logged in
    if(!user) redirect("/");

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    const userEmails = user.emailAddresses.map(e => e.emailAddress.trim().toLowerCase());

    // user is not the admin
    if (!adminEmail || !userEmails.includes(adminEmail)) {
        console.log("Admin access denied for:", userEmails, "Expected:", adminEmail);
        redirect ("/dashboard");
    }

    return <AdminDashbardClient />
}

export default AdminPage;