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

  // Check if user exists and has security role
  if (!user || user.role !== 'security') {
    redirect('/'); // Redirect if not a security user
  }

  // Pass data to Client Component as a prop
  return (
    <SecuritySidebar user={user}>
      {children}
    </SecuritySidebar>
  );
}