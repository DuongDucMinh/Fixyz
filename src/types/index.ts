export type Priority = 'Cao' | 'Trung bình' | 'Thấp';

export interface Topic {
  id: string;
  name: string;
  createdAt: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Bug {
  id: string;
  topicId: string;
  images: string[];
  description: string;
  priority: Priority;
  assigneeId: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface SupabaseTopicRow {
  id: string;
  name: string;
  created_at: string;
}

export interface SupabaseAssigneeRow {
  id: string;
  name: string;
  role?: string;
  avatar?: string | null;
  created_at?: string;
}

export interface SupabaseBugRow {
  id: string;
  topic_id: string;
  images: string[] | null;
  description: string | null;
  priority: string;
  assignee_id: string | null;
  is_completed: boolean;
  created_at: string;
}

