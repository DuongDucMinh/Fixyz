import { Topic, Assignee, Bug } from '@/types';

export const INITIAL_TOPICS: Topic[] = [
  { id: 'topic-1', name: 'Fix VLearn', createdAt: '2026-03-01T08:00:00.000Z' },
  { id: 'topic-2', name: 'Fix Video', createdAt: '2026-03-02T09:30:00.000Z' },
];

export const INITIAL_ASSIGNEES: Assignee[] = [
  {
    id: 'assignee-1',
    name: 'Minh Tran',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'assignee-2',
    name: 'Huy Dang',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'assignee-3',
    name: 'Linh Nguyen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'assignee-4',
    name: 'Thao Pham',
    avatar: '',
  },
];

export const INITIAL_BUGS: Bug[] = [
  {
    id: 'bug-1',
    topicId: 'topic-1',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Lỗi tràn layout thanh progress bar khi phóng to màn hình full-screen trên Safari 17.2 và giật khung hình khi tua nhanh video x2.',
    priority: 'Cao',
    assigneeId: 'assignee-1',
    isCompleted: false,
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'bug-2',
    topicId: 'topic-1',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Không submit được bài kiểm tra trắc nghiệm khi mạng chập chờn, không hiển thị thông báo lỗi retry cho học viên.',
    priority: 'Trung bình',
    assigneeId: 'assignee-2',
    isCompleted: false,
    createdAt: '2026-03-01T11:30:00.000Z',
  },
  {
    id: 'bug-3',
    topicId: 'topic-1',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Nút đăng nhập Google bị lệch 12px về bên trái trên màn hình Retina, thiếu state disabled khi click liên tục.',
    priority: 'Cao',
    assigneeId: 'assignee-3',
    isCompleted: false,
    createdAt: '2026-03-01T14:15:00.000Z',
  },
  {
    id: 'bug-4',
    topicId: 'topic-1',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Sai chính tả tiêu đề phần Giới thiệu khóa học & đè icon vào văn bản trên màn hình mobile width 375px.',
    priority: 'Thấp',
    assigneeId: 'assignee-4',
    isCompleted: true,
    createdAt: '2026-03-02T09:00:00.000Z',
  },
  {
    id: 'bug-5',
    topicId: 'topic-1',
    images: [],
    description: 'Tải file PDF chứng chỉ hoàn thành bị mất watermark và font tiếng Việt có dấu bị vỡ ký tự Unicode trong tên học viên.',
    priority: 'Trung bình',
    assigneeId: 'assignee-2',
    isCompleted: false,
    createdAt: '2026-03-02T13:45:00.000Z',
  },
  {
    id: 'bug-6',
    topicId: 'topic-2',
    images: [
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
    ],
    description: 'Player không tự động giảm độ phân giải xuống 720p khi băng thông yếu dưới 2Mbps.',
    priority: 'Trung bình',
    assigneeId: 'assignee-1',
    isCompleted: false,
    createdAt: '2026-03-02T15:20:00.000Z',
  },
];
