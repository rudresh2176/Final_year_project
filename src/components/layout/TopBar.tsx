'use client';

import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TopBar() {
  const { setSidebarExpanded, setMobileMenuOpen, notifications, setActivePage } =
    useAppStore();
  const { theme, setTheme } = useTheme();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMenuToggle = () => {
    // On mobile, toggle the mobile menu
    if (window.innerWidth < 768) {
      setMobileMenuOpen(true);
    } else {
      setSidebarExpanded(!useAppStore.getState().sidebarExpanded);
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Hamburger menu */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Center: Project title */}
        <h1 className="flex-1 truncate px-3 text-sm font-medium md:text-base">
          <span className="hidden sm:inline">
            Development of AI-Based System for Transformer Monitoring and Fault
            Classification
          </span>
          <span className="sm:hidden">TransMonitor</span>
        </h1>

        {/* Right: Notification & Theme Toggle */}
        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={() => setActivePage('notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] font-medium text-white border-0">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleThemeToggle}
          >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
