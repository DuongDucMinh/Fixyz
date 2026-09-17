'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBugTracker } from '@/context/BugTrackerContext';

import { useMounted } from '@/hooks/useMounted';
import { ChevronDown, Check, UserPlus, Trash2 } from 'lucide-react';

interface AssigneeSelectorProps {
  assigneeId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function AssigneeSelector({
  assigneeId,
  onChange,
  disabled = false,
}: AssigneeSelectorProps) {
  const { assignees, addAssignee, deleteAssignee } = useBugTracker();
  const [isOpen, setIsOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const mounted = useMounted();
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentAssignee = assignees.find((a) => a.id === assigneeId);

  const updatePosition = useCallback(() => {

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 256;
      const menuHeight = 280;

      // Default: show below button
      let top = rect.bottom + 4;
      // If menu exceeds bottom of screen and there's enough space above, flip above
      if (top + menuHeight > window.innerHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 4;
      }

      // Ensure menu doesn't overflow right edge
      let left = rect.left;
      if (left + menuWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - menuWidth - 16);
      }

      setCoords({ top, left });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => {
        updatePosition();
      };
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const created = addAssignee(newPersonName.trim());
    onChange(created.id);
    setNewPersonName('');
    setIsOpen(false);
  };

  const handleDeletePerson = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (assigneeId === id) {
      onChange('');
    }
    deleteAssignee(id);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="inline-block text-left w-[148px]">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!isOpen) {
            updatePosition();
          }
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between p-1 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer group ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Avatar */}
          {currentAssignee?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentAssignee.avatar}
              alt={currentAssignee.name}
              className="w-7 h-7 rounded-md object-cover flex-shrink-0 shadow-2xs"
            />
          ) : currentAssignee ? (
            <div className="w-7 h-7 rounded-md bg-[#DCE9FF] text-[#0051D5] flex items-center justify-center font-bold text-[11px] flex-shrink-0 shadow-2xs">
              {getInitials(currentAssignee.name)}
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[12px] flex-shrink-0 shadow-2xs">
              —
            </div>
          )}

          {/* Name only (no role) */}
          <span className="text-xs font-semibold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
            {currentAssignee ? currentAssignee.name : 'Chưa phân công'}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0 ml-1" />
      </button>

      {/* Portal Dropdown Menu: rendered directly on document.body so it NEVER clips or causes table scrollbars */}
      {mounted && isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          className="w-64 rounded-xl bg-white shadow-2xl border border-slate-200 py-2 animate-in fade-in-50 zoom-in-95 select-none"
        >
          <div className="px-3 pb-1.5 mb-1 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Chọn người phụ trách
          </div>

          <div className="max-h-52 overflow-y-auto px-1 space-y-0.5">
            {/* Unassign option */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                !currentAssignee ? 'bg-blue-50/70 text-blue-700 font-medium' : 'text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  —
                </div>
                <span className="truncate">Chưa phân công</span>
              </div>
              {!currentAssignee && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
            </div>

            {assignees.length === 0 ? null : (

              assignees.map((assignee) => {
                const isSelected = assignee.id === currentAssignee?.id;
                return (
                  <div
                    key={assignee.id}
                    onClick={() => {
                      onChange(assignee.id);
                      setIsOpen(false);
                    }}
                    className={`group/item w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {assignee.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-6 h-6 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-[#DCE9FF] text-[#0051D5] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {getInitials(assignee.name)}
                        </div>
                      )}
                      <span className="font-medium text-slate-800 truncate">
                        {assignee.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      <button
                        type="button"
                        onClick={(e) => handleDeletePerson(e, assignee.id)}
                        className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover/item:opacity-100 transition-all cursor-pointer"
                        title="Xóa người này khỏi danh sách"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Add Person Input Form */}
          <div className="mt-2 pt-2 border-t border-slate-100 px-3">
            <form onSubmit={handleAddNew} className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập tên người mới..."
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newPersonName.trim()}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
