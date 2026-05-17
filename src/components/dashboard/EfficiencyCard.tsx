'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface EfficiencyCardProps {
  efficiency: number;
  loading?: boolean;
}

function efficiencyColor(eff: number) {
  if (eff >= 90) return 'text-green-600 dark:text-green-400';
  if (eff >= 80) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function progressColor(eff: number) {
  if (eff >= 90) return '[&>div]:bg-green-500';
  if (eff >= 80) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

function efficiencyLabel(eff: number) {
  if (eff >= 90) return 'Normal';
  if (eff >= 80) return 'Warning';
  return 'Fault';
}

function efficiencyBadgeColor(eff: number) {
  if (eff >= 90) return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800';
  if (eff >= 80) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800';
}

export default function EfficiencyCard({ efficiency, loading }: EfficiencyCardProps) {
  if (loading) {
    return (
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-24 mb-3" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
          <Badge className={efficiencyBadgeColor(efficiency)}>
            {efficiencyLabel(efficiency)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-medium mb-3 ${efficiencyColor(efficiency)}`}>
          {efficiency.toFixed(1)}%
        </div>
        <div className={`mb-3 ${progressColor(efficiency)}`}>
          <Progress value={Math.min(100, Math.max(0, efficiency))} />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          (Output Power / Input Power) × 100
        </div>
      </CardContent>
    </Card>
  );
}
