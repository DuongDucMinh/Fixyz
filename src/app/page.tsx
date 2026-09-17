'use client';

import React from 'react';
import { BugTrackerProvider } from '@/context/BugTrackerContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import BugTable from '@/components/BugTable';

function BugTrackerApp() {
  return (
    <div className="flex h-screen w-full bg-[#F8F9FF] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-4">
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
