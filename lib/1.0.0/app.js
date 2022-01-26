import { Obj } from "./obj.js"


export class App extends Obj {
  static registryServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js")
        .then(() => navigator.serviceWorker.ready.then((worker) => {
          console.log("ServiceWorker registration successful with scope:", worker.scope)
          worker.sync.register("syncdata")
        }))
        .catch(
          (err) => console.log("ServiceWorker registration failed:", err))
    }
  }

  static createMeasuringElement() {
    if (!window._measuring_) {
      window._measuring_ = document.createElement("div")
      window._measuring_.id = "measuring"
      document.body.append(window._measuring_)
      window.addEventListener("resize", evn => {
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

      })
    }
    return window._measuring_
  }

  static run(params) {
    const app = new App()
    if (params.hasOwnProperty("windows")) {
      if (!params.windows.hasOwnProperty("MainWin")) {
        params.windows.MainWin = { name: "MainWin", left: 100, top: 50, width: 520, height: 480 } }
      if (!app.hasOwnProperty("windows")) {
        app.windows = {} }
      app.windows.MainWin = window.open(`${window.location.origin}/${params.url}/index.html`, "_blank",
        `left=${params.windows.MainWin.left},top=${params.windows.MainWin.top},width=${params.windows.MainWin.width},height=${params.windows.MainWin.height}`)
    }
    return app
  }
}