'use client';

import React, { useState } from 'react';
import { useBugTracker } from '@/context/BugTrackerContext';
import { FolderGit2, AlertCircle, CheckCircle2, Plus, ImagePlus } from 'lucide-react';
import ImageUploadModal from './ImageUploadModal';

export default function Header() {
  const { topics, activeTopicId, stats, addBug, addImageToBug, isLoaded } = useBugTracker();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-2">
        {/* Left: Topic Title and Realtime Counter */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DCE9FF] text-[#0051D5] flex items-center justify-center shadow-2xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
            {!isLoaded && !currentTopic ? (
              <div className="h-7 w-36 bg-slate-200/80 rounded animate-pulse" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {currentTopic?.name || 'Fixyz Projects'}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#BA1A1A]" />
              <span className="font-bold text-slate-900">{stats.pendingCount}</span>
              <span className="text-slate-500">lỗi đang chờ fix</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0051D5]" />
              <span className="font-bold text-slate-900">{stats.completedCount}</span>
              <span className="text-slate-500">lỗi đã giải quyết</span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setQuickUploadOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <ImagePlus className="w-4 h-4 text-[#0051D5]" />
            <span>Upload ảnh nhanh</span>
          </button>

          <button
            type="button"
            onClick={addBug}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm dòng lỗi</span>
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
