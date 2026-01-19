import { redirect } from 'next/navigation';
import { isAdmin, getAllUnits, createUnit } from '@/lib/sipatrol-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default async function NewUnitPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect('/');
  }

  const createUnitAction = async (formData: FormData) => {
    'use server';
    
    const name = formData.get('name') as string;
    const district = formData.get('district') as string;
    
    if (!name || !district) {
      return { error: 'Name and district are required' };
    }
    
    try {
      await createUnit({ name, district });
      redirect('/admin/units');
    } catch (error) {
      return { error: 'Failed to create unit' };
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Unit</h1>
        <p className="text-muted-foreground">Create a new security unit</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUnitAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Enter unit name (e.g., PLN UP 1 Kendari)" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input 
                id="district" 
                name="district" 
                placeholder="Enter district" 
                required 
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <a href="/admin/units">Cancel</a>
              </Button>
              <Button type="submit">Create Unit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}