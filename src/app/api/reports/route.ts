import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/user';
import { getCurrentUserAssignedUnit } from '@/lib/sipatrol-db';
import { createReport } from '@/lib/sipatrol-db';

export async function POST(req: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a security officer
    const assignedUnit = await getCurrentUserAssignedUnit();
    if (!assignedUnit) {
      return Response.json({ error: 'User not assigned to any unit' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { imageData, notes, latitude, longitude, capturedAt } = body;

    // Validate required fields
    if (!imageData || !latitude || !longitude || !capturedAt) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload image to Supabase storage (in a real implementation)
    // For now, we'll just store the image data as a placeholder
    // In a production app, you'd upload to Supabase storage and get a URL
    
    // Create the report in the database
    const report = await createReport({
      user_id: user.id,
      unit_id: assignedUnit.id,
      image_path: imageData, // In production, this would be the URL from Supabase storage
      notes,
      latitude,
      longitude,
      captured_at: capturedAt,
      is_offline_submission: false
    });

    return Response.json({ success: true, report });
  } catch (error) {
    console.error('Error creating report:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}