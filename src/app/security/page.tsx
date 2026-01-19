import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/user';
import { getUserProfile, getUserReports, getCurrentUserAssignedUnit } from '@/lib/sipatrol-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Camera, FileText, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OnlineStatusIndicator } from '@/components/online-status-indicator';

export default async function SecurityDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Get user profile to check role
  const profile = await getUserProfile(user.id);
  if (!profile || profile.role !== 'security') {
    redirect('/'); // Redirect if not a security user
  }

  // Get user's assigned unit
  const assignedUnit = await getCurrentUserAssignedUnit();

  // Get user's reports
  const reports = await getUserReports(user.id);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {profile.full_name}</p>
          </div>
          <OnlineStatusIndicator />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Unit</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedUnit ? assignedUnit.name : 'Unassigned'}
            </div>
            <p className="text-xs text-muted-foreground">
              {assignedUnit ? assignedUnit.district : 'Contact admin for assignment'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Submitted reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0
                ? new Date(reports[0].captured_at).toLocaleDateString()
                : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              Last report submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Create New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Submit a new security report with photo evidence and location data.
            </p>
            <Button asChild className="w-full">
              <Link href="/security/report">Create Report</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.slice(0, 3).map((report) => (
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
                        {new Date(report.captured_at).toLocaleDateString()}
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
                      <p className="mt-2 text-sm truncate">{report.notes}</p>
                    )}

                    {report.is_offline_submission && (
                      <Badge variant="outline" className="mt-2">Offline Submission</Badge>
                    )}
                  </div>
                ))}

                {reports.length > 3 && (
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/security/reports">View All Reports</Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No reports submitted yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}