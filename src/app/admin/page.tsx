import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashbardClient from "./AdminDashbardClient";

async function AdminPage() {
    const user = await currentUser();

    //user is not logged in
    if(!user) redirect("/");

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
    const userEmails = user.emailAddresses.map(e => e.emailAddress.toLowerCase());

    // user is not the admin
    if (!adminEmail || !userEmails.includes(adminEmail)) redirect ("/dashboard");

    return <AdminDashbardClient />
}

export default AdminPage;