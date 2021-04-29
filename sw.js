const CACHE = "NetworkOrCache.V1"
const TIMEOUT = 400

self.addEventListener("install", evn => {
  evn.waitUntil(
    caches.open(CACHE)
    .then(cache => cache.addAll([
        "/",
        "/index.html",
        "/sw.js",
        "/styles/main.css",
        "/scripts/main.js",
      ])
    )
    .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", evn => {
  evn.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", evn => {
  console.log(evn.request.url)
  // if(evn.request.url.indexOf("/api") != -1) {}
  evn.respondWith(fromNetwork(evn.request)
  .catch((err) => {
    console.log(`Error: ${err.message()}`)
    return fromCache(evn.request)
  }))
})

function fromNetwork(request) {
  return fetch(request)
    .then((response) => response.ok ? response : fromCache(request))
    .catch(() => fromCache(request))
  // return new Promise((resolve, reject) => {
  //   var tmr = setTimeout(reject, TIMEOUT)
  //   fetch(request).then((response) => {
  //     clearTimeout(tmr)
  //     console.log("fromNetwork", request.url)
  //     resolve(response)
  //   }, reject)
  // })
}

function fromCache(request) {
  // Обратите внимание, что в случае отсутствия соответствия значения Promise выполнится успешно, но со значением `undefined`
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject('no-match')
    ))
}
