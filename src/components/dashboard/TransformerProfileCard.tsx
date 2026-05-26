'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type TransformerConfig } from '@/lib/store';
import { Building2, Gauge, Zap, ArrowRightLeft, MapPin, Activity } from 'lucide-react';

interface TransformerProfileCardProps {
  config: TransformerConfig;
  isOffline: boolean;
  onChangeTransformer: () => void;
}

export default function TransformerProfileCard({
  config,
  isOffline,
  onChangeTransformer,
}: TransformerProfileCardProps) {
  return (
    <Card className="py-4">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Transformer Info */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">
                  {config.transformerName}
                </h3>
                <Badge
                  className={
                    isOffline
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800 text-[10px] px-1.5'
                      : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px] px-1.5'
                  }
                >
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{config.location}</span>
              </div>
              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <Gauge className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-medium text-foreground">{config.kva} KVA</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Pri V:</span>
                  <span className="font-medium text-foreground">{config.primaryVoltage}V</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Sec V:</span>
                  <span className="font-medium text-foreground">{config.secondaryVoltage}V</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Pri I:</span>
                  <span className="font-medium text-foreground">{config.ratedPrimaryCurrent.toFixed(2)}A</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Sec I:</span>
                  <span className="font-medium text-foreground">{config.ratedSecondaryCurrent.toFixed(2)}A</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Load:</span>
                  <span className="font-medium text-foreground">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Change Transformer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onChangeTransformer}
            className="shrink-0 gap-2 text-xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Change Transformer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
