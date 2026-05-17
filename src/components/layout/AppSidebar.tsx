'use client';

import { useEffect } from 'react';
import {
  Building2,
  Home,
  Info,
  Users,
  Bell,
  Activity,
  Table,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type DataLogType } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { id: 'about', label: 'About Project', icon: <Info className="h-5 w-5" /> },
  { id: 'team', label: 'Team Members', icon: <Users className="h-5 w-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  { id: 'dashboard', label: 'Monitoring Dashboard', icon: <Activity className="h-5 w-5" /> },
  { id: 'session', label: 'Data History', icon: <Table className="h-5 w-5" /> },
];

function getStatusColor(status: string): string {
  const s = status.toUpperCase();
  if (s === 'NORMAL' || s === 'HEALTHY') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (s === 'WARNING' || s === 'CAUTION') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (s === 'CRITICAL' || s === 'FAULT') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function RecentLogsSection() {
  const recentLogs = useAppStore((s) => s.recentLogs);

  if (recentLogs.length === 0) {
    return (
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">No recent data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-3 py-2">
      {recentLogs.slice(0, 10).map((log: DataLogType) => (
        <div
          key={log.id}
          className="flex items-center justify-between rounded-lg border bg-card p-2 transition-colors"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs text-muted-foreground">
              {formatRelativeTime(log.timestamp)}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`shrink-0 text-[10px] px-1.5 py-0 border-0 ${getStatusColor(log.status)}`}
          >
            {log.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function SidebarContent({ expanded, onNavClick }: { expanded: boolean; onNavClick?: () => void }) {
  const { activePage, setActivePage, notifications } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNav = (id: string) => {
    setActivePage(id);
    onNavClick?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand section */}
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-600 text-white">
          <Building2 className="h-4 w-4" />
        </div>
        {expanded && (
          <span className="text-base font-medium tracking-tight">TransMonitor</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const showBadge = item.id === 'notifications' && unreadCount > 0;

            const button = (
              <li key={item.id}>
                <button
                  onClick={() => handleNav(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-l-2 border-slate-600 bg-slate-100 text-slate-900 dark:border-slate-400 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800/50 dark:hover:text-foreground'
                  } ${expanded ? '' : 'justify-center px-0'}`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  {expanded && <span className="truncate">{item.label}</span>}
                  {expanded && showBadge && (
                    <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] font-medium text-white border-0">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                  {!expanded && showBadge && (
                    <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                  )}
                </button>
              </li>
            );

            if (!expanded) {
              return (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return button;
          })}
        </ul>
      </nav>

      {/* Recent Data Logs - only when expanded */}
      {expanded && (
        <>
          <Separator />
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent Data Logs
            </h3>
          </div>
          <ScrollArea className="flex-1 overflow-hidden px-1 pb-3">
            <RecentLogsSection />
          </ScrollArea>
        </>
      )}
    </div>
  );
}

export default function AppSidebar() {
  const { sidebarExpanded, setSidebarExpanded, mobileMenuOpen, setMobileMenuOpen } =
    useAppStore();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarExpanded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarExpanded]);

  const sidebarWidth = sidebarExpanded ? 'w-[260px]' : 'w-[72px]';

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-full border-r bg-background transition-all duration-200 md:block ${sidebarWidth}`}
        style={{ paddingTop: '3.5rem' }}
      >
        <SidebarContent expanded={sidebarExpanded} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] border-r bg-background md:hidden"
            >
              <SidebarContent
                expanded={true}
                onNavClick={() => setMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
