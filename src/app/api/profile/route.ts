import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { id, full_name, role, assigned_unit_id } = await request.json();

    // Verify that the user ID matches the authenticated user
    if (id !== userId) {
      return Response.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Insert the profile into the database
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id,
          full_name,
          role,
          assigned_unit_id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in profile creation:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}