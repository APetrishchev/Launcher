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
export class Tips {
  constructor(elm, txt) {
    this.text = txt
    this.left = parseInt(elm.style.left) + 30
    this.top = parseInt(elm.style.top) + 10
    elm.addEventListener('mouseenter', evn => this.show(), false)
    elm.addEventListener('mouseleave', evn => this.hide(), false)
  }

  show() {
    this.element = Obj.createElement({
      tagName: "span", id: "Tips", parent: document.body,
      left: this.left, top: this.top, children: this.text
    })
  }

  hide() {
    document.body.removeChild(this.element)
  }
}

//******************************************************************************
export class Obj {
  static createElement(kvargs) {
    let element = kvargs.tagName ? document.createElement(kvargs.tagName) : document.createElement("div")
    if (kvargs.id) {
      element.id = kvargs.id }
    if (kvargs.parent) {
      kvargs.parent.appendChild(element) }
    if (kvargs.className) {
      element.className = kvargs.className }
    if (kvargs.children) {
      if (typeof kvargs.children === 'string') {
        element.innerHTML = kvargs.children }
      else if (kvargs.children instanceof HTMLElement) {
        element.appendChild(kvargs.children) }
      else if (kvargs.children instanceof Array) {
        for (const elm of kvargs.children) {
          element.appendChild(elm) }
      }
      else {
        console.error(`Child Type Error: ${typeof kvargs.children} (${kvargs.children})`) }
    if (kvargs.className) {
      element.className = kvargs.className }
    }
    if (kvargs.left) {
      element.style.left = `${kvargs.left}px` }
    if (kvargs.top) {
      element.style.top = `${kvargs.top}px` }
    if (kvargs.tips) {
      element.tips = new Tips(element, kvargs.tips) }
    return element
  }

  static clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)}
  }

  constructor(kvargs) {
    this.parent = kvargs.parent
    this.className = kvargs.className || "Application"
  }

  show() {
    this.element = App.createElement({ parent: this.parent, className: this.className })
    return this
  }

  hide() {
    App.clearElement(this.element)
    return this
  }

  toString() { return `object "${this.constructor.name}"` }
}

//******************************************************************************
export class App extends Obj {
}
