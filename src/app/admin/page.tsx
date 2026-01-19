import { redirect } from 'next/navigation';
import { isAdmin, getAllUnits, getLatestReports } from '@/lib/sipatrol-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Camera, Users, Building } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect('/');
  }

  // Fetch data
  const latestReports = await getLatestReports(5);
  const units = await getAllUnits();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor security reports and manage units</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
            <p className="text-xs text-muted-foreground">Active security units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Reports</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestReports.length}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patrols</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
            <p className="text-xs text-muted-foreground">Field operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Officers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Registered personnel</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Live Feed - Latest Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestReports.length > 0 ? (
              <div className="space-y-4">
                {latestReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {report.profiles?.full_name || 'Unknown User'}
                        </h3>
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent reports</p>
            )}
          </CardContent>
        </Card>

        {/* Units Management */}
        <Card>
          <CardHeader>
            <CardTitle>Units Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {units.map((unit) => (
                <div 
                  key={unit.id} 
                  className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-medium">{unit.name}</h3>
                    <p className="text-sm text-muted-foreground">{unit.district}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/units/${unit.id}`}>Manage</Link>
                  </Button>
                </div>
              ))}
            </div>
            
            <Button className="w-full mt-4" asChild>
              <Link href="/admin/units/new">Add New Unit</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}