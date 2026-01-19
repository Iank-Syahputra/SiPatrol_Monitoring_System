import { NextRequest } from 'next/server';
import { getAllOfflineReports } from '@/hooks/use-offline-reports';

export async function GET(req: NextRequest) {
  try {
    // Get all offline reports from IndexedDB
    // Note: In a real implementation, this would come from the client-side IndexedDB
    // For server-side implementation, you might want to store offline data differently
    // For now, returning empty array as this is typically handled client-side
    const offlineReports = await getAllOfflineReports();
    
    return Response.json(offlineReports);
  } catch (error) {
    console.error('Error fetching offline reports:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}