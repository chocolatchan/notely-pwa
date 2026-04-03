# Notely - PWA Smart Note & Todo App

Notely là một ứng dụng web dạng Progressive Web App (PWA) với thiết kế "offline-first". Ứng dụng hỗ trợ ghi chú đa phương tiện (Văn bản, Hình ảnh, Âm thanh) và có khả năng hoạt động mượt mà ngay cả khi mất kết nối mạng. Tất cả dữ liệu sẽ được lưu cục bộ và tự động đồng bộ hóa lên server khi có mạng rở lại.

## Yêu cầu hệ thống (Prerequisites)
- **Docker** và **Docker Compose** (Dùng để chạy toàn bộ hệ thống client, server, database và proxy một cách đồng nhất).
- Trình duyệt hỗ trợ Service Worker và WebRTC (Google Chrome, Microsoft Edge, Safari).

## Hướng dẫn Cài đặt & Khởi chạy (Installation & Setup)

1. **Giải nén dự án** vào thư mục mong muốn.
2. **Cấu hình biến môi trường**:
   - Trong thư mục gốc của dự án, bạn sẽ thấy file `.env.example`.
   - Copy file này và đổi tên thành `.env` (Hoặc chạy lệnh `cp .env.example .env`).
   - File này đã được điền sẵn thông tin cấu hình Firebase test, JWT Secret và Ngrok token để thuận tiện cho việc chấm điểm.
3. **Khởi chạy hệ thống nền tảng Docker**:
   Mở terminal (Command Prompt, PowerShell hoặc Terminal) tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`) và chạy lệnh:
   ```bash
   docker-compose up --build
   ```
   > *Lưu ý: Lần chạy đầu tiên sẽ mất chút thời gian để Docker tải image và cài đặt các package `node_modules` cho client và server.*

4. **Truy cập ứng dụng**:
   - Khi terminal hiển thị các dịch vụ đã khởi động xong, hãy mở trình duyệt và truy cập vào: **http://localhost** (ứng dụng chạy qua Nginx ở cổng 80).
   - Nếu bạn muốn test PWA remote flow với Ngrok: Truy cập bảng điều khiển Ngrok tại **http://localhost:4040** để lấy HTTPS URL public.

## Hướng dẫn sử dụng cơ bản (Usage)

1. **Tạo trang/Ghi chú**: 
   - Nhấn vào biểu tượng dấu cộng (`+`) trên thanh sidebar để tạo một "Page" mới.
   - Nhập nội dung vào các block. Bạn có thể gõ `/` để mở menu lệnh chèn Hình ảnh (gọi Camera) hoặc Âm thanh (Ghi âm).
2. **Kéo thả (Drag & Drop)**: 
   - Hover qua một block ghi chú, dùng biểu tượng tay nắm bên trái để kéo và thả, sắp xếp lại thứ tự.
3. **Kiểm tra tính năng Offline**:
   - Mở tab Network trong F12 (DevTools), chuyển thành "Offline" (hoặc tắt Wifi).
   - Thử thêm ghi chú mới. Dữ liệu sẽ được lưu tự động xuống IndexedDB.
   - Bật lại mạng sang "Online", ứng dụng sẽ tự động Background Sync tải dữ liệu lên server MongoDB mà không cần tải lại trang.

## Cấu trúc thư mục (Project Structure)
- `client/`: Mã nguồn ReactJS/Vite Frontend.
- `server/`: Mã nguồn NodeJs/Express Backend.
- `nginx/`: Cấu hình Nginx reverse proxy (giải quyết CORS và định tuyến).
- `docker-compose.yml`: File orchestration quản lý các container.
