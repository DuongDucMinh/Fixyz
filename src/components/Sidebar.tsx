'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBugTracker } from '@/context/BugTrackerContext';
import { useMounted } from '@/hooks/useMounted';
import { Layers, Plus, X, FolderCheck, Trash2, AlertTriangle } from 'lucide-react';

export default function Sidebar() {
  const { topics, activeTopicId, setActiveTopicId, addTopic, deleteTopic, bugs, isLoaded } = useBugTracker();
  const mounted = useMounted();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Delete modal states
  const [topicToDelete, setTopicToDelete] = useState<(typeof topics)[0] | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (topicToDelete) {
          setTopicToDelete(null);
          setConfirmDeleteName('');
          setIsDeleting(false);
        } else if (isAddModalOpen) {
          setIsAddModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topicToDelete, isAddModalOpen]);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic(newTopicName.trim());
    setNewTopicName('');
    setIsAddModalOpen(false);
  };

  const handleOpenDeleteModal = (topic: (typeof topics)[0]) => {
    setTopicToDelete(topic);
    setConfirmDeleteName('');
  };

  const handleCloseDeleteModal = () => {
    setTopicToDelete(null);
    setConfirmDeleteName('');
    setIsDeleting(false);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicToDelete) return;
    if (confirmDeleteName.trim() !== topicToDelete.name.trim()) return;

    setIsDeleting(true);
    try {
      await deleteTopic(topicToDelete.id);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Failed to delete topic', err);
      setIsDeleting(false);
    }
  };

  const affectedBugs = topicToDelete ? bugs.filter((b) => b.topicId === topicToDelete.id) : [];
  const pendingCount = affectedBugs.filter((b) => !b.isCompleted).length;
  const completedCount = affectedBugs.filter((b) => b.isCompleted).length;

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
                  <div
                    key={topic.id}
                    className={`group relative w-full flex items-center justify-between rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#DCE9FF] text-[#0051D5] font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTopicId(topic.id)}
                      className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm text-left cursor-pointer min-w-0"
                    >
                      <Layers
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-[#0051D5]' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{topic.name}</span>
                    </button>

                    {/* Delete button (only visible on hover, guarded if <= 1 topic) */}
                    <div className="pr-1.5 flex items-center">
                      {topics.length > 1 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteModal(topic);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Xóa project/topic này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span
                          className="p-1 text-slate-300 opacity-0 group-hover:opacity-60 cursor-not-allowed"
                          title="Cần duy trì tối thiểu 1 project để quản lý lỗi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
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

      {/* Delete Topic Safety Confirmation Modal (Type-to-Confirm) */}
      {topicToDelete && mounted && createPortal(
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 m-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none overflow-hidden"
          style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={handleCloseDeleteModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200 animate-in fade-in-50 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-red-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Xóa Project / Topic</h3>
                  <p className="text-[11px] text-slate-500">Cảnh báo bảo mật dữ liệu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleConfirmDelete} className="p-5 space-y-4">
              {/* Warning Alert Box */}
              <div className="p-3 bg-red-50/80 border border-red-200/80 rounded-lg text-xs text-red-900 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Hành động này mang tính vĩnh viễn và không thể hoàn tác!</span>
                </div>
                <p className="text-slate-700">
                  Bạn đang chuẩn bị xóa topic{' '}
                  <strong className="text-slate-900 font-bold">&quot;{topicToDelete.name}&quot;</strong>.
                </p>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-red-200/60">
                  {affectedBugs.length > 0 ? (
                    <span>
                      Topic này đang chứa{' '}
                      <strong className="text-red-700 font-bold">{affectedBugs.length} lỗi</strong>{' '}
                      ({pendingCount} chưa fix, {completedCount} đã fix). Tất cả danh sách lỗi và hình ảnh đính kèm sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
                    </span>
                  ) : (
                    <span>Topic này hiện chưa có lỗi nào. Dữ liệu topic sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống.</span>
                  )}
                </div>
              </div>

              {/* Type-to-Confirm Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Để xác nhận, vui lòng nhập chính xác tên topic:{' '}
                  <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 select-all">
                    {topicToDelete.name}
                  </span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder={`Gõ lại chính xác "${topicToDelete.name}"`}
                  value={confirmDeleteName}
                  onChange={(e) => setConfirmDeleteName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={confirmDeleteName.trim() !== topicToDelete.name.trim() || isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Đang xóa...' : 'Tôi hiểu, xóa topic này'}</span>
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

