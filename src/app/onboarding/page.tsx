'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const [fullName, setFullName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create user profile with security role via API call
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          full_name: fullName,
          role: 'security',
          assigned_unit_id: unitName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      // Redirect to security dashboard
      router.push('/security');
      router.refresh(); // Refresh to ensure the new profile is recognized
    } catch (err) {
      console.error('Error during onboarding:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to SiPatrol</CardTitle>
          <CardDescription className="text-zinc-400">
            Complete your profile to access the security dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitName">Unit Assignment</Label>
              <Input
                id="unitName"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Enter your assigned unit"
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-200"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Complete Setup'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-zinc-500">
            You'll be redirected to the Security Dashboard after setup
          </div>
        </CardContent>
      </Card>
    </div>
  );
}