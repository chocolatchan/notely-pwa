**✅ GUIDELINE CHI TIẾT CHO PROJECT “NOTELY” – Offline Smart Note & Todo PWA**

Dưới đây là **hướng dẫn hoàn chỉnh, thực tế và theo đúng yêu cầu đề tài số 2 (Progressive Web Apps)** để nhóm bạn có thể bắt tay vào code ngay từ hôm nay. Guideline này được cập nhật theo best practices 2026 (Vite + React + vite-plugin-pwa).

### 1. Giới thiệu Project
- **Tên app**: Notely (hoặc Notely – Offline Smart Notes)
- **Mô tả**: Ứng dụng ghi chú / Todo list hoạt động **hoàn toàn offline**, có thể cài đặt lên màn hình chính như app native, nhận **push notification nhắc nhở**, và hỗ trợ **thêm ghi chú bằng giọng nói** (voice input qua microphone).
- **Lý do chọn**: Đáp ứng **đầy đủ** 3 yêu cầu demo chính của đề tài (Offline + Push + Hardware), dễ triển khai, demo video ấn tượng, dễ đạt full 2.0 điểm Scope & Detail.

### 2. Tính năng chính (Scope & Detail)

**Bắt buộc (để đạt full điểm):**
1. CRUD Todo & Note (thêm/sửa/xóa/hoàn thành).
2. **Offline 100%** – Service Worker cache App Shell + dữ liệu.
3. **Push Notification** – Đặt reminder → nhận push (dùng Firebase Cloud Messaging).
4. **Voice Input** – Nút microphone → SpeechRecognition API chuyển giọng nói thành todo/note.
5. **Installable PWA** – Web App Manifest + “Add to Home screen”.

**Nâng cao (để nổi bật):**
- Categories (Công việc, Học tập, Cá nhân…).
- Search + filter.
- Dark/Light mode.
- Background Sync (tự động sync khi có mạng).
- Vibration feedback khi hoàn thành task.
- Export/Import JSON.

### 3. Tech Stack (khuyến nghị 2026)
- **Framework**: React + Vite (nhanh, hiện đại).
- **PWA**: `vite-plugin-pwa` (injectManifest strategy – dễ tích hợp Firebase).
- **Offline DB**: IndexedDB (dùng thư viện `idb` cho dễ).
- **Push Notification**: Firebase Cloud Messaging (FCM).
- **Voice**: Web Speech API (SpeechRecognition) – built-in, không cần thư viện ngoài.
- **UI**: Tailwind CSS (hoặc shadcn/ui nếu muốn đẹp nhanh).
- **Deploy**: Vercel / Netlify (miễn phí, HTTPS tự động).

### 4. Cấu trúc Project (Folder Structure)

```
notely-pwa/
├── public/
│   ├── icons/                  # icon-192.png, icon-512.png, maskable-icon...
│   └── manifest.json
├── src/
│   ├── components/             # TodoList, NoteCard, VoiceButton...
│   ├── lib/
│   │   ├── db.ts               # IndexedDB functions
│   │   ├── push.ts             # FCM logic
│   │   └── sw.ts               # (nếu cần custom)
│   ├── pages/                  # Home, Settings...
│   ├── App.tsx
│   ├── main.tsx
│   └── service-worker.ts       # Custom service worker (injectManifest)
├── vite.config.ts
├── firebase-config.ts          # Firebase keys (đặt trong .env)
├── README.md
├── package.json
└── .env.example
```

### 5. Hướng dẫn Setup ban đầu (30 phút)

1. Tạo project:
```bash
npm create vite@latest notely-pwa -- --template react-ts
cd notely-pwa
npm install
```

2. Cài các package cần thiết:
```bash
npm install idb firebase tailwindcss postcss autoprefixer
npm install -D vite-plugin-pwa @types/node
```

3. Cấu hình Tailwind (nếu dùng).

4. Cấu hình **vite-plugin-pwa** trong `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      manifest: {
        name: 'Notely - Offline Notes',
        short_name: 'Notely',
        description: 'Ghi chú offline thông minh với giọng nói',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [ /* array icons */ ]
      },
      injectManifest: {
        rollupFormat: 'iife',
      },
      devOptions: { enabled: true }
    })
  ]
});
```

5. Tạo Firebase project (console.firebase.google.com) → lấy config → tạo file `firebase-config.ts`.

### 6. Các bước triển khai (4 tuần)

**Tuần 1: Setup + Core UI + IndexedDB**
- Tạo giao diện Todo & Note.
- Implement CRUD với IndexedDB (`lib/db.ts`).
- Test offline (mở DevTools → Network → Offline).

**Tuần 2: PWA Core**
- Hoàn thiện `manifest.json` + icons.
- Service Worker (cache App Shell + API responses).
- Thêm nút Install prompt.

**Tuần 3: Voice Input + Push Notification**
- Voice Button → `navigator.mediaDevices` + `SpeechRecognition`.
- FCM setup (request permission + subscribe).
- Tạo reminder → lưu vào IndexedDB + gửi push.

**Tuần 4: Nâng cao + Test + Video**
- Background Sync, categories, search.
- Test Lighthouse (PWA score ≥ 90).
- Quay video demo.

### 7. Code Snippets Quan Trọng

**Voice Input (src/components/VoiceButton.tsx)**
```tsx
const startVoice = () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'vi-VN';
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    // Thêm todo/note từ text
  };
  recognition.start();
};
```

**Push Notification (Firebase)**
- Dùng `firebase/messaging` + service worker để handle background messages.

**IndexedDB cơ bản**
```ts
import { openDB } from 'idb';
const db = await openDB('notely-db', 1, {
  upgrade(db) {
    db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
  }
});
```

### 8. Testing & Demo
- **Offline**: Tắt mạng → app vẫn chạy đầy đủ.
- **Push**: Đóng tab → vẫn nhận thông báo.
- **Voice**: Test trên Chrome/Android (tốt nhất).
- **Lighthouse**: Chạy audit → phải đạt PWA, Performance, Accessibility cao.

### 9. Deployment
- `npm run build`
- Deploy lên Vercel/Netlify (tự động detect PWA).

### 10. README.md (bắt buộc phải có)

Mình sẽ cung cấp mẫu README đầy đủ khi bạn cần (bao gồm:
- Hướng dẫn install & run
- Firebase setup
- System requirements
- Commands
- Link demo video).

### 11. Liên kết với yêu cầu đề tài & báo cáo
- Báo cáo sẽ có chương riêng: “Triển khai PWA trong Notely” → screenshot Service Worker, Manifest, code voice/push, kết quả Lighthouse.
- Video: 15–18 phút (lý thuyết 4 phút + demo live 10 phút + code 4 phút).

Bạn muốn mình đưa tiếp phần nào ngay bây giờ?

1. **Mẫu README.md đầy đủ** (copy-paste luôn được).
2. **Toàn bộ code khởi tạo** (vite.config + service-worker.ts + db.ts + firebase).
3. **Dàn ý chi tiết báo cáo** (mục lục 20–60 trang).
4. **Hướng dẫn tạo icon + manifest.json**.

Cứ reply số hoặc mô tả bạn cần bước nào trước, mình xuất ngay! 🚀