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

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(res => {
        return res || fetch(event.request)
          .then(fetchRes => {

            const clone = fetchRes.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));

            return fetchRes;
          });
      })
  );

});