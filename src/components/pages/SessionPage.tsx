'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Filter,
  Eye,
  Zap,
  Building2,
  MapPin,
  Server,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Types ---

interface TransformerInfo {
  id: string;
  transformerId: string;
  name: string;
  kva: number;
  primaryVoltage: number;
  secondaryVoltage: number;
  location: string;
  phase: string;
  status: string;
  createdAt: string;
}

interface DataRecord {
  id: string;
  transformerId: string;
  transformerName: string;
  location: string;
  kva: number;
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
  lossPercentage: number;
  loadPercentage: number;
  efficiency: number;
  severity: string;
  faultType: string | null;
  warnings: string | null;
}

// --- Helpers ---

function formatDateToInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
  } catch {
    return ts;
  }
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'normal') return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800';
  if (s === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  if (s === 'fault') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800';
  if (s === 'offline') return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
}

function severityColor(severity: string): string {
  const s = severity.toLowerCase();
  if (s === 'high') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
  if (s === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  if (s === 'low') return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300';
}

function transformerStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'online') return 'text-green-600 dark:text-green-400';
  if (s === 'offline') return 'text-slate-400';
  return 'text-amber-500';
}

function exportToCSV(data: DataRecord[], filename: string) {
  if (data.length === 0) return;

  const headers = [
    'Timestamp',
    'Transformer ID',
    'Status',
    'Severity',
    'Fault Type',
    'Warnings',
    'Primary Voltage (V)',
    'Primary Current (A)',
    'Primary Power (W)',
    'Secondary Voltage (V)',
    'Secondary Current (A)',
    'Secondary Power (W)',
    'Loss (W)',
    'Loss (%)',
    'Load (%)',
    'Efficiency (%)',
  ];

  const escapeCSV = (val: string | number | null) => {
    const str = val === null ? '-' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((row) => [
    escapeCSV(formatTimestamp(row.createdAt)),
    escapeCSV(row.transformerId),
    escapeCSV(row.status),
    escapeCSV(row.severity),
    escapeCSV(row.faultType),
    escapeCSV(row.warnings ? (() => { try { return JSON.parse(row.warnings).join('; '); } catch { return row.warnings; } })() : '-'),
    escapeCSV(row.primaryVoltage.toFixed(2)),
    escapeCSV(row.primaryCurrent.toFixed(2)),
    escapeCSV(row.primaryPower.toFixed(2)),
    escapeCSV(row.secondaryVoltage.toFixed(2)),
    escapeCSV(row.secondaryCurrent.toFixed(2)),
    escapeCSV(row.secondaryPower.toFixed(2)),
    escapeCSV(row.loss.toFixed(2)),
    escapeCSV(row.lossPercentage.toFixed(2)),
    escapeCSV(row.loadPercentage.toFixed(2)),
    escapeCSV(row.efficiency.toFixed(2)),
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

const PAGE_SIZE = 15;

const dateFilterOptions = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
];

const statusFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Faults', value: 'Fault' },
  { label: 'Warnings', value: 'Warning' },
  { label: 'Offline', value: 'Offline' },
];

// --- Main Page ---

export default function SessionPage() {
  // Memoize today to prevent infinite re-renders
  const today = useMemo(() => new Date(), []);

  // State
  const [transformers, setTransformers] = useState<TransformerInfo[]>([]);
  const [selectedTransformer, setSelectedTransformer] = useState<string>('all');
  const [selectedTransformerInfo, setSelectedTransformerInfo] = useState<TransformerInfo | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [transformersLoading, setTransformersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30');

  // Fetch transformers
  const fetchTransformers = useCallback(async () => {
    setTransformersLoading(true);
    try {
      const res = await fetch('/api/transformers');
      const json = await res.json();
      if (json.success && json.transformers) {
        // Ensure we store transformers as unique by transformerId
        const unique = Array.from(
          new Map(json.transformers.map((t: any) => [t.transformerId, t])).values()
        );
        setTransformers(unique);
      }
    } catch (err) {
      console.error('Failed to fetch transformers:', err);
    } finally {
      setTransformersLoading(false);
    }
  }, []);

  // Fetch data logs
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '10000');

      if (selectedTransformer !== 'all') {
        params.set('transformerId', selectedTransformer);
      }

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const days = parseInt(dateFilter);
      if (days === 0) {
        // Today
        const start = formatDateToInput(today);
        params.set('startDate', start);
        params.set('endDate', start);
      } else if (days > 0) {
        const start = formatDateToInput(today);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() - days);
        params.set('startDate', formatDateToInput(endDate));
        params.set('endDate', start);
      }

      const res = await fetch(`/api/data-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);

        // Merge transformers discovered from data logs into dropdown list so
        // new transformer names appearing in logs show up immediately.
        try {
          const fromLogs = (json.data as DataRecord[]).map((d) => ({
            transformerId: d.transformerId ?? `TX${d.transformerName ?? 'Unknown'}`,
            name: d.transformerName ?? 'Unknown',
            kva: d.kva ?? 0,
            primaryVoltage: 0,
            secondaryVoltage: 0,
            location: d.location ?? 'N/A',
            phase: 'single',
            status: d.status ?? 'Unknown',
            createdAt: d.createdAt ?? new Date().toISOString(),
          }));

          // Merge with existing transformers state
          setTransformers((prev) => {
            const map = new Map(prev.map((t) => [t.transformerId, t]));
            for (const t of fromLogs) {
              if (!map.has(t.transformerId)) map.set(t.transformerId, t as any);
            }
            return Array.from(map.values()).sort((a: any, b: any) => (a.transformerId > b.transformerId ? 1 : -1));
          });
        } catch (mergeErr) {
          console.warn('Failed to merge transformers from logs:', mergeErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTransformer, statusFilter, searchQuery, dateFilter, today]);

  // Initial load
  useEffect(() => {
    fetchTransformers();
  }, [fetchTransformers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update selected transformer info when selection changes
  useEffect(() => {
    if (selectedTransformer === 'all') {
      setSelectedTransformerInfo(null);
    } else {
      const info = transformers.find((t) => t.transformerId === selectedTransformer);
      setSelectedTransformerInfo(info || null);
    }
  }, [selectedTransformer, transformers]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTransformer, statusFilter, searchQuery, dateFilter]);

  // Summary stats
  const summary = useMemo(() => {
    const total = data.length;
    const normalCount = data.filter((d) => d.status.toLowerCase() === 'normal').length;
    const warningCount = data.filter((d) => d.status.toLowerCase() === 'warning').length;
    const faultCount = data.filter((d) => d.status.toLowerCase() === 'fault').length;
    const offlineCount = data.filter((d) => d.status.toLowerCase() === 'offline').length;
    const normalPct = total > 0 ? ((normalCount / total) * 100).toFixed(1) : '0.0';
    return { total, normalCount, normalPct, warningCount, faultCount, offlineCount };
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
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleExportCSV = () => {
    const txLabel = selectedTransformer === 'all' ? 'All-Transformers' : selectedTransformer;
    const filename = `TransMonitor-${txLabel}-${formatDateToInput(today)}.csv`;
    exportToCSV(data, filename);
  };

  const handleExportExcel = () => {
    // For Excel, we create an XLSX-compatible CSV with BOM
    if (data.length === 0) return;
    const txLabel = selectedTransformer === 'all' ? 'All-Transformers' : selectedTransformer;

    const headers = [
      'Timestamp', 'Transformer ID', 'Status', 'Severity', 'Fault Type', 'Warnings',
      'Primary V (V)', 'Primary I (A)', 'Primary P (W)',
      'Secondary V (V)', 'Secondary I (A)', 'Secondary P (W)',
      'Loss (W)', 'Loss (%)', 'Load (%)', 'Efficiency (%)',
    ];

    const rows = data.map((row) => [
      formatTimestamp(row.createdAt),
      row.transformerId,
      row.status,
      row.severity,
      row.faultType ?? '-',
      row.warnings ? (() => { try { return JSON.parse(row.warnings).join('; '); } catch { return row.warnings; } })() : '-',
      row.primaryVoltage.toFixed(2),
      row.primaryCurrent.toFixed(2),
      row.primaryPower.toFixed(2),
      row.secondaryVoltage.toFixed(2),
      row.secondaryCurrent.toFixed(2),
      row.secondaryPower.toFixed(2),
      row.loss.toFixed(2),
      row.lossPercentage.toFixed(2),
      row.loadPercentage.toFixed(2),
      row.efficiency.toFixed(2),
    ]);

    const csvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TransMonitor-${txLabel}-${formatDateToInput(today)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleSeedDemo = async () => {
    try {
      const res = await fetch('/api/transformers/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        await fetchTransformers();
        await fetchData();
      }
    } catch (err) {
      console.error('Seed failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-medium text-foreground">Transformer Data History & Analytics</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Multi-transformer historical monitoring data with abnormal conditions classification analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemo}
            className="gap-1.5 text-xs font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Load Demo Data
          </Button>
        </div>
      </motion.div>

      {/* Transformer Selector + Active Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.03 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Dropdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Server className="h-4 w-4" />
                  Select Transformer
                </div>
                <Select value={selectedTransformer} onValueChange={setSelectedTransformer}>
                  <SelectTrigger className="w-full sm:w-64 text-xs font-medium">
                    <SelectValue placeholder="Select Transformer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transformers</SelectItem>
                    {transformers.map((tx) => (
                      <SelectItem key={tx.transformerId} value={tx.transformerId}>
                        {tx.transformerId} — {tx.kva} KVA {tx.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Indicator */}
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Viewing:</span>
                <Badge variant="outline" className="text-xs font-medium">
                  {selectedTransformer === 'all'
                    ? 'All Transformers'
                    : `${selectedTransformerInfo?.transformerId ?? selectedTransformer} — ${selectedTransformerInfo?.kva ?? ''} KVA`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transformer Profile Card (when single transformer selected) */}
      {selectedTransformerInfo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.06 }}
        >
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                    <Zap className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* ID + Name */}
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-medium">{selectedTransformerInfo.transformerId}</h2>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium border ${statusColor(selectedTransformerInfo.status)}`}
                      >
                        {selectedTransformerInfo.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium">{selectedTransformerInfo.name}</p>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-1">
                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Rating</span>
                        <p className="text-xs font-medium">{selectedTransformerInfo.kva} KVA</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Voltage</span>
                        <p className="text-xs font-medium">{selectedTransformerInfo.primaryVoltage}V / {selectedTransformerInfo.secondaryVoltage}V</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                        <p className="text-xs font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {selectedTransformerInfo.location}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Phase</span>
                        <p className="text-xs font-medium capitalize">{selectedTransformerInfo.phase} Phase</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.09 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
              {/* Date filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-40 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFilterOptions.map((opt) => (
                      <SelectItem key={opt.label} value={String(opt.days)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="999">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilterOptions.map((opt) => (
                      <SelectItem key={opt.label} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground">Search</label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="text"
                    placeholder="Transformer Name, ID, Fault type, Location..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="text-xs font-medium flex-1 min-w-0"
                  />
                  <Button size="sm" variant="outline" onClick={handleSearch} className="gap-1 text-xs font-medium shrink-0">
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleClearSearch} className="gap-1 text-xs font-medium shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.12 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <Card className="shadow-sm py-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
              <Database className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Records</p>
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
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Normal</p>
              <p className="text-lg font-medium">
                {summary.normalCount}{' '}
                <span className="text-xs text-muted-foreground font-medium">({summary.normalPct}%)</span>
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
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Warnings</p>
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
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Faults</p>
              <p className="text-lg font-medium">{summary.faultCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm py-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
              <Server className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Offline</p>
              <p className="text-lg font-medium">{summary.offlineCount}</p>
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
            <div className="max-h-[520px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[10px] font-medium w-10 text-center sticky top-0 bg-muted/50 z-10">#</TableHead>
                    <TableHead className="text-[10px] font-medium sticky top-0 bg-muted/50 z-10 min-w-[100px]">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-medium sticky top-0 bg-muted/50 z-10 min-w-[90px]">Transformer</TableHead>
                    <TableHead className="text-[10px] font-medium w-16 text-center sticky top-0 bg-muted/50 z-10">Status</TableHead>
                    <TableHead className="text-[10px] font-medium w-16 text-center sticky top-0 bg-muted/50 z-10">Severity</TableHead>
                    <TableHead className="text-[10px] font-medium sticky top-0 bg-muted/50 z-10 min-w-[80px]">Fault Type</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Pri V (V)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Pri I (A)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Pri P (W)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Sec V (V)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Sec I (A)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Sec P (W)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Loss (W)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Eff (%)</TableHead>
                    <TableHead className="text-[10px] font-medium text-right sticky top-0 bg-muted/50 z-10">Load (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        {Array.from({ length: 15 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileSpreadsheet className="h-8 w-8 opacity-40" />
                          <p className="text-sm font-medium">No data found</p>
                          <p className="text-xs font-medium text-muted-foreground/60">
                            Try adjusting the filters or load demo data
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, idx) => {
                      // Find transformer KVA for tag
                      const tx = transformers.find((t) => t.transformerId === row.transformerId);
                      const txKVA = tx ? `${tx.kva}KVA` : row.kva ? `${row.kva}KVA` : '';

                      return (
                        <TableRow
                          key={row.id}
                          className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'} hover:bg-muted/70 transition-colors`}
                        >
                          <TableCell className="text-[10px] text-center font-mono text-muted-foreground">
                            {startRecord + idx}
                          </TableCell>
                          <TableCell className="text-[11px] font-medium whitespace-nowrap">
                            {formatTimestamp(row.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-medium border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 w-fit"
                              >
                                {row.transformerId}
                              </Badge>
                              <div className="text-[9px] text-muted-foreground">
                                {row.transformerName && <span>{row.transformerName}</span>}
                                {row.transformerName && txKVA && <span> • </span>}
                                {txKVA && <span>{txKVA}</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-medium px-1.5 py-0 ${statusColor(row.status)}`}
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-medium px-1.5 py-0 ${severityColor(row.severity)}`}
                            >
                              {row.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {row.faultType ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-medium px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                              >
                                {row.faultType}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.primaryVoltage.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.primaryCurrent.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.primaryPower.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.secondaryVoltage.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.secondaryCurrent.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.secondaryPower.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.loss.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.efficiency.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-[11px] text-right font-mono">
                            {row.loadPercentage.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
        <div className="flex items-center gap-2 flex-wrap">
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
              ? `Showing ${startRecord}–${endRecord} of ${data.length}`
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
            onClick={handleExportCSV}
            disabled={data.length === 0 || loading}
            className="gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={data.length === 0 || loading}
            className="gap-1.5 text-xs font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Download Excel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
