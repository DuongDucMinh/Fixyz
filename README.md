# Fixyz - Modern QA Bug Tracker

Fixyz là ứng dụng web quản lý và theo dõi lỗi kiểm thử (QA Bug Tracker) hiện đại, tối ưu cho tốc độ làm việc của Tester và Developer, lấy cảm hứng từ bản thiết kế Figma chuẩn mực.

---

## ✨ Tính năng nổi bật

- **Quản lý Topic / Dự án tách biệt:**
  - Sidebar chuyển đổi mượt mà giữa các dự án (`Fix VLearn`, `Fix Video`...).
  - Thêm topic mới nhanh chóng qua dialog.
- **Bảng quản lý lỗi (Bug Table) thông minh:**
  - Cố định chiều rộng cột (`table-fixed`), không bị rung lắc hay xê dịch khi thao tác.
  - Ô nhập **Mô tả chi tiết & Module** tự động co giãn chiều cao theo nội dung, hiển thị trọn vẹn 5+ dòng mà không bị che khuất bởi thanh cuộn.
  - Checkbox đánh dấu **Đã fix** với hiệu ứng trực quan gạch ngang dòng lỗi.
- **Quản lý ảnh chụp màn hình (Screenshot) chuyên nghiệp:**
  - Hỗ trợ dán ảnh trực tiếp từ Clipboard (**Ctrl + V**), kéo thả nhiều ảnh cùng lúc hoặc chọn từ máy tính.
  - **Lightbox Modal (Trình xem ảnh toàn màn hình):**
    * Nổi trên lớp nền Portal độc lập (`createPortal`), không bị giới hạn chiều cao hay tạo thanh cuộn bảng.
    * 2 nút chuyển ảnh trái/phải đặt hoàn toàn bên ngoài khu vực ảnh.
    * Nút **Xóa ảnh** trực tiếp khi đang xem (kèm xác nhận) nếu tester up nhầm ảnh.
    * Nút **Tải về** máy tính chất lượng cao.
- **Phân công & Mức độ ưu tiên an toàn:**
  - Dropdown chọn Người phụ trách và Mức độ ưu tiên dạng Portal, hỗ trợ thêm thành viên mới, xóa thành viên hoặc chọn *Chưa phân công*.
  - Tự động bảo vệ toàn vẹn khóa ngoại PostgreSQL (Supabase Foreign Key Protection).
- **Tìm kiếm & Bộ lọc đa tiêu chí (FilterBar):**
  - Tìm kiếm theo từ khóa mô tả.
  - Lọc theo mức độ ưu tiên: Tất cả, Khẩn cấp, Cao, Trung bình, Thấp.
  - Lọc theo người phụ trách.
- **Đồng bộ thời gian thực với Supabase (Real-time 2-way Sync):**
  - Tự động đồng bộ lên cơ sở dữ liệu Supabase kèm cơ chế optimistic UI và lưu bộ nhớ đệm `localStorage`.

---

## 🛠️ Công nghệ sử dụng

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Styling:** [Tailwind CSS v3](https://tailwindcss.com/), Lucide React Icons
- **Ngôn ngữ:** TypeScript (Strict Type Safety)
- **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **Kiến trúc:** React 19 với `useSyncExternalStore` & React Portals

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` từ file mẫu `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*(Khởi tạo cấu trúc bảng theo file `supabase_schema.sql` trong trang quản trị Supabase SQL Editor).*

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### 4. Kiểm thử tự động (Automated Tests)
```bash
npm test
```

### 5. Kiểm tra chất lượng mã nguồn (Lint)
```bash
npm run lint
```

### 6. Biên dịch sản phẩm (Build)
```bash
npm run build
```

---

## 📄 License
MIT License. Phát triển bởi Fixyz Team.
