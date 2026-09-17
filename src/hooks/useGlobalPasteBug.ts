'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBugTracker } from '@/context/BugTrackerContext';
import { compressImageFile } from '@/lib/imageCompressor';

/**
 * Checks if an event target is an interactive input or editable field
 * where normal native paste behavior should be preserved.
 */
function isInputOrEditable(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  const tagName = element.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  return Boolean(element.closest('input, textarea, select, [contenteditable="true"]'));
}

/**
 * Checks if any input or textarea currently has focus on the page.
 */
function isAnyInputActive(): boolean {
  if (typeof document === 'undefined') return false;
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  return isInputOrEditable(activeEl);
}

/**
 * Checks if any modal dialog (Upload Modal, Lightbox, Add/Delete Topic Modal) is currently active.
 */
function isAnyModalOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(document.querySelector('[data-fixyz-modal="true"]'));
}

export function useGlobalPasteBug() {
  const { addBug, updateBug, isLoaded } = useBugTracker();
  const pendingKeydownRef = useRef<number>(0);

  const focusBugDescription = useCallback((bugId: string) => {
    setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>(`[data-bug-textarea="${bugId}"]`);
      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 80);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    /**
     * Primary Paste Handler
     * Fires whenever the user pastes (Ctrl+V, Cmd+V, context menu, etc.)
     */
    const handlePaste = async (e: ClipboardEvent) => {
      // 1. If currently in an input/textarea, preserve normal text editing
      if (isInputOrEditable(e.target) || isAnyInputActive()) {
        return;
      }

      // 2. If ANY modal is currently open (especially Quick Upload Modal or Lightbox),
      // NEVER create an outside bug row!
      if (isAnyModalOpen()) {
        return;
      }

      // Cancel fallback timer from keydown so duplicate rows are never created
      pendingKeydownRef.current = 0;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      const imageFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      // Case A: Image(s) detected in clipboard (e.g. from Win+Shift+S / Snipping Tool)
      if (imageFiles.length > 0) {
        e.preventDefault();

        // 1. Instantly create the new row for 0ms perceived UI responsiveness
        const newBug = addBug();
        focusBugDescription(newBug.id);

        try {
          // 2. Client-side WebP compression to save storage
          const compressedResults = await Promise.all(
            imageFiles.map((file) => compressImageFile(file))
          );

          // 3. Attach compressed image(s) to the new bug
          updateBug(newBug.id, { images: compressedResults });
        } catch (err) {
          console.error('[GlobalPaste] Error compressing pasted image:', err);
        }
        return;
      }

      // Case B: Text detected in clipboard (e.g. copied error message or bug title)
      const pastedText = clipboardData.getData('text/plain')?.trim();
      if (pastedText) {
        e.preventDefault();
        const newBug = addBug();
        updateBug(newBug.id, { description: pastedText });
        focusBugDescription(newBug.id);
        return;
      }

      // Case C: Clipboard event with no content
      e.preventDefault();
      const newBug = addBug();
      focusBugDescription(newBug.id);
    };

    /**
     * Keydown Handler
     * Acts as a safety fallback when Ctrl+V is pressed on an empty clipboard
     * where some browsers may not dispatch a standard paste event.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        // If in input or modal, do nothing
        if (isInputOrEditable(e.target) || isAnyInputActive() || isAnyModalOpen()) {
          return;
        }

        pendingKeydownRef.current = Date.now();

        // If the browser does NOT fire a paste event within 120ms (e.g. empty clipboard),
        // execute fallback to still create the requested new row.
        setTimeout(() => {
          if (pendingKeydownRef.current && Date.now() - pendingKeydownRef.current >= 100) {
            if (!isAnyModalOpen() && !isAnyInputActive()) {
              const newBug = addBug();
              focusBugDescription(newBug.id);
            }
            pendingKeydownRef.current = 0;
          }
        }, 120);
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoaded, addBug, updateBug, focusBugDescription]);
}
