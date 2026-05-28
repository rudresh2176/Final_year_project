'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface LossCardProps {
  loss: number;
  lossPercentage?: number;
  status: string;
  loading?: boolean;
}

function lossStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return 'text-red-600 dark:text-red-400';
  if (s === 'warning') return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
}

function lossBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800';
  if (s === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800';
}

function progressColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return '[&>div]:bg-red-500';
  if (s === 'warning') return '[&>div]:bg-amber-500';
  return '[&>div]:bg-green-500';
}

export default function LossCard({ loss, lossPercentage, status, loading }: LossCardProps) {
  if (loading) {
    return (
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Power Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-24 mb-2" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="mt-3 h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const lp = lossPercentage ?? 0;

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Power Loss</CardTitle>
          <Badge className={lossBadge(status)}>{label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-medium mb-2 ${lossStatusColor(status)}`}>
          {loss.toFixed(2)} W
        </div>
        {lp > 0 && (
          <div className={`mb-2 ${progressColor(status)}`}>
            <Progress value={Math.min(100, lp * 5)} />
          </div>
        )}
        <div className="text-xs text-muted-foreground font-medium">
          Input Power − Output Power
          {lp > 0 && (
            <span className="ml-1">
              ({lp.toFixed(1)}% loss)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
