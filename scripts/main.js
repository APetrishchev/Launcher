import {Calendar} from "./calendar.js"
import {Clock} from "./clock.js"

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

//******************************************************************************
function onResize(evn) {
  for (const elm of document.querySelectorAll(".TextScale")) {
    let fontSize = parseInt(window.getComputedStyle(elm).getPropertyValue('font-size'), 10)
    window._measuring_.innerHTML = elm.innerHTML
    window._measuring_.style.fontSize = `${fontSize}px`

    let width = window._measuring_.clientWidth
    let height = window._measuring_.clientHeight
    // while (Math.round(width) != Math.round(elm.clientWidth)) {
      console.log(width, height)
      console.log(elm.clientWidth, elm.clientHeight)
      if (width > elm.clientWidth || height > elm.clientHeight) {
        fontSize -= 1
      }
      if (width < elm.clientWidth || height < elm.clientHeight) {
        fontSize += 1
      }
      window._measuring_.style.fontSize = `${fontSize}px`
      width = window._measuring_.clientWidth
    // }
    elm.style.fontSize = `${fontSize}px`
    console.log(fontSize)

    // while (!(fontSize - 1 < elm.clientHeight && elm.clientHeight < fontSize + 1)) {
    //   if(elm.clientHeight > top) {
    //     top *= 2
    //   }
    //   if(elm.clientHeight > fontSize) {
    //     fontSize *= 2
    //   }
    // }
  }
}

//******************************************************************************
function main() {
  window._measuring_ = document.createElement("div")
  window._measuring_.id = "measuring"
  document.body.appendChild(window._measuring_)
  window.addEventListener("resize", onResize)

  let div = document.createElement("div")
  div.className = "Toolbar"
  div.innerHTML = "= = = = = = = = = ="
  document.body.appendChild(div)

  let clock = new Clock({parent: document.body})
  clock.show()

  let calendar = new Calendar()
  calendar.onMouseOver = (evn) => { console.log(evn.target.innerHTML)}
  calendar.onMouseOut = (evn) => {}
  calendar.onClick = (evn) => { console.log(evn.target.innerHTML)}
  calendar.show(document.body)
}
