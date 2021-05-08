const CACHE = "Widet_V1.0"
const CACHED_FILES = [
  "/",
  "/manifest.json",
  "/index.html",
  "/favicon.ico",
  "import/pictures/home.png",
  "import/front/styles/main.css",
  "import/front/scripts/calendar.js",
  "import/front/scripts/clock.js",
  "import/front/scripts/etc.js",
  "import/front/scripts/system.js",

  "import/audio/warning.mp3",
  "import/audio/clock/ru-RU/female/0.wav",
  "import/audio/clock/ru-RU/female/1.wav",
  "import/audio/clock/ru-RU/female/2.wav",
  "import/audio/clock/ru-RU/female/3.wav",
  "import/audio/clock/ru-RU/female/4.wav",
  "import/audio/clock/ru-RU/female/5.wav",
  "import/audio/clock/ru-RU/female/6.wav",
  "import/audio/clock/ru-RU/female/7.wav",
  "import/audio/clock/ru-RU/female/8.wav",
  "import/audio/clock/ru-RU/female/9.wav",
  "import/audio/clock/ru-RU/female/10.wav",
  "import/audio/clock/ru-RU/female/11.wav",
  "import/audio/clock/ru-RU/female/12.wav",
  "import/audio/clock/ru-RU/female/13.wav",
  "import/audio/clock/ru-RU/female/14.wav",
  "import/audio/clock/ru-RU/female/15.wav",
  "import/audio/clock/ru-RU/female/16.wav",
  "import/audio/clock/ru-RU/female/17.wav",
  "import/audio/clock/ru-RU/female/18.wav",
  "import/audio/clock/ru-RU/female/19.wav",
  "import/audio/clock/ru-RU/female/20.wav",
  "import/audio/clock/ru-RU/female/30.wav",
  "import/audio/clock/ru-RU/female/40.wav",
  "import/audio/clock/ru-RU/female/50.wav",
  "import/audio/clock/ru-RU/female/oclock.wav",
  "import/audio/clock/ru-RU/female/minutes.wav",

  "AppCalendarWidget/front/scripts/main.js"
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
    console.log(`Error: ${err}`)
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
