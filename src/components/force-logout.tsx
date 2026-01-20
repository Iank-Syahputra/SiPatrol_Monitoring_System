'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function ForceLogout() {
  const { signOut } = useAuth();

  useEffect(() => {
    // Immediately sign out the user when this component is rendered
    const performLogout = async () => {
      await signOut({
        redirectUrl: '/', // Redirect to home page after logout
      });
    };

    performLogout();
  }, [signOut]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Logging you out...</p>
        <p className="text-sm text-zinc-400 mt-2">Your session has expired due to account changes</p>
      </div>
    </div>
  );
}