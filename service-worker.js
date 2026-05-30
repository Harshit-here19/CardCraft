const CACHE_NAME = "CardCraft";

const urlsToCache = [
  "./",
  "./index.html",
  "./gallery.html",
  "./style.css",
  "./script.js",
  "./gallery.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  // 1. Skip non-GET requests immediately
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // 2. Clear global check for non-web protocols
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(res => {
        return res || fetch(event.request)
          .then(fetchRes => {
            // Check if response is valid before cloning/caching
            if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
              return fetchRes;
            }

            const clone = fetchRes.clone();

            // 3. THE FIX: Double-check the URL protocol right here before putting it in cache
            const requestUrl = new URL(event.request.url);
            if (requestUrl.protocol === "http:" || requestUrl.protocol === "https:") {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone))
                .catch(err => console.warn("Cache put skipped:", err)); // Safely catches rogue internal edge cases
            }

            return fetchRes;
          });
      })
  );
});