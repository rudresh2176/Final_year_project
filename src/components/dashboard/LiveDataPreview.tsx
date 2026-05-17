'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';

export interface LiveDataRow {
  timestamp: string;
  status: string;
  primaryV: number;
  secondaryV: number;
  primaryI: number;
  secondaryI: number;
  loss: number;
  efficiency: number;
}

interface LiveDataPreviewProps {
  data: LiveDataRow[];
  loading?: boolean;
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
  if (s === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300';
}

export default function LiveDataPreview({ data, loading }: LiveDataPreviewProps) {
  const handleDownloadCSV = () => {
    if (data.length === 0) return;

    const headers = ['Timestamp', 'Status', 'Primary V', 'Secondary V', 'Primary I', 'Secondary I', 'Loss', 'Efficiency'];
    const rows = data.map((row) => [
      row.timestamp,
      row.status,
      row.primaryV.toFixed(2),
      row.secondaryV.toFixed(2),
      row.primaryI.toFixed(2),
      row.secondaryI.toFixed(2),
      row.loss.toFixed(2),
      row.efficiency.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transmonitor-data-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Live Data Preview</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            disabled={data.length === 0}
            className="gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground font-medium">
            No data recorded yet
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">Timestamp</TableHead>
                  <TableHead className="text-xs font-medium">Status</TableHead>
                  <TableHead className="text-xs font-medium text-right">Pri V</TableHead>
                  <TableHead className="text-xs font-medium text-right">Sec V</TableHead>
                  <TableHead className="text-xs font-medium text-right">Pri I</TableHead>
                  <TableHead className="text-xs font-medium text-right">Sec I</TableHead>
                  <TableHead className="text-xs font-medium text-right">Loss</TableHead>
                  <TableHead className="text-xs font-medium text-right">Eff %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-medium">{row.timestamp}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">{row.primaryV.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{row.secondaryV.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{row.primaryI.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{row.secondaryI.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{row.loss.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{row.efficiency.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
