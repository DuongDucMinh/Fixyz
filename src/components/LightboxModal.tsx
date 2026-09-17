'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '@/hooks/useMounted';
import { X, ChevronLeft, ChevronRight, Download, Trash2 } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate?: (index: number) => void;
  onDelete?: (index: number) => void;
}

export default function LightboxModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  onDelete,
}: LightboxModalProps) {
  const mounted = useMounted();
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  const showDeleteConfirm = confirmingIndex === currentIndex;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setConfirmingIndex(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && currentIndex > 0 && onNavigate) {
        setConfirmingIndex(null);
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1 && onNavigate) {
        setConfirmingIndex(null);
        onNavigate(currentIndex + 1);
      }
    },
    [isOpen, onClose, currentIndex, images.length, onNavigate, showDeleteConfirm]
  );


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !mounted || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];

  const handleConfirmDelete = () => {
    setConfirmingIndex(null);
    if (onDelete) {
      onDelete(currentIndex);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 m-0 z-[9999] flex flex-col items-center justify-between bg-black/90 backdrop-blur-md select-none overflow-hidden"
      style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={() => {
        if (showDeleteConfirm) {
          setConfirmingIndex(null);
        } else {
          onClose();
        }
      }}
    >
      {/* Top Header Bar */}
      <div
        className="w-full px-6 py-4 flex items-center justify-between text-white/90 z-20 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold bg-white/15 px-3 py-1 rounded-full backdrop-blur-md shadow-xs">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Delete Image action */}
          {onDelete && (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-950/90 border border-red-500/60 px-3 py-1 rounded-lg backdrop-blur-md shadow-lg">
                  <span className="text-xs text-red-200 font-medium">Xác nhận xóa ảnh này?</span>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingIndex(null)}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingIndex(currentIndex)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Xóa ảnh này"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-xs font-medium hidden sm:inline">Xóa ảnh</span>
                </button>
              )}
            </>
          )}

          {/* Download Image action */}
          <a
            href={currentImg}
            download={`fixyz-image-${currentIndex + 1}.png`}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1.5"
            title="Tải ảnh về máy"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs font-medium hidden sm:inline">Tải về</span>
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Display Area: Left Button + Center Image + Right Button */}
      <div className="flex-1 w-full flex items-center justify-between px-4 md:px-8 lg:px-12 relative overflow-hidden pointer-events-none">
        {/* Left Button Slot (Outside Image) */}
        <div className="w-14 flex items-center justify-center pointer-events-auto flex-shrink-0 z-20">
          {images.length > 1 && currentIndex > 0 && onNavigate ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex - 1);
              }}
              className="w-12 h-12 flex items-center justify-center text-white bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white/40 rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-110 cursor-pointer"
              title="Ảnh trước (Phím mũi tên trái)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>

        {/* Center Image Container */}
        <div
          className="relative max-w-[calc(100vw-160px)] max-h-[76vh] flex items-center justify-center pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImg}
            alt={`Screenshot preview ${currentIndex + 1}`}
            className="max-h-[76vh] max-w-full rounded-lg shadow-2xl object-contain select-none border border-white/10"
          />
        </div>

        {/* Right Button Slot (Outside Image) */}
        <div className="w-14 flex items-center justify-center pointer-events-auto flex-shrink-0 z-20">
          {images.length > 1 && currentIndex < images.length - 1 && onNavigate ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex + 1);
              }}
              className="w-12 h-12 flex items-center justify-center text-white bg-black/60 hover:bg-black/90 border border-white/20 hover:border-white/40 rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-110 cursor-pointer"
              title="Ảnh tiếp theo (Phím mũi tên phải)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div
        className="w-full py-4 flex items-center justify-center z-20 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <div className="flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-md rounded-xl max-w-[90vw] overflow-x-auto border border-white/10">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate && onNavigate(idx)}
                className={`w-12 h-10 rounded overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                  idx === currentIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                title={`Xem ảnh ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
