'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface Parameter {
  label: string;
  value: number;
  unit: string;
}

interface ParameterGridProps {
  title: string;
  parameters: Parameter[];
  loading?: boolean;
}

export default function ParameterGrid({ title, parameters, loading }: ParameterGridProps) {
  return (
    <Card className="py-4">
      <div className="px-6 pb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <Skeleton className="mb-2 h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))
            : parameters.map((param) => (
                <div
                  key={param.label}
                  className="rounded-lg border p-3 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-1 text-xs text-muted-foreground font-medium">
                    {param.label}
                  </div>
                  <div className="text-lg font-medium text-foreground">
                    {param.value.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{param.unit}</div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
