import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase-config";

export const requestNotificationPermission = async () => {
  if (!messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Ensure this is in .env
      });
      console.log("FCM Token:", token);
      // Here you would typically send the token to your server
      return token;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
};

export const onForegroundMessage = () => {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    // You can trigger a custom UI notification here
  });
};
