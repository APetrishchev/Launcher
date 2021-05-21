const CACHE = "Laucher_V1.0.0"
const CACHED_FILES = [
  "/",
  "/manifest.json",
  "/index.html",
  "/favicon.ico",
  "/import/front/styles/main.css",
  "/import/front/scripts/system.js",
  "/import/front/scripts/db.js",
  "/import/front/scripts/cron.js",
  "/import/front/scripts/etc.js",
  "/import/front/scripts/calendar.js",
  "/import/front/scripts/clock.js",

  "/data/applications/audio/sounds/atention.mp3",
  "/data/applications/audio/voice/clock/ru-RU/female/0.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/1.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/2.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/3.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/4.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/5.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/6.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/7.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/8.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/9.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/10.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/11.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/12.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/13.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/14.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/15.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/16.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/17.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/18.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/19.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/20.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/30.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/40.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/50.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/oclock.wav",
  "/data/applications/audio/voice/clock/ru-RU/female/minutes.wav",

  "/AppCalendar/1.0.0/front/scripts/main.js",
  "/AppCalendar/1.0.0/front/styles/main.css",

  "/AppChronos/1.0.0/front/scripts/main.js",
  "/AppChronos/1.0.0/front/styles/main.css",

  "/AppLaucher/1.0.0/front/scripts/main.js",
  "/AppLaucher/1.0.0/front/styles/main.css",
  "/data/applications/pictures/Laucher/home.png",

  "/AppCalculator/1.0.0/front/scripts/main.js",
  "/AppCalculator/1.0.0/front/styles/main.css",
  "/data/applications/pictures/Calculator/calculator.png",

  "/AppPlayer/1.0.0/front/scripts/main.js",
  "/AppPlayer/1.0.0/front/styles/main.css",
  "/data/applications/pictures/Player/player.webp",

  "/AppSmartHome/1.0.0/front/scripts/main.js",
  "/AppSmartHome/1.0.0/front/styles/main.css",
  "/data/applications/pictures/SmartHome/home.png",

  "/AppWeather/1.0.0/front/scripts/main.js",
  "/AppWeather/1.0.0/front/styles/main.css",
  "/data/applications/pictures/Weather/weather.webp"
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
