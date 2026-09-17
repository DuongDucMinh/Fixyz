'use client';

import React, { useState } from 'react';
import { useBugTracker } from '@/context/BugTrackerContext';
import { Bug } from '@/types';
import BugRow from './BugRow';
import LightboxModal from './LightboxModal';
import ImageUploadModal from './ImageUploadModal';
import { BugOff, Plus } from 'lucide-react';

export default function BugTable() {
  const { activeBugs, addBug, updateBug, isLoaded } = useBugTracker();

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeBugForLightbox, setActiveBugForLightbox] = useState<Bug | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeBugForUpload, setActiveBugForUpload] = useState<Bug | null>(null);

  const handleOpenLightbox = (bug: Bug, initialIndex: number) => {
    setActiveBugForLightbox(bug);
    setLightboxImages(bug.images || []);
    setLightboxIndex(initialIndex);
    setLightboxOpen(true);
  };

  const handleDeleteImageFromLightbox = (indexToDelete: number) => {
    if (!activeBugForLightbox) return;
    const currentImages = activeBugForLightbox.images || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToDelete);

    // Update context & database
    updateBug(activeBugForLightbox.id, { images: updatedImages });
    setLightboxImages(updatedImages);
    setActiveBugForLightbox({
      ...activeBugForLightbox,
      images: updatedImages,
    });

    if (updatedImages.length === 0) {
      setLightboxOpen(false);
      setActiveBugForLightbox(null);
    } else if (lightboxIndex >= updatedImages.length) {
      setLightboxIndex(Math.max(0, updatedImages.length - 1));
    }
  };

  const handleOpenUpload = (bug: Bug) => {
    setActiveBugForUpload(bug);
    setUploadModalOpen(true);
  };

  const handleSaveImages = (newImages: string[]) => {
    if (activeBugForUpload) {
      updateBug(activeBugForUpload.id, { images: newImages });
    }
  };


  return (
    <>
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Mobile Swipe Hint */}
        <div className="md:hidden px-3 py-1.5 bg-[#EFF4FF]/60 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>👉 Vuốt ngang bảng để xem đầy đủ các cột</span>
          <span className="font-mono text-[10px] text-slate-400">{activeBugs.length} dòng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[860px]">
            <thead>
              <tr className="bg-[#EFF4FF]/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="py-3 px-3 text-center w-[54px]">
                  STT
                </th>
                <th scope="col" className="py-3 px-2 w-[110px]">
                  HÌNH ẢNH
                </th>
                <th scope="col" className="py-3 px-3 w-auto">
                  MÔ TẢ CHI TIẾT & MODULE
                </th>
                <th scope="col" className="py-3 px-2.5 w-[136px]">
                  MỨC ĐỘ
                </th>
                <th scope="col" className="py-3 px-2.5 w-[160px]">
                  NGƯỜI PHỤ TRÁCH
                </th>
                <th scope="col" className="py-3 px-2 text-center w-[76px]">
                  ĐÃ FIX
                </th>
                <th scope="col" className="py-3 px-2 text-center w-[76px]">
                  XÓA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoaded && activeBugs.length === 0 ? (
                <>
                  {[1, 2, 3].map((n) => (
                    <tr key={`skeleton-${n}`} className="animate-pulse border-b border-slate-100 h-16">
                      <td className="py-4 px-3 text-center">
                        <div className="h-4 w-6 bg-slate-200 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-2">
                        <div className="h-10 w-16 bg-slate-200 rounded-lg" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-4/5" />
                          <div className="h-3 bg-slate-100 rounded w-2/5" />
                        </div>
                      </td>
                      <td className="py-4 px-2.5">
                        <div className="h-7 w-20 bg-slate-200 rounded-full" />
                      </td>
                      <td className="py-4 px-2.5">
                        <div className="h-7 w-28 bg-slate-200 rounded-lg" />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <div className="h-5 w-5 bg-slate-200 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <div className="h-5 w-5 bg-slate-200 rounded mx-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : activeBugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <BugOff className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Chưa có lỗi nào trong danh sách này
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          onClick={addBug}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm lỗi đầu tiên</span>
                        </button>
                        <span className="text-xs text-slate-400">
                          hoặc ấn <kbd className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">Ctrl + V</kbd> dán ảnh trực tiếp
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                activeBugs.map((bug, idx) => (
                  <BugRow
                    key={bug.id}
                    bug={bug}
                    index={idx}
                    onOpenLightbox={handleOpenLightbox}
                    onOpenUpload={handleOpenUpload}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => {
          setLightboxOpen(false);
          setActiveBugForLightbox(null);
        }}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
        onDelete={handleDeleteImageFromLightbox}
      />


      {/* Image Upload Modal */}
      {activeBugForUpload && (
        <ImageUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setActiveBugForUpload(null);
          }}
          initialImages={activeBugForUpload.images}
          onSave={handleSaveImages}
          title={`Tải ảnh lỗi #${activeBugs.findIndex((b) => b.id === activeBugForUpload.id) + 1}`}
        />
      )}
    </>
  );
}
