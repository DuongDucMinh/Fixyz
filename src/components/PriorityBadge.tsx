'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Priority } from '@/types';
import { useMounted } from '@/hooks/useMounted';
import { ChevronDown, Check } from 'lucide-react';

interface PriorityBadgeProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
}

export default function PriorityBadge({ value, onChange, disabled = false }: PriorityBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 144;
      const menuHeight = 160;

      let top = rect.bottom + 4;
      if (top + menuHeight > window.innerHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 4;
      }

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
      const handleScrollOrResize = () => updatePosition();
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

  const getBadgeStyle = (priority: Priority) => {
    switch (priority) {
      case 'Cao':
        return {
          container: 'bg-[#FFDAD6] text-[#93000A] border border-[#FFB4AB]/40 hover:bg-[#FFDAD6]/80',
          dot: 'bg-[#BA1A1A]',
        };
      case 'Trung bình':
        return {
          container: 'bg-[#DCE9FF] text-[#0051D5] border border-[#B8D2FF]/60 hover:bg-[#DCE9FF]/80',
          dot: 'bg-[#0051D5]',
        };
      case 'Thấp':
        return {
          container: 'bg-[#E5EEFF] text-[#45464D] border border-slate-200 hover:bg-slate-200/60',
          dot: 'bg-[#76777D]',
        };
      default:
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const currentStyle = getBadgeStyle(value);
  const options: Priority[] = ['Cao', 'Trung bình', 'Thấp'];

  return (
    <div className="inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-between w-[118px] px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer select-none ${
          currentStyle.container
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${currentStyle.dot}`} />
          <span>{value}</span>
        </div>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 flex-shrink-0" />
      </button>

      {/* Portal Dropdown Menu */}
      {mounted && isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          className="w-36 rounded-lg bg-white shadow-xl border border-slate-200 py-1 animate-in fade-in-50 zoom-in-95 select-none"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Mức độ ưu tiên
          </div>
          {options.map((opt) => {
            const optStyle = getBadgeStyle(opt);
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-slate-50 font-medium' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${optStyle.dot}`} />
                  <span className="text-slate-800">{opt}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
