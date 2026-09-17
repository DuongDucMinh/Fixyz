'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useBugTracker } from '@/context/BugTrackerContext';
import { useMounted } from '@/hooks/useMounted';
import { Layers, Plus, X, FolderCheck } from 'lucide-react';

export default function Sidebar() {
  const { topics, activeTopicId, setActiveTopicId, addTopic, isLoaded } = useBugTracker();
  const mounted = useMounted();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');


  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic(newTopicName.trim());
    setNewTopicName('');
    setIsAddModalOpen(false);
  };

  return (
    <>
      <aside className="w-60 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 flex-shrink-0 select-none">
        {/* Logo and Brand */}
        <div className="h-16 px-5 border-b border-slate-200/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0051D5] flex items-center justify-center text-white font-black text-base shadow-sm">
            F
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Fixyz
          </span>
        </div>

        {/* Topics Section */}
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="px-2 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Projects / Topics</span>
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
              {topics.length}
            </span>
          </div>

          {/* Topic Navigation */}
          {!isLoaded && topics.length === 0 ? (
            <div className="space-y-1.5 mt-1 animate-pulse">
              <div className="h-9 bg-slate-100 rounded-lg w-full" />
              <div className="h-9 bg-slate-100 rounded-lg w-full" />
            </div>
          ) : (
            <nav className="space-y-1 mt-1">
              {topics.map((topic) => {
                const isActive = topic.id === activeTopicId;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#DCE9FF] text-[#0051D5] font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Layers
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-[#0051D5]' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{topic.name}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Add Topic Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-[#0051D5] hover:border-blue-400 hover:bg-blue-50/40 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Topic</span>
          </button>
        </div>

      </aside>

      {/* Add Topic Dialog */}
      {isAddModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 m-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none overflow-hidden"
          style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Thêm Topic Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên Topic / Dự án
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ví dụ: Fix Mobile App, Fix Payment..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!newTopicName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0051D5] hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Tạo Topic
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

