'use client';

import { useAppStore } from '@/lib/store';

interface StatusIndicatorProps {
  timestamp: string;
}

export default function StatusIndicator({ timestamp }: StatusIndicatorProps) {
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const isOnline = connectionStatus === 'online';

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          } ${isOnline ? 'animate-pulse' : ''}`}
        />
        <span
          className={`text-sm font-medium ${
            isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>
      <div className="text-sm text-muted-foreground font-medium">
        {timestamp}
      </div>
    </div>
  );
}
