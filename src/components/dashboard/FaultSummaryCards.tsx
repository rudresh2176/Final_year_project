'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertTriangle, ShieldAlert, Gauge } from 'lucide-react';

interface FaultSummaryCardsProps {
  status: string;
  faultCount: number;
  warningCount: number;
  severity: string;
  loading?: boolean;
}

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return 'text-red-600 dark:text-red-400';
  if (s === 'warning') return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
}

function statusBg(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
  if (s === 'warning') return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
  return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
}

function severityBadge(severity: string) {
  const s = severity.toLowerCase();
  if (s === 'high')
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800">{severity}</Badge>;
  if (s === 'medium')
    return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800">{severity}</Badge>;
  if (s === 'low')
    return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">{severity}</Badge>;
  return <Badge className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800">{severity}</Badge>;
}

export default function FaultSummaryCards({
  status,
  faultCount,
  warningCount,
  severity,
  loading,
}: FaultSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Status Card */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Status</span>
          </div>
          <div className={`rounded-lg border p-3 ${statusBg(status)}`}>
            <div className={`text-lg font-medium ${statusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faults Count */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Faults</span>
          </div>
          <div className="rounded-lg border p-3">
            <div
              className={`text-lg font-medium ${
                faultCount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {faultCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Active faults</div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings Count */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Warnings</span>
          </div>
          <div className="rounded-lg border p-3">
            <div
              className={`text-lg font-medium ${
                warningCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {warningCount}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Active warnings</div>
          </div>
        </CardContent>
      </Card>

      {/* Severity */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Severity</span>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              {severityBadge(severity)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
