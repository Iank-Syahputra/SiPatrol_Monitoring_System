import { redirect } from 'next/navigation';
import { isAdmin, getAllUnits, createUnit, updateUnit } from '@/lib/sipatrol-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function UnitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Check if user is admin
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect('/');
  }

  // Fetch units to find the specific one
  const units = await getAllUnits();
  const unit = units.find(u => u.id === params.id);
  
  if (!unit) {
    notFound();
  }

  const updateUnitAction = async (formData: FormData) => {
    'use server';
    
    const name = formData.get('name') as string;
    const district = formData.get('district') as string;
    const unitId = formData.get('unitId') as string;
    
    if (!name || !district) {
      return { error: 'Name and district are required' };
    }
    
    try {
      await updateUnit(unitId, { name, district });
      redirect('/admin/units');
    } catch (error) {
      return { error: 'Failed to update unit' };
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Unit</h1>
        <p className="text-muted-foreground">Update unit information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateUnitAction} className="space-y-4">
            <input type="hidden" name="unitId" value={unit.id} />
            
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={unit.name}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input 
                id="district" 
                name="district" 
                defaultValue={unit.district}
                required 
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <a href="/admin/units">Cancel</a>
              </Button>
              <Button type="submit">Update Unit</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}