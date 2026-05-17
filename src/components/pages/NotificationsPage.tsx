'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  WifiOff,
  Info,
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore, NotificationType } from '@/lib/store';
import { toast } from 'sonner';

// --- Types ---

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  faults: string | null;
  warnings: string | null;
  timestamp: string;
  createdAt: string;
}

type FilterTab = 'all' | 'fault' | 'warning' | 'critical' | 'offline';

// --- Helpers ---

function getTypeIcon(type: string) {
  switch (type) {
    case 'fault':
      return <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />;
    case 'warning':
      return <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
    case 'critical':
      return <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0" />;
    case 'offline':
      return <WifiOff className="h-4.5 w-4.5 text-slate-500 shrink-0" />;
    default:
      return <Info className="h-4.5 w-4.5 text-slate-500 shrink-0" />;
  }
}

function getBorderColor(type: string) {
  switch (type) {
    case 'fault':
      return 'border-l-red-500';
    case 'warning':
      return 'border-l-amber-500';
    case 'critical':
      return 'border-l-red-600';
    case 'offline':
      return 'border-l-slate-400';
    default:
      return 'border-l-slate-400';
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'High':
      return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
    case 'Medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
    case 'Low':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    case 'Normal':
      return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }
}

function formatTimestamp(ts: Date | string): string {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'just now';
  }
}

function parseApiNotification(api: ApiNotification): NotificationType {
  return {
    id: api.id,
    type: api.type as NotificationType['type'],
    title: api.title,
    message: api.message,
    severity: api.severity as NotificationType['severity'],
    isRead: api.isRead,
    faults: api.faults ? JSON.parse(api.faults) : undefined,
    warnings: api.warnings ? JSON.parse(api.warnings) : undefined,
    timestamp: new Date(api.timestamp),
  };
}

// --- Sub-components ---

function NotificationCard({
  notification,
  expandedId,
  onToggleExpand,
  onMarkRead,
}: {
  notification: NotificationType;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onMarkRead: (id: string) => void;
}) {
  const isExpanded = expandedId === notification.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`cursor-pointer border border-border border-l-4 ${getBorderColor(notification.type)} shadow-sm hover:shadow-md transition-shadow duration-200 py-0 overflow-hidden`}
        onClick={() => {
          if (!notification.isRead) onMarkRead(notification.id);
          onToggleExpand(notification.id);
        }}
      >
        <div className="p-4 flex items-start gap-3">
          {/* Unread indicator */}
          <div className="pt-0.5">
            {!notification.isRead && (
              <span className="block h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
            )}
          </div>

          {/* Icon */}
          {getTypeIcon(notification.type)}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium truncate">{notification.title}</h3>
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 shrink-0 ${getSeverityBadge(notification.severity)}`}
              >
                {notification.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium line-clamp-2">
              {notification.message}
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-medium mt-1.5">
              {formatTimestamp(notification.timestamp)}
            </p>
          </div>

          {/* Expand icon */}
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (notification.faults?.length || notification.warnings?.length) && (
          <div className="px-4 pb-4 pt-0">
            <Separator className="mb-3" />
            <div className="flex flex-col gap-3">
              {notification.faults && notification.faults.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                    Detected Faults
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {notification.faults.map((f, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] font-medium border-red-300 text-red-700 dark:border-red-800 dark:text-red-300"
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {notification.warnings && notification.warnings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1.5">
                    Detected Warnings
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {notification.warnings.map((w, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] font-medium border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                      >
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// --- Main Page ---

export default function NotificationsPage() {
  const {
    notifications: storeNotifications,
    markAllRead: storeMarkAllRead,
    clearAllNotifications: storeClearAll,
  } = useAppStore();

  const [allNotifications, setAllNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch persisted notifications on mount
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success && json.data) {
        const parsed = json.data.map((n: ApiNotification) => parseApiNotification(n));
        setAllNotifications(parsed);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Merge store (real-time) with API (persisted) — deduplicate by id
  const mergedNotifications = (() => {
    const map = new Map<string, NotificationType>();
    // API notifications first (persisted)
    for (const n of allNotifications) {
      map.set(n.id, n);
    }
    // Store notifications override (real-time, may have newer data)
    for (const n of storeNotifications) {
      map.set(n.id, n);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  })();

  // Filter
  const filteredNotifications =
    activeFilter === 'all'
      ? mergedNotifications
      : mergedNotifications.filter((n) => n.type === activeFilter);

  const unreadCount = mergedNotifications.filter((n) => !n.isRead).length;

  // Handlers
  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      storeMarkAllRead();
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      // Update local state
      setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    setActionLoading(true);
    try {
      storeClearAll();
      await fetch('/api/notifications', { method: 'DELETE' });
      setAllNotifications([]);
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      // Update local state
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent fail
    }
  };

  // Filter tabs
  const filterTabs: { label: string; value: FilterTab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Faults', value: 'fault' },
    { label: 'Warnings', value: 'warning' },
    { label: 'Critical', value: 'critical' },
    { label: 'Offline', value: 'offline' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-medium text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={actionLoading || unreadCount === 0}
            className="gap-1.5 text-xs font-medium"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark All as Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={actionLoading || mergedNotifications.length === 0}
            className="gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeFilter === tab.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter(tab.value)}
            className="text-xs font-medium shrink-0"
          >
            {tab.label}
          </Button>
        ))}
      </motion.div>

      {/* Notification List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="py-12">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <BellOff className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs font-medium text-muted-foreground/60">
                {activeFilter !== 'all'
                  ? `No ${activeFilter} notifications to show`
                  : 'Notifications about faults and warnings will appear here'}
              </p>
            </div>
          </Card>
        </motion.div>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <div className="flex flex-col gap-3 pr-2">
            {filteredNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                expandedId={expandedId}
                onToggleExpand={(id) =>
                  setExpandedId((prev) => (prev === id ? null : id))
                }
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
