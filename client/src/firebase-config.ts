import { initializeApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Only initialize Firebase if real config values are provided
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key';

let app: ReturnType<typeof initializeApp> | null = null;
let messaging: Messaging | null = null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      messaging = getMessaging(app);
    }
  } catch (err) {
    console.warn('Firebase initialization skipped:', err);
  }
}

export { app, messaging };
export default app;
