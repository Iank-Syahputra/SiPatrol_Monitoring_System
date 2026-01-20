import { redirect } from 'next/navigation';
import { getUserProfile } from "@/lib/sipatrol-db";
import SecuritySidebar from "@/components/security-sidebar";

export default async function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SERVER SIDE: Fetch data here
  const user = await getUserProfile();

  // STRICT DATABASE SYNC: Check if profile exists
  if (!user) {
    // Profile was deleted in Supabase -> Force logout
    // We'll render a client component that performs the logout
    const ForceLogout = (await import('@/components/force-logout')).default;
    return <ForceLogout />;
  }

  // Check if user has security role
  if (user.role !== 'security') {
    redirect('/'); // Redirect if not a security user
  }

  // Pass data to Client Component as a prop
  return (
    <SecuritySidebar user={user}>
      {children}
    </SecuritySidebar>
  );
}