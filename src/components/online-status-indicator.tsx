'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useOfflineReports } from '@/hooks/use-offline-reports';
import { useAutoSync } from '@/hooks/use-auto-sync';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';

export function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isSignedIn } = useUser();
  const { offlineReports } = useOfflineReports();
  const { isSyncing, lastSync } = useAutoSync();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-3">
      <Badge variant={isOnline ? "default" : "destructive"}>
        {isOnline ? (
          <>
            <Wifi className="mr-1 h-3 w-3" /> Online
          </>
        ) : (
          <>
            <WifiOff className="mr-1 h-3 w-3" /> Offline
          </>
        )}
      </Badge>
      
      {offlineReports.length > 0 && (
        <Badge variant="outline">
          <RefreshCw className={`mr-1 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {offlineReports.length} pending
        </Badge>
      )}
      
      {lastSync && (
        <Badge variant="secondary" className="text-xs">
          Last sync: {lastSync.toLocaleTimeString()}
        </Badge>
      )}
    </div>
  );
}