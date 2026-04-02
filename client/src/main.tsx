/// <reference types="vite-plugin-pwa/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Ứng dụng có bản cập nhật mới. Tải lại ngay?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Ứng dụng đã sẵn sàng hoạt động offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
