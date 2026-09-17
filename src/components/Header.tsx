'use client';

import React, { useState } from 'react';
import { useBugTracker } from '@/context/BugTrackerContext';
import { FolderGit2, AlertCircle, CheckCircle2, Plus, ImagePlus, Menu } from 'lucide-react';
import ImageUploadModal from './ImageUploadModal';

export default function Header() {
  const {
    topics,
    activeTopicId,
    stats,
    addBug,
    addImageToBug,
    isLoaded,
    toggleSidebar,
  } = useBugTracker();
  const [quickUploadOpen, setQuickUploadOpen] = useState(false);

  const currentTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  const handleQuickUploadSave = (newImages: string[]) => {
    if (newImages.length > 0) {
      // Create a new bug with these images
      const bug = addBug();
      newImages.forEach((img) => addImageToBug(bug.id, img));
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-1">
        {/* Left: Hamburger button (mobile only) + Topic Title and Realtime Counter */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            {/* 3 Horizontal Lines (Hamburger) Button - Only on mobile devices */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex md:hidden p-1.5 -ml-1 rounded-lg text-slate-700 hover:text-[#0051D5] hover:bg-blue-50 border border-slate-200/90 bg-white shadow-2xs transition-colors cursor-pointer items-center justify-center flex-shrink-0"
              title="Mở menu danh sách topic"
              aria-label="Mở menu danh sách topic"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-[#DCE9FF] text-[#0051D5] flex items-center justify-center shadow-2xs flex-shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>

            {!isLoaded && !currentTopic ? (
              <div className="h-7 w-36 bg-slate-200/80 rounded animate-pulse" />
            ) : (
              <h1
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate"
                title={currentTopic?.name}
              >
                {currentTopic?.name || 'Fixyz Projects'}
              </h1>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs pl-0.5">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <AlertCircle className="w-3.5 h-3.5 text-[#BA1A1A] flex-shrink-0" />
              <span className="font-bold text-slate-900">{stats.pendingCount}</span>
              <span className="text-slate-500">lỗi đang chờ fix</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0051D5] flex-shrink-0" />
              <span className="font-bold text-slate-900">{stats.completedCount}</span>
              <span className="text-slate-500">lỗi đã giải quyết</span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setQuickUploadOpen(true)}
            title="Mở cửa sổ chọn nhiều file ảnh hoặc paste ảnh hàng loạt"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <ImagePlus className="w-4 h-4 text-[#0051D5] flex-shrink-0" />
            <span>Upload ảnh nhanh</span>
          </button>

          <button
            type="button"
            onClick={addBug}
            title="Thêm dòng lỗi mới (hoặc bấm Ctrl + V bất kỳ lúc nào trên trang)"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Thêm dòng lỗi</span>
            <kbd className="hidden lg:inline-block ml-0.5 font-mono text-[10px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded border border-slate-700">
              Ctrl+V
            </kbd>
          </button>
        </div>
      </div>

      {/* Quick Upload Modal */}
      <ImageUploadModal
        isOpen={quickUploadOpen}
        onClose={() => setQuickUploadOpen(false)}
        initialImages={[]}
        onSave={handleQuickUploadSave}
        title="Upload ảnh nhanh (Tự tạo lỗi mới)"
      />
    </>
  );
}
