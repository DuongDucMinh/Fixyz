'use client';

import React from 'react';
import { useBugTracker } from '@/context/BugTrackerContext';
import { Search, X } from 'lucide-react';

export default function FilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    selectedAssigneeId,
    setSelectedAssigneeId,
    assignees,
  } = useBugTracker();

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedPriority !== 'all' ||
    selectedAssigneeId !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('all');
    setSelectedAssigneeId('all');
  };

  return (
    <div className="bg-white p-2 sm:p-2.5 rounded-xl shadow-2xs border border-slate-200/80 mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm mô tả lỗi, người phụ trách..."
          className="w-full pl-9 pr-8 py-2 md:py-1.5 text-xs bg-[#EFF4FF]/60 border border-transparent rounded-lg focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all text-slate-800 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            title="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns container: 2 columns on mobile, inline on desktop */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Filter by Priority */}
        <div className="relative flex-1 md:w-48">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-2.5 py-2 md:py-1.5 text-xs bg-[#EFF4FF]/60 hover:bg-[#EFF4FF] border border-transparent rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer truncate"
          >
            <option value="all">Mọi mức độ</option>
            <option value="Cao">🔴 Cao</option>
            <option value="Trung bình">🔵 Trung bình</option>
            <option value="Thấp">⚪ Thấp</option>
          </select>
        </div>

        {/* Filter by Assignee */}
        <div className="relative flex-1 md:w-52">
          <select
            value={selectedAssigneeId}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            className="w-full px-2.5 py-2 md:py-1.5 text-xs bg-[#EFF4FF]/60 hover:bg-[#EFF4FF] border border-transparent rounded-lg text-slate-800 font-medium focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer truncate"
          >
            <option value="all">Tất cả phụ trách</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button if active */}
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1.5 hover:bg-blue-50 rounded-md transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1"
            title="Xóa bộ lọc"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
}
