'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfYear } from 'date-fns';
import {
  Download,
  Search,
  X,
  CalendarDays,
  Database,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Types ---

interface DataRecord {
  id: string;
  timestamp: string;
  createdAt: string;
  status: string;
  primaryVoltage: number;
  primaryCurrent: number;
  primaryPower: number;
  secondaryVoltage: number;
  secondaryCurrent: number;
  secondaryPower: number;
  loss: number;
  efficiency: number;
  severity: string;
  faultType: string | null;
  warnings: string | null;
}

// --- Helpers ---

function formatDateToInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatTimestamp(ts: string): string {
  try {
    return format(new Date(ts), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return ts;
  }
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === 'fault') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
  if (s === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  if (s === 'offline') return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300';
}

function severityBadgeClass(severity: string) {
  const s = severity.toLowerCase();
  if (s === 'high') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
  if (s === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  if (s === 'low') return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300';
}

function exportToCSV(data: DataRecord[], filename: string) {
  if (data.length === 0) return;

  const headers = [
    'Timestamp',
    'Status',
    'Fault Type',
    'Warnings',
    'Primary Voltage (V)',
    'Primary Current (A)',
    'Primary Power (W)',
    'Secondary Voltage (V)',
    'Secondary Current (A)',
    'Secondary Power (W)',
    'Loss (W)',
    'Efficiency (%)',
    'Severity',
  ];

  const escapeCSV = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((row) => [
    escapeCSV(formatTimestamp(row.createdAt)),
    escapeCSV(row.status),
    escapeCSV(row.faultType ?? '-'),
    escapeCSV(row.warnings ? JSON.parse(row.warnings).join('; ') : '-'),
    escapeCSV(row.primaryVoltage.toFixed(2)),
    escapeCSV(row.primaryCurrent.toFixed(2)),
    escapeCSV(row.primaryPower.toFixed(2)),
    escapeCSV(row.secondaryVoltage.toFixed(2)),
    escapeCSV(row.secondaryCurrent.toFixed(2)),
    escapeCSV(row.secondaryPower.toFixed(2)),
    escapeCSV(row.loss.toFixed(2)),
    escapeCSV(row.efficiency.toFixed(2)),
    escapeCSV(row.severity),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// --- Constants ---

const PAGE_SIZE = 20;

const quickFilters = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'This Year', days: -1 }, // special: start of year
];

// --- Main Page ---

export default function SessionPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState(formatDateToInput(subDays(today, 10)));
  const [endDate, setEndDate] = useState(formatDateToInput(today));
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async (start: string, end: string) => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const params = new URLSearchParams();
      params.set('startDate', start);
      params.set('endDate', end);
      params.set('limit', '10000');

      const res = await fetch(`/api/data-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch session data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate, fetchData]);

  // Summary stats
  const summary = useMemo(() => {
    const total = data.length;
    const normalCount = data.filter((d) => d.status.toLowerCase() === 'normal').length;
    const warningCount = data.filter((d) => d.status.toLowerCase() === 'warning').length;
    const faultCount = data.filter((d) => d.status.toLowerCase() === 'fault').length;
    const normalPct = total > 0 ? ((normalCount / total) * 100).toFixed(1) : '0.0';
    return { total, normalCount, normalPct, warningCount, faultCount };
  }, [data]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginatedData = useMemo(
    () => data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [data, currentPage]
  );

  const startRecord = (currentPage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(currentPage * PAGE_SIZE, data.length);

  // Handlers
  const handleSearch = () => {
    setActiveQuickFilter(null);
    fetchData(startDate, endDate);
  };

  const handleClear = () => {
    const defaultStart = formatDateToInput(subDays(today, 10));
    const defaultEnd = formatDateToInput(today);
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setActiveQuickFilter(null);
  };

  const handleQuickFilter = (label: string, days: number) => {
    setActiveQuickFilter(label);
    let start: Date;
    if (days === -1) {
      start = startOfYear(today);
    } else {
      start = subDays(today, days);
    }
    const newStart = formatDateToInput(start);
    const newEnd = formatDateToInput(today);
    setStartDate(newStart);
    setEndDate(newEnd);
    fetchData(newStart, newEnd);
  };

  const handleExportCurrent = () => {
    const filename = `transmonitor-data-${startDate}-to-${endDate}.csv`;
    exportToCSV(data, filename);
  };

  const handleExportServer = async () => {
    try {
      const params = new URLSearchParams();
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      const res = await fetch(`/api/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transmonitor-export-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-xl font-medium text-foreground">Data History</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Browse and export historical transformer monitoring data.
        </p>
      </motion.div>

      {/* Date Picker + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Date Range Filter
            </div>

            {/* Date inputs + buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-44 text-xs font-medium"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-44 text-xs font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="gap-1.5 text-xs font-medium"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-1.5 text-xs font-medium"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            <Separator />

            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">Quick:</span>
              {quickFilters.map((qf) => (
                <Button
                  key={qf.label}
                  variant={activeQuickFilter === qf.label ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickFilter(qf.label, qf.days)}
                  className="text-xs font-medium h-7"
                >
                  {qf.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <Card className="shadow-sm py-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
              <Database className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Records
              </p>
              <p className="text-lg font-medium">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm py-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 dark:bg-green-950/50 p-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Normal
              </p>
              <p className="text-lg font-medium">
                {summary.normalCount}{' '}
                <span className="text-xs text-muted-foreground font-medium">
                  ({summary.normalPct}%)
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm py-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-950/50 p-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Warnings
              </p>
              <p className="text-lg font-medium">{summary.warningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm py-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-100 dark:bg-red-950/50 p-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Faults
              </p>
              <p className="text-lg font-medium">{summary.faultCount}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-xs font-medium w-12 text-center sticky top-0 bg-muted/50 z-10">#</TableHead>
                    <TableHead className="text-xs font-medium sticky top-0 bg-muted/50 z-10">Timestamp</TableHead>
                    <TableHead className="text-xs font-medium w-20 sticky top-0 bg-muted/50 z-10">Status</TableHead>
                    <TableHead className="text-xs font-medium sticky top-0 bg-muted/50 z-10">Fault Type</TableHead>
                    <TableHead className="text-xs font-medium sticky top-0 bg-muted/50 z-10">Warnings</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Pri V (V)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Pri I (A)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Pri P (W)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Sec V (V)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Sec I (A)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Sec P (W)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Loss (W)</TableHead>
                    <TableHead className="text-xs font-medium text-right sticky top-0 bg-muted/50 z-10">Eff (%)</TableHead>
                    <TableHead className="text-xs font-medium w-20 text-center sticky top-0 bg-muted/50 z-10">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        {Array.from({ length: 14 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileSpreadsheet className="h-8 w-8 opacity-40" />
                          <p className="text-sm font-medium">No data found</p>
                          <p className="text-xs font-medium text-muted-foreground/60">
                            Try adjusting the date range
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, idx) => (
                      <TableRow
                        key={row.id}
                        className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'} hover:bg-muted/70 transition-colors`}
                      >
                        <TableCell className="text-xs text-center font-mono text-muted-foreground">
                          {startRecord + idx}
                        </TableCell>
                        <TableCell className="text-xs font-medium whitespace-nowrap">
                          {formatTimestamp(row.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-medium px-1.5 py-0 ${statusBadgeClass(row.status)}`}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {row.faultType ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                            >
                              {row.faultType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium max-w-[160px] truncate">
                          {row.warnings ? (
                            <span className="text-amber-700 dark:text-amber-300">
                              {(() => { try { return JSON.parse(row.warnings).join(', '); } catch { return row.warnings; } })()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.primaryVoltage.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.primaryCurrent.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.primaryPower.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.secondaryVoltage.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.secondaryCurrent.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.secondaryPower.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.loss.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {row.efficiency.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-medium px-1.5 py-0 ${severityBadgeClass(row.severity)}`}
                          >
                            {row.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination + Export */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            className="gap-1 text-xs font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="text-xs font-medium text-muted-foreground px-2">
            {data.length > 0
              ? `Showing ${startRecord}-${endRecord} of ${data.length} records`
              : 'No records'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || loading}
            className="gap-1 text-xs font-medium"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground ml-1">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportServer}
            disabled={data.length === 0 || loading}
            className="gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Download Excel (.csv)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCurrent}
            disabled={data.length === 0 || loading}
            className="gap-1.5 text-xs font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Download Selected Range
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
