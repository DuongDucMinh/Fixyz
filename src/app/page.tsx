'use client';

import React from 'react';
import { BugTrackerProvider, useBugTracker } from '@/context/BugTrackerContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import BugTable from '@/components/BugTable';
import { useGlobalPasteBug } from '@/hooks/useGlobalPasteBug';

function BugTrackerApp() {
  const { isDesktopCollapsed } = useBugTracker();
  useGlobalPasteBug();

  return (
    <div className="flex h-[100dvh] w-full bg-[#F8F9FF] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto min-w-0">
        <div
          className={`p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto space-y-3 sm:space-y-4 transition-all duration-300 ${
            isDesktopCollapsed ? 'md:pl-16 xl:pl-8' : ''
          }`}
        >
          <Header />
          <FilterBar />
          <BugTable />
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <BugTrackerProvider>
      <BugTrackerApp />
    </BugTrackerProvider>
  );
}
