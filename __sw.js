const CACHE_NAME = "Launcher_V1.0.0"
const DCACHE_NAME = "Launcher(d)_V1.0.0"
const TIMEOUT = 400
const CACHED_STATIC_FILES = [
	"https://unpkg.com/idb@7.0.0/build/index.cjs",
	// "/launcher.webmanifest",
	"/index.html",
	"/offline.html",
	"/favicon.ico",

	// "/lib/1.0.0/App.js",
	// "/lib/1.0.0/db.js",
	// "/lib/1.0.0/Obj.js",
	// "/lib/1.0.0/Tips.js",
	// "/lib/1.0.0/button/Button.js",
	// "/lib/1.0.0/calendar/Calendar.js",
	// "/lib/1.0.0/checkbox/CheckBox.js",
	// "/lib/1.0.0/clock/Clock.js",
	// "/lib/1.0.0/dialog/Dialog.js",
	// "/lib/1.0.0/etc/etc.js",
	// "/lib/1.0.0/form/Form.js",
	// "/lib/1.0.0/gauge/Gauge.js",
	// "/lib/1.0.0/label/Label.js",
	// "/lib/1.0.0/listbox/ListBox.js",
	// "/lib/1.0.0/progressbar/ProgressBar.js",
	// "/lib/1.0.0/splitter/Splitter.js",
	// "/lib/1.0.0/tree/Tree.js",

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

	// "/AppLauncher/1.0.0/scripts/main.js",
	// "/AppLauncher/1.0.0/styles/default.css",
	"/public/pictures/.applications/Launcher/home_48x48.png",

	"/AppAppStore/1.0.0/scripts/main.js",
	// "/AppAppStore/1.0.0/styles/default.css",

	"/AppCalculator/1.0.0/scripts/main.js",
	// "/AppCalculator/1.0.0/styles/default.css",
	// "/public/pictures/.applications/Calculator/calculator.png",

	"/AppCalendar/1.0.0/scripts/main.js",
	// "/AppCalendar/1.0.0/styles/default.css",

	// "/AppCanvas/1.0.0/scripts/main.js",
	// "/AppCanvas/1.0.0/styles/default.css",

	// "/AppChronos/1.0.0/scripts/main.js",
	// "/AppChronos/1.0.0/scripts/alarmPlay.js",
	// "/AppChronos/1.0.0/scripts/alarmWin.js",
	// "/AppChronos/1.0.0/scripts/cron.js",
	// "/AppChronos/1.0.0/scripts/talkClock.js",
	// "/AppChronos/1.0.0/styles/default.css",

	// "/AppFiles/1.0.0/scripts/main.js",
	// "/AppFiles/1.0.0/styles/default.css",

	// "/AppMessage/1.0.0/scripts/main.js",
	// "/AppFiles/1.0.0/styles/default.css",

	// "/AppPlayer/1.0.0/scripts/main.js",
	// "/AppPlayer/1.0.0/styles/default.css",
	// "/public/pictures/.applications/Player/player.webp",

	// "/AppScheduler/1.0.0/scripts/main.js",
	// "/AppScheduler/1.0.0/styles/default.css",

	// "/AppSmartHome/1.0.0/scripts/main.js",
	// "/AppSmartHome/1.0.0/styles/default.css",
	// "/public/pictures/.applications/SmartHome/home.png",

	// "/AppSMonitor/1.0.0/scripts/main.js",
	// "/AppSMonitor/1.0.0/styles/default.css",

	// "/AppTextEditor/1.0.0/scripts/main.js",
	// "/AppTextEditor/1.0.0/styles/default.css",

	// "/AppWeather/1.0.0/scripts/main.js",
	// "/AppWeather/1.0.0/styles/default.css",
	// "/public/pictures/.applications/Weather/weather.webp"

	// "/AppWelcome/1.0.0/scripts/main.js",
	// "/AppWelcome/1.0.0/styles/default.css",
]

self.addEventListener("install", async evn => {
	const cache = await caches.open(CACHE_NAME)
	await cache.addAll(CACHED_STATIC_FILES)
})

self.addEventListener("activate", async evn => {
	const cacheNames = await caches.keys()
	await Promise.all(
		cacheNames
		.filter(name => name !== CACHE_NAME)
		.filter(name => name !== DCACHE_NAME)
		.map(name => caches.delete(name))
	)
})

self.addEventListener("fetch", async evn => {
	const {request} = evn
	const url = new URL(request.url)
	// if (url.origin === location.origin) {
	// 	evn.respondWith(cacheFirst(evn.request))
	// } else {
	// 	evn.respondWith(networkFirst(evn.request))
	// }
	console.log(`Fetch ${request.url} (from Network)`)
	await fetch(request)
})

async function cacheFirst(request) {
	console.log(`Fetch ${request.url} from CacheFirst`)
	return await caches.match(request) ?? await fetch(request)
}

async function networkFirst(request) {
	const cache = await caches.open(DCACHE_NAME)
	try {
		const response = await fetch(request)
		await cache.put(request, response.clone())
		console.log(`Fetch ${request.url} from Network`)
		return response
	} catch (err) {
		console.warn(`Fetch err: ${err}`)
		console.log(`Fetch ${request.url} from Cache`)
		return await cache.match(request) ?? await caches.match("/offline.html")
	}
}

// self.addEventListener("activate", evn => {
//	 evn.waitUntil(self.clients.claim())
// })

// self.addEventListener("fetch", evn => {
//	 // if(evn.request.url.indexOf("/api") != -1) {}
//	 evn.respondWith(fromNetwork(evn.request)
//	 .catch((err) => {
//		 console.log(`Error: ${err}`)
//		 return fromCache(evn.request)
//	 }))
// })

// function fromNetwork(request) {
//	 // return fetch(request)
//	 //	 .then((response) => response.ok ? response : fromCache(request))
//	 //	 .catch(() => fromCache(request))
//	 return new Promise((resolve, reject) => {
//		 var tmr = setTimeout(reject, TIMEOUT)
//		 fetch(request).then((response) => {
//			 clearTimeout(tmr)
//			 console.log("fromNetwork", request.url)
//			 resolve(response)
//		 }, reject)
//	 })
// }

// function fromCache(request) {
//	 console.log("fromCache", request.url)
//	 return caches.open(CACHE).then((cache) =>
//		 cache.match(request).then((matching) =>
//			 matching || Promise.reject("no-match")
//		 ))
// }
