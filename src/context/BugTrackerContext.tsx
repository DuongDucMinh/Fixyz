'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Topic, Assignee, Bug, Priority, SupabaseTopicRow, SupabaseAssigneeRow, SupabaseBugRow } from '@/types';
import { INITIAL_TOPICS, INITIAL_ASSIGNEES, INITIAL_BUGS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';


interface BugTrackerContextType {
  topics: Topic[];
  activeTopicId: string;
  setActiveTopicId: (id: string) => void;
  addTopic: (name: string) => Topic;
  assignees: Assignee[];
  addAssignee: (name: string) => Assignee;
  deleteAssignee: (id: string) => void;
  bugs: Bug[];
  activeBugs: Bug[];
  addBug: () => Bug;
  updateBug: (id: string, updates: Partial<Bug>) => void;
  deleteBug: (id: string) => void;
  addImageToBug: (bugId: string, image: string) => void;
  removeImageFromBug: (bugId: string, imageIndex: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedAssigneeId: string;
  setSelectedAssigneeId: (a: string) => void;
  stats: {
    pendingCount: number;
    completedCount: number;
  };
  isLoaded: boolean;
  isConnectedToSupabase: boolean;
  refreshFromSupabase: () => Promise<void>;
}

const BugTrackerContext = createContext<BugTrackerContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOPICS: 'fixyz_topics',
  ASSIGNEES: 'fixyz_assignees',
  BUGS: 'fixyz_bugs',
  ACTIVE_TOPIC: 'fixyz_active_topic',
};

export function BugTrackerProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string>('');
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');

  // Function to load latest data from Supabase
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      console.log('[Fixyz] Fetching live data from Supabase...');
      const [topicsRes, assigneesRes, bugsRes] = await Promise.all([
        supabase.from('topics').select('*').order('created_at', { ascending: true }),
        supabase.from('assignees').select('*').order('created_at', { ascending: true }),
        supabase.from('bugs').select('*').order('created_at', { ascending: false }),
      ]);

      if (topicsRes.error) {
        console.error('[Fixyz] Supabase topics query error:', topicsRes.error);
      } else if (topicsRes.data) {
        setIsConnectedToSupabase(true);
        if (topicsRes.data.length > 0) {
          const loadedTopics: Topic[] = (topicsRes.data as unknown as SupabaseTopicRow[]).map((t) => ({
            id: t.id,
            name: t.name,
            createdAt: t.created_at,
          }));
          setTopics(loadedTopics);

          // Keep active topic if it still exists, else switch to first topic
          setActiveTopicId((prev) =>
            prev && loadedTopics.some((t) => t.id === prev) ? prev : loadedTopics[0].id
          );
        }
      }

      if (assigneesRes.error) {
        console.error('[Fixyz] Supabase assignees query error:', assigneesRes.error);
      } else if (assigneesRes.data) {
        setAssignees(
          (assigneesRes.data as unknown as SupabaseAssigneeRow[]).map((a) => ({
            id: a.id,
            name: a.name,
            avatar: a.avatar || '',
          }))
        );
      }

      if (bugsRes.error) {
        console.error('[Fixyz] Supabase bugs query error:', bugsRes.error);
      } else if (bugsRes.data) {
        setBugs(
          (bugsRes.data as unknown as SupabaseBugRow[]).map((b) => ({
            id: b.id,
            topicId: b.topic_id,
            images: Array.isArray(b.images) ? b.images : [],
            description: b.description || '',
            priority: (b.priority as Priority) || 'Trung bình',
            assigneeId: b.assignee_id || '',
            isCompleted: Boolean(b.is_completed),
            createdAt: b.created_at,
          }))
        );
      }

      console.log('[Fixyz] Successfully synced with Supabase!');
    } catch (err) {
      console.error('[Fixyz] Error loading data from Supabase:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      let hasLocalCache = false;

      // 1. FIRST: Instantly restore from localStorage (0ms latency, synchronous)
      try {
        const savedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);
        const savedAssignees = localStorage.getItem(STORAGE_KEYS.ASSIGNEES);
        const savedBugs = localStorage.getItem(STORAGE_KEYS.BUGS);
        const savedActiveTopic = localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC);

        if (savedTopics) {
          const parsedTopics = JSON.parse(savedTopics);
          if (Array.isArray(parsedTopics) && parsedTopics.length > 0) {
            setTopics(parsedTopics);
            const activeId = savedActiveTopic && parsedTopics.some((t: Topic) => t.id === savedActiveTopic)
              ? savedActiveTopic
              : parsedTopics[0].id;
            setActiveTopicId(activeId);
            hasLocalCache = true;
          }
        }

        if (savedAssignees) {
          const parsedAssignees = JSON.parse(savedAssignees);
          if (Array.isArray(parsedAssignees)) {
            setAssignees(parsedAssignees);
          }
        }

        if (savedBugs) {
          const parsedBugs = JSON.parse(savedBugs);
          if (Array.isArray(parsedBugs)) {
            setBugs(parsedBugs);
          }
        }
      } catch (e) {
        console.warn('[Fixyz] Failed to restore from localStorage', e);
      }

      // 2. Fetch live data from Supabase if configured, or use demo fallback if completely offline & uninitialized
      try {
        if (isSupabaseConfigured) {
          await refreshFromSupabase();
        } else if (!hasLocalCache) {
          // Demo fallback: only when Supabase is not configured AND no cache exists
          setTopics(INITIAL_TOPICS);
          setActiveTopicId(INITIAL_TOPICS[0].id);
          setAssignees(INITIAL_ASSIGNEES);
          setBugs(INITIAL_BUGS);
        }
      } catch (e) {
        console.error('[Fixyz] Init load error:', e);
      } finally {
        setIsLoaded(true);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFromSupabase]);


  // Save to localStorage as local cache
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, activeTopicId);
      localStorage.setItem(STORAGE_KEYS.ASSIGNEES, JSON.stringify(assignees));
      localStorage.setItem(STORAGE_KEYS.BUGS, JSON.stringify(bugs));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [topics, activeTopicId, assignees, bugs, isLoaded]);

  // Add topic
  const addTopic = (name: string): Topic => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setTopics((prev) => [...prev, newTopic]);
    setActiveTopicId(newTopic.id);

    if (isSupabaseConfigured) {
      supabase
        .from('topics')
        .insert({
          id: newTopic.id,
          name: newTopic.name,
          created_at: newTopic.createdAt,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase addTopic error]:', error.message);
          else console.log('[Supabase addTopic success]:', newTopic.id);
        });
    }

    return newTopic;
  };

  // Add assignee
  const addAssignee = (name: string): Assignee => {
    const newAssignee: Assignee = {
      id: `assignee-${Date.now()}`,
      name: name.trim(),
      avatar: '',
    };
    setAssignees((prev) => [...prev, newAssignee]);

    if (isSupabaseConfigured) {
      supabase
        .from('assignees')
        .insert({
          id: newAssignee.id,
          name: newAssignee.name,
          avatar: '',
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase addAssignee error]:', error.message);
          else console.log('[Supabase addAssignee success]:', newAssignee.id);
        });
    }

    return newAssignee;
  };

  // Delete assignee
  const deleteAssignee = async (id: string) => {
    setAssignees((prev) => prev.filter((a) => a.id !== id));
    setBugs((prev) =>
      prev.map((b) => (b.assigneeId === id ? { ...b, assigneeId: '' } : b))
    );

    if (isSupabaseConfigured) {
      try {
        // 1. Unassign all bugs with this assignee first to satisfy foreign key constraint
        await supabase
          .from('bugs')
          .update({ assignee_id: null })
          .eq('assignee_id', id);

        // 2. Safely delete assignee record
        const { error } = await supabase
          .from('assignees')
          .delete()
          .eq('id', id);

        if (error) console.error('[Supabase deleteAssignee error]:', error.message);
        else console.log('[Supabase deleteAssignee success]:', id);
      } catch (err) {
        console.error('[Supabase deleteAssignee exception]:', err);
      }
    }
  };

  // Add bug
  const addBug = (): Bug => {
    // Select first valid assignee if exists
    const defaultAssigneeId = assignees[0]?.id || '';
    const newBug: Bug = {
      id: `bug-${Date.now()}`,
      topicId: activeTopicId,
      images: [],
      description: '',
      priority: 'Trung bình',
      assigneeId: defaultAssigneeId,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setBugs((prev) => [newBug, ...prev]);

    if (isSupabaseConfigured) {
      // Validate that assigneeId exists in assignees, otherwise send null
      const isValidAssignee = defaultAssigneeId
        ? assignees.some((a) => a.id === defaultAssigneeId)
        : false;

      supabase
        .from('bugs')
        .insert({
          id: newBug.id,
          topic_id: newBug.topicId,
          images: newBug.images,
          description: newBug.description,
          priority: newBug.priority,
          assignee_id: isValidAssignee ? defaultAssigneeId : null,
          is_completed: newBug.isCompleted,
          created_at: newBug.createdAt,
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase addBug error]:', error.message);
          else console.log('[Supabase addBug success]:', newBug.id);
        });
    }

    return newBug;
  };

  // Update bug
  const updateBug = (id: string, updates: Partial<Bug>) => {
    setBugs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );

    if (isSupabaseConfigured) {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.topicId !== undefined) dbUpdates.topic_id = updates.topicId;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.assigneeId !== undefined) {
        // Validate against current assignees list to prevent foreign key constraint violation
        const isValid = updates.assigneeId
          ? assignees.some((a) => a.id === updates.assigneeId)
          : false;
        dbUpdates.assignee_id = isValid ? updates.assigneeId : null;
      }
      if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;

      supabase
        .from('bugs')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase updateBug error]:', error.message);
          else console.log('[Supabase updateBug success]:', id, dbUpdates);
        });
    }
  };



  // Delete bug
  const deleteBug = (id: string) => {
    setBugs((prev) => prev.filter((b) => b.id !== id));

    if (isSupabaseConfigured) {
      supabase
        .from('bugs')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[Supabase deleteBug error]:', error.message);
          else console.log('[Supabase deleteBug success]:', id);
        });
    }
  };

  // Add image to bug
  const addImageToBug = (bugId: string, image: string) => {
    setBugs((prev) => {
      const target = prev.find((b) => b.id === bugId);
      const updatedImages = target ? [...target.images, image] : [image];
      updateBug(bugId, { images: updatedImages });
      return prev.map((b) => (b.id === bugId ? { ...b, images: updatedImages } : b));
    });
  };

  // Remove image from bug
  const removeImageFromBug = (bugId: string, imageIndex: number) => {
    setBugs((prev) => {
      const target = prev.find((b) => b.id === bugId);
      if (!target) return prev;
      const updatedImages = target.images.filter((_, idx) => idx !== imageIndex);
      updateBug(bugId, { images: updatedImages });
      return prev.map((b) => (b.id === bugId ? { ...b, images: updatedImages } : b));
    });
  };

  // Calculate bugs for active topic with filter applied
  const topicBugs = bugs.filter((b) => b.topicId === activeTopicId);

  const stats = {
    pendingCount: topicBugs.filter((b) => !b.isCompleted).length,
    completedCount: topicBugs.filter((b) => b.isCompleted).length,
  };

  const filteredBugs = topicBugs.filter((bug) => {
    if (selectedPriority !== 'all' && bug.priority !== selectedPriority) {
      return false;
    }
    if (selectedAssigneeId !== 'all' && bug.assigneeId !== selectedAssigneeId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = bug.description.toLowerCase().includes(q);
      const assignee = assignees.find((a) => a.id === bug.assigneeId);
      const matchAssignee = assignee ? assignee.name.toLowerCase().includes(q) : false;
      return matchDesc || matchAssignee;
    }
    return true;
  });

  return (
    <BugTrackerContext.Provider
      value={{
        topics,
        activeTopicId,
        setActiveTopicId,
        addTopic,
        assignees,
        addAssignee,
        deleteAssignee,
        bugs,
        activeBugs: filteredBugs,
        addBug,
        updateBug,
        deleteBug,
        addImageToBug,
        removeImageFromBug,
        searchQuery,
        setSearchQuery,
        selectedPriority,
        setSelectedPriority,
        selectedAssigneeId,
        setSelectedAssigneeId,
        stats,
        isLoaded,
        isConnectedToSupabase,
        refreshFromSupabase,
      }}
    >
      {children}
    </BugTrackerContext.Provider>
  );
}

export function useBugTracker() {
  const context = useContext(BugTrackerContext);
  if (!context) {
    throw new Error('useBugTracker must be used within a BugTrackerProvider');
  }
  return context;
}
