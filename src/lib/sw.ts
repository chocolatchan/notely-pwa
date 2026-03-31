// Custom service worker registration and helper logic
export const registerSW = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('SW registration successful with scope: ', registration.scope);
      } catch (err) {
        console.log('SW registration failed: ', err);
      }
    }
  };
