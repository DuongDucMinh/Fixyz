'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, ImagePlus, Trash2, ClipboardCheck, Sparkles } from 'lucide-react';

import { useMounted } from '@/hooks/useMounted';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImages: string[];
  onSave: (images: string[]) => void;
  title?: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  initialImages,
  onSave,
  title = 'Quản lý & Tải ảnh lỗi',
}: ImageUploadModalProps) {
  const mounted = useMounted();
  const [images, setImages] = useState<string[]>(initialImages);
  const [prevInitial, setPrevInitial] = useState(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with prop during render if initialImages changes
  if (initialImages !== prevInitial) {
    setPrevInitial(initialImages);
    setImages(initialImages);
  }


  // Handle file list conversion to base64 Data URLs
  const processFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            setImages((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  // Listen to Paste Event (Ctrl + V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      let pastedAny = false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault();
          e.stopPropagation();
          const file = item.getAsFile();
          if (file) {
            pastedAny = true;
            const reader = new FileReader();
            reader.onload = (evt) => {
              if (evt.target?.result && typeof evt.target.result === 'string') {
                setImages((prev) => [...prev, evt.target!.result as string]);
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }

      if (pastedAny) {
        setPasteNotice(true);
        setTimeout(() => setPasteNotice(false), 2500);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input so same file can be re-uploaded if desired
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(images);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 m-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none overflow-hidden"
      style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ chọn file, kéo thả hoặc bấm <span className="font-semibold text-blue-600">Ctrl + V</span> dán ảnh chụp màn hình trực tiếp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Paste Notification Banner */}
          {pasteNotice && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm animate-in slide-in-from-top duration-200">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              <span>Đã nhận và thêm ảnh từ Clipboard thành công!</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-800">
              Kéo thả ảnh vào đây, hoặc <span className="text-blue-600 underline">chọn từ máy tính</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Tester có thể bấm chụp màn hình (<kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Win + Shift + S</kbd>) rồi ấn <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Ctrl + V</kbd>
            </div>
          </div>

          {/* Attached Images List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ảnh đã đính kèm ({images.length})
              </span>
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {images.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-sm border rounded-lg bg-slate-50/50">
                Chưa có ảnh nào được tải lên cho lỗi này.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Attached image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow cursor-pointer transition-transform hover:scale-110"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            Lưu thay đổi ({images.length} ảnh)
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
