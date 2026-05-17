'use client';

interface StatusIndicatorProps {
  timestamp: string;
  isOffline?: boolean;
}

export default function StatusIndicator({ timestamp, isOffline = false }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            isOffline ? 'bg-red-500' : 'bg-green-500'
          } ${isOffline ? '' : 'animate-pulse'}`}
        />
        <span
          className={`text-sm font-medium ${
            isOffline ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}
        >
          {isOffline ? 'OFFLINE' : 'ONLINE'}
        </span>
      </div>
      <div className="text-sm text-muted-foreground font-medium">
        {timestamp}
      </div>
    </div>
  );
}
