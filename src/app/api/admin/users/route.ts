import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Extract query parameters
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build the query
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        units(name)
      `, { count: 'exact' })
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`
      );
    }

    const { data: profiles, error: profilesError, count } = await query;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return Response.json({ error: profilesError.message }, { status: 500 });
    }

    // Fetch all units for dropdown options
    const { data: units, error: unitsError } = await supabaseAdmin
      .from('units')
      .select('id, name');

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return Response.json({ error: unitsError.message }, { status: 500 });
    }

    return Response.json({
      profiles,
      units,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Unexpected error in users API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { full_name, role, assigned_unit_id } = await request.json();

    // Validate required fields
    if (!full_name || !role) {
      return Response.json({ error: 'Full name and role are required' }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'security'].includes(role)) {
      return Response.json({ error: 'Invalid role. Must be "admin" or "security"' }, { status: 400 });
    }

    // Insert the new user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: crypto.randomUUID(), // Generate a new ID for the profile
        full_name,
        role,
        assigned_unit_id: assigned_unit_id || null
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    return Response.json({ profile });
  } catch (error) {
    console.error('Unexpected error in users API (POST):', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}