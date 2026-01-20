import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/sipatrol-db";
import AdminForbidden from "@/components/admin-forbidden"; // Import the error component

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Trigger Clerk Login if not authenticated
  const { userId } = await auth();

  if (!userId) {
    // This opens the Clerk Login Form (Google/Username/Pass)
    // After success, it brings them back here
    redirect('/sign-in?redirect_url=/admin/dashboard');
  }

  // 2. Fetch User Profile from Database
  const profile = await getUserProfile();

  // 3. STRICT DATABASE SYNC: Check if profile exists
  if (!profile) {
    // Profile was deleted in Supabase -> Force logout
    // We'll render a client component that performs the logout
    const ForceLogout = (await import('@/components/force-logout')).default;
    return <ForceLogout />;
  }

  // 4. Check if Admin role
  if (profile.role !== 'admin') {
    // User logged in, but WRONG ROLE -> Show Error Screen
    return <AdminForbidden />;
  }

  // 5. User is Admin -> Show Dashboard
  return <>{children}</>;
}