============================================================
              NOTELY - PWA SMART NOTE & TODO
============================================================

Notely là một ứng dụng web dạng Progressive Web App (PWA) 
với thiết kế "offline-first". Ứng dụng hỗ trợ ghi chú đa 
phương tiện (Văn bản, Hình ảnh, Âm thanh) và có khả năng 
hoạt động mượt mà ngay cả khi mất kết nối mạng. Tất cả dữ 
liệu sẽ được lưu cục bộ và tự động đồng bộ hóa lên server 
khi có mạng trở lại.

------------------------------------------------------------
 YÊU CẦU HỆ THỐNG (Prerequisites)
------------------------------------------------------------
- Docker và Docker Compose (Dùng để chạy toàn bộ hệ thống 
  client, server, database và proxy một cách đồng nhất).
- Trình duyệt hỗ trợ Service Worker và WebRTC (Google Chrome, 
  Microsoft Edge, Safari).

------------------------------------------------------------
 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (Installation & Setup)
------------------------------------------------------------
1. Giải nén dự án vào thư mục mong muốn.

2. Cấu hình biến môi trường:
   - Trong thư mục gốc của dự án, bạn sẽ thấy file .env.example
   - Copy file này và đổi tên thành .env
   - (File này đã được điền sẵn thông tin cấu hình Firebase test,
     JWT Secret và Ngrok token để thuận tiện cho việc chấm điểm).

3. Khởi chạy hệ thống bằng Docker:
   Mở terminal (Command Prompt, PowerShell hoặc Terminal) tại 
   thư mục gốc của dự án và chạy lệnh:
   
      docker-compose up --build

   (Lưu ý: Lần chạy đầu tiên sẽ mất chút thời gian để Docker 
   tải image và cài đặt các package cho client/server).

4. Truy cập ứng dụng:
   - Khi terminal hiển thị các dịch vụ đã khởi động xong, 
     hãy mở trình duyệt và truy cập vào: 
        http://localhost
     (Ứng dụng chạy qua Nginx ở cổng 80).
   - Truy cập http://localhost:4040 để xem Ngrok tunnel 
     (có HTTPS public URL phục vụ việc test PWA trên mobile).

------------------------------------------------------------
 HƯỚNG DẪN SỬ DỤNG CƠ BẢN (Usage)
------------------------------------------------------------
1. Tạo trang/Ghi chú: 
   - Nhấn vào biểu tượng dấu (+) trên thanh sidebar để tạo 
     Page mới.
   - Nhập nội dung vào block. Bạn có thể gõ "/" để mở menu 
     chèn Hình ảnh (gọi Camera) hoặc Âm thanh (Ghi âm).

2. Kéo thả (Drag & Drop): 
   - Hover qua một block ghi chú, dùng biểu tượng tay nắm 
     bên trái để kéo và thả, sắp xếp lại thứ tự.

3. Kiểm tra tính năng Offline:
   - Mở tab Network trong F12 (DevTools), chuyển thành "Offline" 
     (hoặc tắt Wifi).
   - Thử thêm ghi chú mới. Dữ liệu sẽ được lưu tự động xuống 
     IndexedDB cục bộ.
   - Bật mạng lại (Online). Ứng dụng sẽ tự động gọi Background Sync 
     đẩy dữ liệu lên server mà không cần ấn F5.

------------------------------------------------------------
 CẤU TRÚC THƯ MỤC CHÍNH (Project Structure)
------------------------------------------------------------
- client/               : Mã nguồn ReactJS/Vite Frontend
- server/               : Mã nguồn NodeJs/Express Backend
- nginx/                : Cấu hình Nginx reverse proxy
- docker-compose.yml    : File cấu hình để quản lý hệ thống
- midterm_report*.md    : Các file báo cáo tài liệu

Chúc bạn trải nghiệm Notely thật mượt mà!
============================================================
