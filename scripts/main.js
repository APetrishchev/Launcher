window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("scripts/sw.js")
    .then(() => navigator.serviceWorker.ready.then((worker) => {
      console.log("ServiceWorker registration successful with scope:", worker.scope)
      worker.sync.register("syncdata")}))
    .catch(
      (err) => console.log("ServiceWorker registration failed:", err))
  }

  // importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js")
  // workbox.setConfig({
  //   debug: true
  // })
  // workbox.core.skipWaiting()
  // workbox.core.clientClaim()
  // workbox.precaching.precacheAndRoute([])

    // {
    //   "src": "/images/icons/apple-touch-icon.png",
    //   "type": "image/png",
    //   "sizes": "57x57"
    // },
    // {
    //   "src": "/images/icons/android-icon-48x48.png",
    //   "sizes": "48x48",
    //   "type": "image/png"
    // }

})
