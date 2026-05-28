'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface FaultWarningPanelProps {
  faults: string[];
  warnings: string[];
  loading?: boolean;
}

export default function FaultWarningPanel({
  faults,
  warnings,
  loading,
}: FaultWarningPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Faults */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm font-medium">Detected Faults</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-48">
            {faults.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground font-medium">
                No faults detected
              </div>
            ) : (
              <div className="space-y-2">
                {faults.map((fault, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-red-200 dark:border-red-800 border-l-4 border-l-red-500 p-3"
                  >
                    <div className="text-sm font-medium text-red-700 dark:text-red-300">
                      {fault}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Warnings */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium">Detected Warnings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-48">
            {warnings.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground font-medium">
                No warnings
              </div>
            ) : (
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-amber-200 dark:border-amber-800 border-l-4 border-l-amber-500 p-3"
                  >
                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {warning}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
