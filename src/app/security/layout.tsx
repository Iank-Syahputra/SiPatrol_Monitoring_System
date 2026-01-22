import { redirect } from 'next/navigation';
import { getUserProfile } from "@/lib/sipatrol-db";
import SecuritySidebar from "@/components/security-sidebar";

// Helper function to wait for profile creation to complete
// Same retry logic as check-auth page
async function waitForProfile(maxAttempts = 10, delayMs = 500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Security Layout] Profile check attempt ${attempt}/${maxAttempts}`);
    
    const profile = await getUserProfile();
    
    if (profile) {
      console.log('[Security Layout] ✓ Profile found:', profile.role);
      return profile;
    }
    
    if (attempt < maxAttempts) {
      console.log(`[Security Layout] Profile not found, waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log('[Security Layout] ✗ Profile not found after all retry attempts');
  return null;
}

export default async function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[Security Layout] === Started ===');
  
  // Wait for profile to be created (with retry logic)
  const user = await waitForProfile(10, 500); // 10 attempts × 500ms = 5 seconds max

  // STRICT DATABASE SYNC: Check if profile exists after all retries
  if (!user) {
    console.error('[Security Layout] Profile does not exist after retries, forcing logout');
    // Profile was deleted or never created in Supabase -> Force logout
    const ForceLogout = (await import('@/components/force-logout')).default;
    return <ForceLogout />;
  }

  // Check if user has security role
  if (user.role !== 'security') {
    console.log('[Security Layout] User role is not security, redirecting to home');
    redirect('/'); // Redirect if not a security user
  }

  console.log('[Security Layout] ✓ Rendering for user:', user.full_name);

  // Pass user data to Client Component sidebar
  return (
    <SecuritySidebar user={user}>
      {children}
    </SecuritySidebar>
  );
}