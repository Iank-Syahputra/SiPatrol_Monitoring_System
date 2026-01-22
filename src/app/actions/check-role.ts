"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function checkRoleAndRedirect() {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Not Authenticated" };
  }

  // Initialize Admin Client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch Profile using Admin Client (Bypass RLS for check)
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // If no profile, maybe guide to onboarding or show error
    return { error: "Profile not found" };
  }

  // Perform Redirect based on Role
  if (profile.role === 'admin') {
    redirect('/admin/users');
  } else if (profile.role === 'security') {
    redirect('/security');
  } else {
    redirect('/');
  }
}