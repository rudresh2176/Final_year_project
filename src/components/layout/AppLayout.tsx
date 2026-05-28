'use client';

import { ThemeProvider } from 'next-themes';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';
import { useAppStore } from '@/lib/store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarExpanded = useAppStore((s) => s.sidebarExpanded);
  const marginLeft = sidebarExpanded ? 'md:ml-[260px]' : 'md:ml-[72px]';

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <TopBar />
        <main className={`pt-14 transition-all duration-200 p-4 md:p-6 ${marginLeft}`}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
