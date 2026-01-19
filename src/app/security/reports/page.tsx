import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/user';
import { getUserProfile, getUserReports } from '@/lib/sipatrol-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Camera, FileText } from 'lucide-react';

export default async function MyReportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Get user profile to check role
  const profile = await getUserProfile(user.id);
  if (!profile || profile.role !== 'security') {
    redirect('/'); // Redirect if not a security user
  }

  // Get user's reports
  const reports = await getUserReports(user.id);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Reports</h1>
        <p className="text-muted-foreground">View your submitted security reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className="border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Report #{report.id.substring(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {report.units?.name || 'Unknown Unit'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(report.captured_at).toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    {report.latitude && report.longitude && (
                      <>
                        <MapPin className="h-4 w-4" />
                        <span>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</span>
                      </>
                    )}
                  </div>
                  
                  {report.notes && (
                    <p className="mt-2 text-sm">{report.notes}</p>
                  )}
                  
                  {report.image_path && (
                    <div className="mt-2">
                      <img 
                        src={report.image_path} 
                        alt="Report evidence" 
                        className="w-full max-h-40 object-cover rounded-md"
                      />
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Submitted: {new Date(report.created_at).toLocaleString()}</span>
                    {report.is_offline_submission && (
                      <Badge variant="outline">Offline Submission</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No reports yet</h3>
              <p className="text-muted-foreground mt-2">
                You haven't submitted any security reports yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}