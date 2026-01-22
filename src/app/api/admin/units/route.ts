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

export async function PUT(request: NextRequest) {
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

    const { id, name, district } = await request.json();

    // Validate required fields
    if (!id || !name || !district) {
      return Response.json({ error: 'ID, name, and district are required' }, { status: 400 });
    }

    // Update the unit
    const { data: unit, error: unitError } = await supabaseAdmin
      .from('units')
      .update({ name, district })
      .eq('id', id)
      .select()
      .single();

    if (unitError) {
      console.error('Error updating unit:', unitError);
      return Response.json({ error: unitError.message }, { status: 500 });
    }

    return Response.json({ unit });
  } catch (error) {
    console.error('Unexpected error in units API (PUT):', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // Parse the request body to get the unit ID
    const { id } = await request.json();

    // Validate required field
    if (!id) {
      return Response.json({ error: 'Unit ID is required' }, { status: 400 });
    }

    // 1. Delete all reports associated with this unit_id
    const { error: reportsError } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('unit_id', id);

    if (reportsError) {
      console.error('Error deleting reports for unit:', reportsError);
      return Response.json({ error: reportsError.message }, { status: 500 });
    }

    // 2. Delete all unit_locations associated with this unit_id
    const { error: locationsError } = await supabaseAdmin
      .from('unit_locations')
      .delete()
      .eq('unit_id', id);

    if (locationsError) {
      console.error('Error deleting unit locations for unit:', locationsError);
      return Response.json({ error: locationsError.message }, { status: 500 });
    }

    // 3. Update all profiles that are assigned to this unit (set assigned_unit_id to null)
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .update({ assigned_unit_id: null })
      .eq('assigned_unit_id', id);

    if (profilesError) {
      console.error('Error updating profiles for unit:', profilesError);
      return Response.json({ error: profilesError.message }, { status: 500 });
    }

    // 4. Finally, delete the unit itself
    const { error: unitError } = await supabaseAdmin
      .from('units')
      .delete()
      .eq('id', id);

    if (unitError) {
      console.error('Error deleting unit:', unitError);
      return Response.json({ error: unitError.message }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Unit and all associated data deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in units API (DELETE):', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}