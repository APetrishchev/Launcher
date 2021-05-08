//******************************************************************************
export class Init {
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
      document.body.appendChild(window._measuring_)
    }
    return window._measuring_
  }

  constructor() {
    Init.registryServiceWorker()
    Init.createMeasuringElement()
    window.addEventListener("resize", (evn) => this.onResize(evn))
  }

  onResize(evn) {
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

}

//******************************************************************************
export class Widget {
  static createElement(kvargs) {
    let elm = kvargs.tagName ? document.createElement(kvargs.tagName) : document.createElement("div")
    if (kvargs.parent) {
      kvargs.parent.appendChild(elm)}
    if (kvargs.className) {
      elm.className = kvargs.className}
    if (kvargs.innerHTML) {
      elm.innerHTML = kvargs.innerHTML}
    return elm
  }

  static clearElement(elm) {
    while (elm.firstChild) {
      elm.removeChild(elm.firstChild)}
  }

  constructor(kvargs) {
    this.parent = kvargs.parent
    this.className = kvargs.className || "Widget"
  }

  show() {
    this.element = Widget.createElement({ parent: this.parent, className: this.className })
  }

  hide() {
    Widget.clearElement(this.element)
  }

  update() {
  }

  toString() { return `object "${this.constructor.name}"` }
}
