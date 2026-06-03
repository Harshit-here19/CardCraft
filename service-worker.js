// 1. INCREMENT THIS VERSION NUMBER WHENEVER YOU UPDATE YOUR CODE
const CACHE_NAME = "CardCraft-v5.0"; 

const urlsToCache = [
  "./",
  "./index.html",
  "./gallery.html",
  "./style.css",
  "./script.js",
  "./gallery.js",
  "./manifest.json"
];

// Install Event: Caches the new assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Forces the waiting service worker to become active immediately
  );
});

// 2. NEW: Activate Event - Cleans up old caches automatically
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache...", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Takes control of all open pages immediately
  );
});

// Fetch Event: Serves from cache, falls back to network
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  event.respondWith(
    caches.match(event.request)
      .then(res => {
        return res || fetch(event.request)
          .then(fetchRes => {
            if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
              return fetchRes;
            }

            const clone = fetchRes.clone();
            const requestUrl = new URL(event.request.url);
            
            if (requestUrl.protocol === "http:" || requestUrl.protocol === "https:") {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone))
                .catch(err => console.warn("Cache put skipped:", err));
            }

            return fetchRes;
          });
      })
  );
});