const CACHE = "NetworkOrCache.V1"
const timeout = 400

self.addEventListener("install", evn => {
  evn.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([
        "/",
        "/index.html",
        "/styles/main.css",
        "/scripts/main.js",
      ])
    )
  )
})

self.addEventListener("activate", evn => {})

self.addEventListener("fetch", evn => {
  console.log(evn.request.url)
  // if(evn.request.url.indexOf("/api") != -1) {}
  evn.respondWith(fromNetwork(evn.request, timeout)
  .catch((err) => {
    console.log(`Error: ${err.message()}`)
    return fromCache(evn.request)
  }))
})

function fromNetwork(request, timeout) {
  return new Promise((resolve, reject) => {
    var tmr = setTimeout(reject, timeout)
    fetch(request).then((response) => {
      clearTimeout(tmr)
      resolve(response)
    }, reject)
  })
}

function fromCache(request) {
  // Обратите внимание, что в случае отсутствия соответствия значения Promise выполнится успешно, но со значением `undefined`
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject('no-match')
    ))
}
