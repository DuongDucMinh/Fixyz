-- ============================================================
-- FIXYZ - QA BUG TRACKER: SUPABASE SCHEMA MIGRATION SCRIPT
-- Copy và dán toàn bộ đoạn code này vào mục "SQL Editor" trên Supabase Dashboard và bấm RUN.
-- ============================================================

-- 1. BẢNG TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BẢNG ASSIGNEES (Người phụ trách)
CREATE TABLE IF NOT EXISTS public.assignees (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Member',
    avatar TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BẢNG BUGS (Danh sách lỗi)
CREATE TABLE IF NOT EXISTS public.bugs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    images JSONB NOT NULL DEFAULT '[]'::JSONB,
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'Trung bình' CHECK (priority IN ('Cao', 'Trung bình', 'Thấp')),
    assignee_id TEXT REFERENCES public.assignees(id) ON DELETE SET NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BẬT ROW LEVEL SECURITY (RLS) CHO CÁC BẢNG
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

-- 5. CHÍNH SÁCH TRUY CẬP (Cho phép đọc & ghi ẩn danh hoặc theo user)
DROP POLICY IF EXISTS "Public access topics" ON public.topics;
CREATE POLICY "Public access topics" ON public.topics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access assignees" ON public.assignees;
CREATE POLICY "Public access assignees" ON public.assignees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access bugs" ON public.bugs;
CREATE POLICY "Public access bugs" ON public.bugs FOR ALL USING (true) WITH CHECK (true);

-- 6. TẠO STORAGE BUCKET ĐỂ LƯU ẢNH (bug-images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-images', 'bug-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- CHÍNH SÁCH STORAGE: Cho phép xem và upload ảnh
DROP POLICY IF EXISTS "Public view bug images" ON storage.objects;
CREATE POLICY "Public view bug images" ON storage.objects FOR SELECT USING (bucket_id = 'bug-images');

DROP POLICY IF EXISTS "Public upload bug images" ON storage.objects;
CREATE POLICY "Public upload bug images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bug-images');

-- 7. CHÈN DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO public.topics (id, name) VALUES
    ('topic-1', 'Fix VLearn'),
    ('topic-2', 'Fix Video')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assignees (id, name, role, avatar) VALUES
    ('assignee-1', 'Minh Tran', 'Frontend Lead', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'),
    ('assignee-2', 'Huy Dang', 'Backend', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'),
    ('assignee-3', 'Linh Nguyen', 'QA Specialist', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'),
    ('assignee-4', 'Thao Pham', 'Design QA', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bugs (id, topic_id, images, description, priority, assignee_id, is_completed) VALUES
    ('bug-1', 'topic-1', '["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80"]'::JSONB, 'Lỗi tràn layout thanh progress bar khi phóng to màn hình full-screen trên Safari 17.2 và giật khung hình khi tua nhanh video x2.', 'Cao', 'assignee-1', FALSE),
    ('bug-2', 'topic-1', '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"]'::JSONB, 'Không submit được bài kiểm tra trắc nghiệm khi mạng chập chờn, không hiển thị thông báo lỗi retry cho học viên.', 'Trung bình', 'assignee-2', FALSE),
    ('bug-3', 'topic-1', '["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80"]'::JSONB, 'Nút đăng nhập Google bị lệch 12px về bên trái trên màn hình Retina, thiếu state disabled khi click liên tục.', 'Cao', 'assignee-3', FALSE),
    ('bug-4', 'topic-1', '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"]'::JSONB, 'Sai chính tả tiêu đề phần Giới thiệu khóa học & đè icon vào văn bản trên màn hình mobile width 375px.', 'Thấp', 'assignee-4', TRUE),
    ('bug-5', 'topic-1', '[]'::JSONB, 'Tải file PDF chứng chỉ hoàn thành bị mất watermark và font tiếng Việt có dấu bị vỡ ký tự Unicode trong tên học viên.', 'Trung bình', 'assignee-2', FALSE),
    ('bug-6', 'topic-2', '["https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80"]'::JSONB, 'Player không tự động giảm độ phân giải xuống 720p khi băng thông yếu dưới 2Mbps.', 'Trung bình', 'assignee-1', FALSE)
ON CONFLICT (id) DO NOTHING;
