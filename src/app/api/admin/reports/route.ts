import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);

    // 1. PARSE MULTI-SELECT PARAMS
    // Convert "id1,id2" string into ['id1', 'id2']
    const unitIds = searchParams.get('units')?.split(',').filter(Boolean) || [];
    const categoryIds = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || ''; // YYYY-MM-DD

    // 2. BUILD QUERY
    let query = supabaseAdmin
      .from('reports')
      .select(`
        *,
        profiles!inner(full_name),
        units(name, id),
        report_categories(id, name, color)
      `)
      .order('captured_at', { ascending: false });

    // 3. APPLY FILTERS (.in() for arrays)
    if (unitIds.length > 0) query = query.in('unit_id', unitIds);
    if (categoryIds.length > 0) query = query.in('report_category_id', categoryIds); // Ensure column name matches DB

    // Apply Name Search Filter
    if (search) {
      query = query.ilike('profiles.full_name', `%${search}%`);
    }

    // Apply Date Filter
    if (date) {
      // Create start and end of the selected day
      const startDate = `${date}T00:00:00.000Z`;
      const endDate = `${date}T23:59:59.999Z`;

      // Filter captured_at between start and end of that day
      query = query.gte('captured_at', startDate).lte('captured_at', endDate);
    }

    const { data: reports, error: reportsError } = await query;

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return NextResponse.json({ error: reportsError.message }, { status: 500 });
    }

    // 4. FETCH DROPDOWN OPTIONS
    const { data: units, error: unitsError } = await supabaseAdmin
      .from('units')
      .select('id, name')
      .order('name', { ascending: true });

    if (unitsError) {
      console.error('Error fetching units:', unitsError);
      return NextResponse.json({ error: unitsError.message }, { status: 500 });
    }

    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('report_categories')
      .select('id, name')
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json({ error: categoriesError.message }, { status: 500 });
    }

    return NextResponse.json({ reports, units, categories });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}