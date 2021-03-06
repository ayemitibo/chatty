const staticCacheName = "site-static-v3";
const dynamicCacheName = "site-dynamic-v3";
const assets = ["./", "./index.html", "./assets/asset.css", "./js/ui.js"];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install event
self.addEventListener("install", evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log("caching shell assets");
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener("activate", evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName && key !== dynamicCacheName)
          .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener("fetch", evt => {
  // console.log("fetch");
  evt.respondWith(
    caches
      .match(evt.request)
      .then(cacheRes => {
        // console.log(cacheRes);
        return (
          cacheRes ||
          fetch(evt.request).then(fetchRes => {
            return caches.open(dynamicCacheName).then(cache => {
              cache.put(evt.request.url, fetchRes.clone());
              // check cached items size
              return fetchRes;
            });
          })
        );
      })
      .catch(error => {
        console.log(error);
        if (evt.request.url.indexOf(".html") > -1) {
          return caches.match("/pages/fallback.html");
        }
      })
  );
});
