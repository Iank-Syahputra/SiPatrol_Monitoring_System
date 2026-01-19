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
      .from('units')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`);
    }

    const { data: units, error: unitsError, count } = await query;

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return Response.json({ error: unitsError.message }, { status: 500 });
    }

    return Response.json({
      units,
      count,
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    });
  } catch (error) {
    console.error('Unexpected error in units API:', error);
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

    const { name, district } = await request.json();

    // Validate required fields
    if (!name || !district) {
      return Response.json({ error: 'Name and district are required' }, { status: 400 });
    }

    // Insert the new unit
    const { data: unit, error: unitError } = await supabaseAdmin
      .from('units')
      .insert([{ name, district }])
      .select()
      .single();

    if (unitError) {
      console.error('Error creating unit:', unitError);
      return Response.json({ error: unitError.message }, { status: 500 });
    }

    return Response.json({ unit });
  } catch (error) {
    console.error('Unexpected error in units API (POST):', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}