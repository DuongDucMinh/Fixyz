'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bug, Priority } from '@/types';
import { useBugTracker } from '@/context/BugTrackerContext';
import PriorityBadge from './PriorityBadge';
import AssigneeSelector from './AssigneeSelector';
import { Trash2, Plus, Image as ImageIcon, Check } from 'lucide-react';

interface BugRowProps {
  bug: Bug;
  index: number;
  onOpenLightbox: (bug: Bug, initialIndex: number) => void;
  onOpenUpload: (bug: Bug) => void;
}


export default function BugRow({
  bug,
  index,
  onOpenLightbox,
  onOpenUpload,
}: BugRowProps) {
  const { updateBug, deleteBug } = useBugTracker();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [description, setDescription] = useState(bug.description);
  const [prevDescription, setPrevDescription] = useState(bug.description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (bug.description !== prevDescription) {
    setPrevDescription(bug.description);
    setDescription(bug.description);
  }

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 40)}px`;
    }
  }, []);


  useEffect(() => {
    adjustTextareaHeight();
  }, [description, adjustTextareaHeight]);

  const handleBlurDescription = () => {
    if (description !== bug.description) {
      updateBug(bug.id, { description });
    }
  };

  const handleToggleComplete = () => {
    updateBug(bug.id, { isCompleted: !bug.isCompleted });
  };

  const handlePriorityChange = (priority: Priority) => {
    updateBug(bug.id, { priority });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateBug(bug.id, { assigneeId });
  };

  const hasImages = bug.images && bug.images.length > 0;
  const extraImagesCount = hasImages ? bug.images.length - 1 : 0;

  return (
    <tr
      className={`border-b border-slate-100 transition-all group ${
        bug.isCompleted
          ? 'bg-slate-50/70 opacity-60'
          : 'bg-white hover:bg-slate-50/40'
      }`}
    >
      {/* 1. STT */}
      <td className="py-4 px-3 text-center align-middle w-[54px]">
        <span className="font-mono text-xs font-medium text-slate-500">
          {index + 1}
        </span>
      </td>

      {/* 2. Image Column */}
      <td className="py-4 px-2 align-middle w-[110px]">
        {hasImages ? (
          <div className="relative group/img inline-block">
            <div
              onClick={() => onOpenLightbox(bug, 0)}
              className="w-20 h-14 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer relative hover:scale-102 transition-transform"
              title="Click để phóng to ảnh"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bug.images[0]}
                alt={`Bug snapshot`}
                className="w-full h-full object-cover"
              />

              {extraImagesCount > 0 && (
                <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded">
                  +{extraImagesCount}
                </div>
              )}
            </div>

            {/* Micro button to manage/add more images */}
            <button
              onClick={() => onOpenUpload(bug)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-slate-300 text-slate-600 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 shadow-xs hover:bg-blue-50 hover:text-blue-600 transition-opacity cursor-pointer"
              title="Quản lý / thêm ảnh cho lỗi này"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenUpload(bug)}
            className="w-20 h-14 rounded-md border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-0.5 transition-all text-slate-500 hover:text-blue-600 cursor-pointer"
            title="Thêm ảnh hoặc dán ảnh (Ctrl + V)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-medium">+ Thêm ảnh</span>
          </button>
        )}
      </td>

      {/* 3. Description & Module Column (Auto-expanding height without scrollbar) */}
      <td className="py-3 px-3 align-middle w-auto">
        <textarea
          ref={textareaRef}
          rows={1}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            adjustTextareaHeight();
          }}
          onBlur={handleBlurDescription}
          placeholder="Nhập mô tả chi tiết lỗi, module, các bước tái hiện..."
          className={`w-full overflow-hidden resize-none min-h-[40px] p-2 text-sm leading-relaxed text-slate-800 bg-transparent border border-transparent rounded-lg hover:border-slate-200 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all ${
            bug.isCompleted ? 'line-through text-slate-400' : ''
          }`}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
      </td>

      {/* 4. Priority Column */}
      <td className="py-4 px-2.5 align-middle w-[136px] whitespace-nowrap">
        <PriorityBadge
          value={bug.priority}
          onChange={handlePriorityChange}
          disabled={bug.isCompleted}
        />
      </td>

      {/* 5. Assignee Column */}
      <td className="py-4 px-2.5 align-middle w-[160px]">
        <div className={bug.isCompleted ? 'line-through' : ''}>
          <AssigneeSelector
            assigneeId={bug.assigneeId}
            onChange={handleAssigneeChange}
            disabled={bug.isCompleted}
          />
        </div>
      </td>

      {/* 6. Completed Checkbox Column */}
      <td className="py-4 px-2 text-center align-middle w-[76px]">
        <label className="inline-flex items-center justify-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={bug.isCompleted}
            onChange={handleToggleComplete}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
              bug.isCompleted
                ? 'bg-[#0051D5] border-[#0051D5] text-white shadow-2xs'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            {bug.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </label>
      </td>

      {/* 7. Action Column (Delete) */}
      <td className="py-4 px-2 text-center align-middle w-[76px]">
        {showConfirmDelete ? (
          <div className="flex items-center justify-center gap-1.5 animate-in fade-in">
            <button
              onClick={() => deleteBug(bug.id)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium rounded shadow-xs transition-colors cursor-pointer"
              title="Xác nhận xóa"
            >
              Xóa
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-medium rounded transition-colors cursor-pointer"
              title="Hủy"
            >
              Hủy
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa dòng lỗi này"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}
