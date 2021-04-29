const CACHE = "NetworkOrCache.V1"
const CACHED_FILES = [
  "/",
  "/index.html",
  "/styles/main.css",
  "/scripts/main.js",
]
const TIMEOUT = 400

self.addEventListener("install", evn => {
  evn.waitUntil(
    caches.open(CACHE)
    .then(cache => cache.addAll(CACHED_FILES))
    .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", evn => {
  evn.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", evn => {
  // if(evn.request.url.indexOf("/api") != -1) {}
  evn.respondWith(fromNetwork(evn.request)
  .catch((err) => {
    console.log(`Error: ${err.message}`)
    return fromCache(evn.request)
  }))
})

function fromNetwork(request) {
  // return fetch(request)
  //   .then((response) => response.ok ? response : fromCache(request))
  //   .catch(() => fromCache(request))
  return new Promise((resolve, reject) => {
    var tmr = setTimeout(reject, TIMEOUT)
    fetch(request).then((response) => {
      clearTimeout(tmr)
      console.log("fromNetwork", request.url)
      resolve(response)
    }, reject)
  })
}

function fromCache(request) {
  console.log("fromCache", request.url)
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject('no-match')
    ))
}
