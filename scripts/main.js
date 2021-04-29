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
  div.innerHTML = "= = = = = = = = = ="
  div.className = "Toolbar"
  document.body.appendChild(div)

  div = document.createElement("div")
  div.innerHTML = "01:23"
  div.className = "DateTimePanel"
  document.body.appendChild(div)

  div = document.createElement("div")
  div.innerHTML = "Пн Вт Ср Чт Пт Сб Вс"
  div.className = "CalendarPanel"
  document.body.appendChild(div)

  // div.addEventListener("click", (evn) => {Win()})
}

Win = function() {
  console.log("New Window")
}
