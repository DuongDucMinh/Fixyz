# Hướng dẫn kết nối Supabase cho Fixyz

Dưới đây là các bước chi tiết để kết nối cơ sở dữ liệu Supabase cho ứng dụng Fixyz:

---

### Bước 1: Tạo dự án mới trên Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập hoặc đăng ký tài khoản (hoàn toàn miễn phí).
2. Nhấn nút **"New Project"**.
3. Điền các thông tin:
   - **Name**: `Fixyz` (hoặc tên tùy thích)
   - **Database Password**: Nhập mật khẩu mạnh và lưu lại
   - **Region**: Chọn khu vực gần Việt Nam nhất (ví dụ: `Singapore - ap-southeast-1`)
4. Bấm **"Create new project"** và chờ khoảng 1-2 phút để hệ thống khởi tạo cơ sở dữ liệu.

---

### Bước 2: Lấy thông tin URL & API Anon Key
1. Tại màn hình Dashboard dự án Supabase, bấm vào biểu tượng **Settings** (Bánh răng ở góc trái dưới) hoặc chọn **Project Settings**.
2. Chọn mục **API** (nằm dưới mục Configuration).
3. Copy 2 giá trị sau:
   - **Project URL**: Ví dụ `https://xyzcompany.supabase.co`
   - **Project API Keys**: Copy key có tên `anon` `public` (Ví dụ: `eyJhbGciOiJIUzI1Ni...`)

---

### Bước 3: Thiết lập biến môi trường trong dự án Fixyz
1. Tạo một file tên là `.env.local` ở thư mục gốc của dự án (`d:\Python\lab_coach_vin\Fixyz\.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
2. Thay thế giá trị bằng URL và Key bạn vừa copy ở Bước 2.

---

### Bước 4: Tạo Bảng và Dữ liệu mẫu (Run SQL Script)
1. Trong màn hình dự án Supabase, nhìn menu bên trái và chọn biểu tượng **SQL Editor**.
2. Nhấn nút **"New query"**.
3. Mở file [supabase_schema.sql](supabase_schema.sql) trong thư mục dự án Fixyz, sao chép toàn bộ nội dung và dán vào ô soạn thảo SQL trên Supabase.
4. Bấm nút **"Run"** (hoặc `Ctrl + Enter`).
5. Kết quả thông báo `Success. No rows returned` nghĩa là tất cả các bảng (`topics`, `assignees`, `bugs`), Storage bucket (`bug-images`), RLS policies và dữ liệu mẫu đã được tạo thành công!

---

### Bước 5: Kiểm tra dữ liệu trên Supabase
- Vào mục **Table Editor** ở menu bên trái:
  - Bảng `topics`: Xem các topic hiện có.
  - Bảng `assignees`: Xem danh sách thành viên phân công.
  - Bảng `bugs`: Xem danh sách lỗi, hình ảnh, trạng thái check hoàn thành.
- Vào mục **Storage**:
  - Bucket `bug-images`: Nơi lưu trữ tất cả hình ảnh đính kèm lỗi của tester.

Khi hoàn tất các bước trên, Fixyz sẽ tự động nhận diện kết nối Supabase và đồng bộ dữ liệu trực tiếp lên đám mây!
