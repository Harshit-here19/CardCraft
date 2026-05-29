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

  event.respondWith(

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request)
          .then(fetchRes => {

            return caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  fetchRes.clone()
                );

                return fetchRes;

              });

          });

      })

  );

});