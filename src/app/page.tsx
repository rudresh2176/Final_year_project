'use client';

import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/components/pages/HomePage';
import AboutPage from '@/components/pages/AboutPage';
import TeamPage from '@/components/pages/TeamPage';

// Lazy load pages that will be built by other agents
const NotificationsPage = dynamic(
  () => import('@/components/pages/NotificationsPage'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
  }
);

const DashboardPage = dynamic(
  () => import('@/components/pages/DashboardPage'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
  }
);

const SessionPage = dynamic(
  () => import('@/components/pages/SessionPage'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full rounded-xl" />,
  }
);

function PageRouter() {
  const activePage = useAppStore((s) => s.activePage);

  switch (activePage) {
    case 'home':
      return <HomePage />;
    case 'about':
      return <AboutPage />;
    case 'team':
      return <TeamPage />;
    case 'notifications':
      return <NotificationsPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'session':
      return <SessionPage />;
    default:
      return <HomePage />;
  }
}

export default function Home() {
  return (
    <AppLayout>
      <PageRouter />
    </AppLayout>
  );
}
