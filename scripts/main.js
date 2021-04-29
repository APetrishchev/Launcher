    // {
    //   "src": "/images/icons/apple-touch-icon.png",
    //   "type": "image/png",
    //   "sizes": "57x57"
    // },

window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
    .then(() => navigator.serviceWorker.ready.then((worker) => {
      console.log("ServiceWorker registration successful with scope:", worker.scope)
      worker.sync.register("syncdata")}))
    .catch(
      (err) => console.log("ServiceWorker registration failed:", err))
  }
  main()
})

function main() {
  let div = document.createElement("div")
  div.innerHTML = "New Window"
  div.addEventListener("click", (evn) => {Win()})
  document.body.appendChild(div)
}

Win = function() {
  console.log("New Window")
}
