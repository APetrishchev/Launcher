const CACHE = "Laucher_V1.0.0"
const CACHED_FILES = [
  "/",
  "/manifest.json",
  "/index.html",
  "/favicon.ico",
  "/Application/1.0.0/front/styles/main.css",
  "/Application/1.0.0/front/scripts/system.js",
  "/Application/1.0.0/front/scripts/db.js",
  "/Application/1.0.0/front/scripts/cron.js",
  "/Application/1.0.0/front/scripts/etc.js",
  "/Application/1.0.0/front/scripts/calendar.js",
  "/Application/1.0.0/front/scripts/clock.js",

  "/public/audio/sounds/atention.mp3",
  "/public/audio/voice/clock/ru-RU/female/0.wav",
  "/public/audio/voice/clock/ru-RU/female/1.wav",
  "/public/audio/voice/clock/ru-RU/female/2.wav",
  "/public/audio/voice/clock/ru-RU/female/3.wav",
  "/public/audio/voice/clock/ru-RU/female/4.wav",
  "/public/audio/voice/clock/ru-RU/female/5.wav",
  "/public/audio/voice/clock/ru-RU/female/6.wav",
  "/public/audio/voice/clock/ru-RU/female/7.wav",
  "/public/audio/voice/clock/ru-RU/female/8.wav",
  "/public/audio/voice/clock/ru-RU/female/9.wav",
  "/public/audio/voice/clock/ru-RU/female/10.wav",
  "/public/audio/voice/clock/ru-RU/female/11.wav",
  "/public/audio/voice/clock/ru-RU/female/12.wav",
  "/public/audio/voice/clock/ru-RU/female/13.wav",
  "/public/audio/voice/clock/ru-RU/female/14.wav",
  "/public/audio/voice/clock/ru-RU/female/15.wav",
  "/public/audio/voice/clock/ru-RU/female/16.wav",
  "/public/audio/voice/clock/ru-RU/female/17.wav",
  "/public/audio/voice/clock/ru-RU/female/18.wav",
  "/public/audio/voice/clock/ru-RU/female/19.wav",
  "/public/audio/voice/clock/ru-RU/female/20.wav",
  "/public/audio/voice/clock/ru-RU/female/30.wav",
  "/public/audio/voice/clock/ru-RU/female/40.wav",
  "/public/audio/voice/clock/ru-RU/female/50.wav",
  "/public/audio/voice/clock/ru-RU/female/oclock.wav",
  "/public/audio/voice/clock/ru-RU/female/minutes.wav",

  "/AppCalendar/1.0.0/front/scripts/main.js",
  "/AppCalendar/1.0.0/front/styles/main.css",

  "/AppChronos/1.0.0/front/scripts/main.js",
  "/AppChronos/1.0.0/front/styles/main.css",

  "/AppLaucher/1.0.0/front/scripts/main.js",
  "/AppLaucher/1.0.0/front/styles/main.css",
  "/public/pictures/.applications/Laucher/home.png",

  "/AppCalculator/1.0.0/front/scripts/main.js",
  "/AppCalculator/1.0.0/front/styles/main.css",
  "/public/pictures/.applications/Calculator/calculator.png",

  "/AppPlayer/1.0.0/front/scripts/main.js",
  "/AppPlayer/1.0.0/front/styles/main.css",
  "/public/pictures/.applications/Player/player.webp",

  "/AppSmartHome/1.0.0/front/scripts/main.js",
  "/AppSmartHome/1.0.0/front/styles/main.css",
  "/public/pictures/.applications/SmartHome/home.png",

  "/AppWeather/1.0.0/front/scripts/main.js",
  "/AppWeather/1.0.0/front/styles/main.css",
  "/public/pictures/.applications/Weather/weather.webp"
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
