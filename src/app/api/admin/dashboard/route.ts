import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server'; // Or your auth provider

export async function GET(request: Request) {
  // 1. Auth Check
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Init Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server Config Error: Missing Service Key' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    // 3. Fetch Basic Counters (Global)
    const { count: totalSecurity } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'security');
    const { count: totalReports } = await supabase.from('reports').select('*', { count: 'exact', head: true });
    const { count: totalUnits } = await supabase.from('units').select('*', { count: 'exact', head: true });

    // 4. Fetch Live Feed (Latest 5)
    const { data: recentReports } = await supabase
      .from('reports')
      .select('*, profiles(full_name), units(name), report_categories(name, color)')
      .order('captured_at', { ascending: false })
      .limit(5);

    // 5. Fetch RAW Data for Statistics (Single Query)
    let statsQuery = supabase
      .from('reports')
      .select(`
        id, captured_at,
        units (name),
        report_categories (name)
      `);

    // Apply Date Filter
    if (startDate) statsQuery = statsQuery.gte('captured_at', `${startDate}T00:00:00`);
    if (endDate) statsQuery = statsQuery.lte('captured_at', `${endDate}T23:59:59`);

    const { data: rawData, error } = await statsQuery;
    if (error) throw error;

    // 6. Aggregate Data (In-Memory Calculation)
    const globalStats = { safe_count: 0, unsafe_action_count: 0, unsafe_condition_count: 0 };
    const unitStatsMap: Record<string, any> = {};

    if (rawData) {
      rawData.forEach((report: any) => {
        const unitName = report.units?.name || 'Unknown Unit';
        const category = report.report_categories?.name?.toLowerCase() || '';

        // Init Unit
        if (!unitStatsMap[unitName]) {
          unitStatsMap[unitName] = {
            unit_name: unitName,
            total_reports: 0,
            safe_count: 0,
            unsafe_action_count: 0,
            unsafe_condition_count: 0
          };
        }

        // Increment Counts
        unitStatsMap[unitName].total_reports++;

        // Logic Matching (Flexible)
        if (category.includes('aman') && !category.includes('tidak')) {
          globalStats.safe_count++;
          unitStatsMap[unitName].safe_count++;
        } else if (category.includes('action') || category.includes('perilaku')) {
          globalStats.unsafe_action_count++;
          unitStatsMap[unitName].unsafe_action_count++;
        } else if (category.includes('condition') || category.includes('kondisi')) {
          globalStats.unsafe_condition_count++;
          unitStatsMap[unitName].unsafe_condition_count++;
        }
      });
    }

    // Sort Units by Total Reports (Highest First)
    const unitStatsArray = Object.values(unitStatsMap).sort((a: any, b: any) => b.total_reports - a.total_reports);

    return NextResponse.json({
      stats: { totalSecurity: totalSecurity || 0, totalReports: totalReports || 0, totalUnits: totalUnits || 0 },
      reports: recentReports || [],
      global_stats: globalStats,
      unit_stats: unitStatsArray
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}