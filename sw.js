const CACHE = "Laucher_V1.0.0"
const CACHED_FILES = [
  "https://unpkg.com/idb/build/iife/index-min.js",
  "/",
  "/manifest.json",
  "/index.html",
  "/favicon.ico",

  "/import/scripts/App.js",
  "/import/scripts/Button.js",
  "/import/scripts/Calendar.js",
  "/import/scripts/CheckBox.js",
  "/import/scripts/Clock.js",
  "/import/scripts/db.js",
  "/import/scripts/Dialog.js",
  "/import/scripts/etc.js",
  "/import/scripts/Form.js",
  "/import/scripts/Gauge.js",
  "/import/scripts/Label.js",
  "/import/scripts/ListBox.js",
  "/import/scripts/Obj.js",
  "/import/scripts/ProgressBar.js",
  "/import/scripts/Splitter.js",
  "/import/scripts/Tips.js",
  "/import/scripts/Tree.js",

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

  "/AppLauncher/1.0.0/scripts/main.js",
  // "/AppLaucher/1.0.0/styles/default.css",
  // "/public/pictures/.applications/Laucher/home.png",

  "/AppAppStore/1.0.0/scripts/main.js",
  // "/AppAppStore/1.0.0/styles/default.css",

  "/AppCalculator/1.0.0/scripts/main.js",
  // "/AppCalculator/1.0.0/styles/default.css",
  // "/public/pictures/.applications/Calculator/calculator.png",

  "/AppCalendar/1.0.0/scripts/main.js",
  // "/AppCalendar/1.0.0/styles/default.css",

  // "/AppCanvas/1.0.0/scripts/main.js",
  // "/AppCanvas/1.0.0/styles/default.css",

  "/AppChronos/1.0.0/scripts/main.js",
  "/AppChronos/1.0.0/scripts/alarmPlay.js",
  "/AppChronos/1.0.0/scripts/alarmWin.js",
  "/AppChronos/1.0.0/scripts/cron.js",
  "/AppChronos/1.0.0/scripts/talkClock.js",
  // "/AppChronos/1.0.0/styles/default.css",

  "/AppFiles/1.0.0/scripts/main.js",
  // "/AppFiles/1.0.0/styles/default.css",

  // "/AppMessage/1.0.0/scripts/main.js",
  // "/AppFiles/1.0.0/styles/default.css",

  "/AppPlayer/1.0.0/scripts/main.js",
  // "/AppPlayer/1.0.0/styles/default.css",
  // "/public/pictures/.applications/Player/player.webp",

  "/AppScheduler/1.0.0/scripts/main.js",
  // "/AppScheduler/1.0.0/styles/default.css",

  "/AppSmartHome/1.0.0/scripts/main.js",
  // "/AppSmartHome/1.0.0/styles/default.css",
  // "/public/pictures/.applications/SmartHome/home.png",

  "/AppSMonitor/1.0.0/scripts/main.js",
  // "/AppSMonitor/1.0.0/styles/default.css",

  // "/AppTextEditor/1.0.0/scripts/main.js",
  // "/AppTextEditor/1.0.0/styles/default.css",

  "/AppWeather/1.0.0/scripts/main.js",
  // "/AppWeather/1.0.0/styles/default.css",
  // "/public/pictures/.applications/Weather/weather.webp"

  "/AppWelcome/1.0.0/scripts/main.js",
  // "/AppWelcome/1.0.0/styles/default.css",
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
