// Basic service worker
self.addEventListener('install', (_event) => {
  console.log('Service Worker installing...');
});

self.addEventListener('activate', (_event) => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (_event) => {
  // Handle requests if needed
});
