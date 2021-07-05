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
    return this.element
  }

  hide() {
    document.body.removeChild(this.element)
  }
}

//******************************************************************************
export class Obj {
  static classList(className, classList) {
    return [className, ...(classList ? classList : [])]
  }

  static combine(classList, className) {
    const classList_ = []
    for(const _className of classList) {
      classList_.push(`${_className}${className}`) }
    return classList_
  }

  static addEventListeners = (owner, element, events) => {
    for (const [event, evnLstnr] of Object.entries(events)) {
      element.addEventListener(event, evn => evnLstnr(owner || element), true) }
  }

  static createElement(kvargs) {
    let element = kvargs.tagName ? document.createElement(kvargs.tagName) : document.createElement("div")
    if (kvargs.id) {
      element.id = kvargs.id }
    if (kvargs.classList) {
      element.className = kvargs.classList.join(" ") }
    if (kvargs.parent) {
      kvargs.parent.appendChild(element) }
    if (kvargs.children) {
      Obj.append(element, kvargs.children) }
    if (kvargs.left) {
      element.style.left = `${kvargs.left}px` }
    if (kvargs.top) {
      element.style.top = `${kvargs.top}px` }
    if (kvargs.width) {
      element.style.width = `${kvargs.width}px` }
    if (kvargs.height) {
      element.style.height = `${kvargs.height}px` }
    if (kvargs.placeholder) {
      element.setAttribute("placeholder", kvargs.placeholder) }
    if (kvargs.disabled) {
      element.setAttribute("disabled", "disabled") }
    if (kvargs.tips) {
      element.tips = new Tips(element, kvargs.tips) }
    // if (kvargs.owner) {
    //   element.owner = kvargs.owner
    if (kvargs.events) {
      if (kvargs.events instanceof Array) {
        for (const events of kvargs.events) {
          Obj.addEventListeners(kvargs.owner, element, events) }
      }
      else {
        Obj.addEventListeners(kvargs.owner, element, kvargs.events) }
    }
    return element
  }

  static append(element, children) {
    if (typeof children === "string" || typeof children === "number") {
      element.innerHTML = children }
    else if (children instanceof HTMLElement) {
      element.appendChild(children) }
    else if (children?.show) {
      children.parent = element
      children.show()
    }
    else if (children instanceof Array) {
      for (const child of children) {
        Obj.append(element, child) }
    }
    else {
      console.error(`Child Type Error: ${typeof children} (${children})`) }
  }

  static clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)}
  }

  get disabled() {
    return this._disabled
  }
  set disabled(val) {
    this._disabled = val
    if (this.element) {
      if (this._disabled) {
        this.element.setAttribute("disabled", "disabled") }
      else {
        this.element.removeAttribute("disabled") }
    }
  }

  constructor(kvargs = {}) {
    this.tagName = kvargs.tagName
    this.parent = kvargs.parent
    this.classList = kvargs.classList
    this.placeholder = kvargs.placeholder
    this.children = kvargs.children
    this.events = kvargs.events
    this.disabled = kvargs.disabled || false
  }

  show() {
    if (this.element) {
      Obj.clearElement(this.element) }
    else {
      this.element = Obj.createElement({ owner: this, tagName: this.tagName, parent: this.parent,
      classList: this.classList, placeholder: this.placeholder, disabled: this.disabled,
      children: this.children, events: this.events })
    }
    return this.element
  }

  hide() {
    Obj.clearElement(this.element)
    return this
  }

  add(obj, idx) {
    if (this.children === undefined) {
      this.children = [] }
    this.children.push(obj)
    if (this.element) {
      Obj.append(this.element, obj) }
    return obj
  }

  toString() { return `object "${this.constructor.name}"` }
}

//******************************************************************************
export class Label extends Obj {}

//******************************************************************************
export class Button extends Obj {
  static Button = 0
  static Toggle = 1
  static Radio = 2
  static Up = 0
  static Down = 1

  get status() {
    return this._status
  }

  set status(val) {
    this._status = val
    if (this.element) {
      if (this._status === Button.Down) {
        this.element.setAttribute("status", "down") }
      else if(this._status === Button.Up) {
        this.element.setAttribute("status", "up") }
    }
    return this._status
  }

  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Button", kvargs.classList)
    super(kvargs)
    this.type = kvargs.type || Button.Button
    this._status = kvargs.status || Button.Up
    let events = []
    if (this.type === Button.Toggle) {
      events = [
        {"click": evn => {
          if (this.status === Button.Up) {
            this.status = Button.Down }
          else if (this.status === Button.Down) {
            this.status = Button.Up }
        }}
      ]
    }
    this.events = [...events, ...(kvargs.events instanceof Array ? kvargs.events : (kvargs.events ? [kvargs.events] : []))]
    this.group = kvargs.group
  }

  show() {
    let type
    if (this.type === Button.Button || this.type === Button.Toggle) {
      this.tagName = "button"
      type = "button" }
    else if (this.type === Button.Radio) {
      this.tagName = "input"
      type = "radio" }
    super.show()
    this.element.setAttribute("type", type)
    if (this.type = Button.Radio) {
      this.element.setAttribute("name", this.group) }
    this.status = this._status
    return this.element
  }
}

//******************************************************************************
export class CheckBox extends Obj {
  get checked() {
    const val = this.element?.checked
    if (val !== undefined) {
      this._checked = val }
    return this._checked
  }
  set checked(val) {
    this._checked = val
    if (this.element) {
      this.element.checked = this._checked }
  }

  constructor(kvargs = []) {
    kvargs.tagName = "input"
    kvargs.classList = Obj.classList("CheckBox", kvargs.classList)
    super(kvargs)
  }

  show() {
    super.show()
    this.element.setAttribute("type", "checkbox")
  }
}

//******************************************************************************
export class ListBox extends Obj {
  get value() {
    const val = this.element?.value
    if (val) {
      this._value = val }
    return this._value
  }
  set value(val) {
    this._value = val
    if (this.element) {
      this.element.value = this._value }
  }

  constructor(kvargs = []) {
    kvargs.tagName = "select"
    kvargs.classList = Obj.classList("ListBox", kvargs.classList)
    super(kvargs)
    this.options = kvargs.options
    this._value = kvargs.value
  }

  show() {
    super.show()
    for (const option of this.options) {
      Obj.createElement({ tagName: "option", parent: this.element, children: option,
        classList: Obj.combine(this.classList, "-Option") })
    }
    this.value = this._value
  }
}

//******************************************************************************
export class Gauge extends Obj {
  set value(val) {
    val = val.toFixed(0)
    const valLvl = val < this.tresholds[0] ? "Normal" : val < this.tresholds[1] ? "Warning" : "Critical"
    const size = this.element.clientWidth < this.element.clientHeight ? this.element.clientWidth : this.element.clientHeight
    const cx = 0.5 * size
    const cy = 0.55 * size
    const r = 0.4 * size
    if (!this.svgElement) {
      this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', "svg")
      this.element.appendChild(this.svgElement)
      this.svgElement.setAttribute("class", [...Obj.combine(this.classList, "-Scale"), "shadow"].join(" "))
      this.svgElement.setAttribute("width", "100%")
      this.svgElement.setAttribute("height", "100%")
      this.svgElement.setAttribute("viewBox", `0 0 ${size} ${size}`)
      const l = 2 * Math.PI * r
      const lNorm = l * 0.007 * this.tresholds[0]
      const lWarn = l * 0.007 * (this.tresholds[1] - this.tresholds[0])
      const lCrit = l * 0.007 * (100 - this.tresholds[1])
      this.#circle(Obj.combine(this.classList, "-Normal"), cx, cy, r, [lNorm, l - lNorm], l * 0.6)
      this.#circle(Obj.combine(this.classList, "-Warning"), cx, cy, r, [lWarn, l - lWarn], l * 0.6 - lNorm)
      this.#circle(Obj.combine(this.classList, "-Critical"), cx, cy, r, [lCrit, l - lCrit], l * 0.6 - lNorm - lWarn)

      this.needleElement = document.createElementNS('http://www.w3.org/2000/svg', "line")
      this.svgElement.appendChild(this.needleElement)
      this.needleElement.setAttribute("class", Obj.combine(this.classList, "-Needle").join(' '))
      this.needleElement.setAttribute("x1", cx)
      this.needleElement.setAttribute("y1", cy)
      this.needleElement.setAttribute("x2", cx + 0.85 * r)
      this.needleElement.setAttribute("y2", cy)
      this.needleElement.setAttribute("stroke-width", 0.05 * r)
      this.needleElement.setAttribute("stroke-linecap", "round")
      this.needleElement.setAttribute("style", "--val: 140deg")

      let elm = document.createElementNS('http://www.w3.org/2000/svg', "circle")
      this.svgElement.appendChild(elm)
      elm.setAttribute("class", Obj.combine(this.classList, "-Needle").join(' '))
      elm.setAttribute("cx", cx)
      elm.setAttribute("cy", cy)
      elm.setAttribute("r", 0.1 * r)

      elm = document.createElementNS('http://www.w3.org/2000/svg', "g")
      this.svgElement.appendChild(elm)
      elm.setAttribute("class", Obj.combine(this.classList, "-Text").join(' '))
      for (let i = 0; i <= 100; i += 10) {
        this.#text(elm, Obj.combine(this.classList, "-Scale-Digits"),
          cx + 1.22 * r * Math.sin(-i * Math.PI / 70 - 70),
          cy + 1.22 * r * Math.cos(-i * Math.PI / 70 - 70),
          `${i}`)
      }
      this.percentsElement = this.#text(elm, [], "50%", "45%")
      this.textElement1 = this.#text(elm, Obj.combine(this.classList, "-Text1"), "50%", "70%")
      this.textElement2 = this.#text(elm, Obj.combine(this.classList, "-Text2"), "50%", "80%")
      this.textElement3 = this.#text(elm, Obj.combine(this.classList, "-Text3"), "50%", "90%")
    }
    this.percentsElement.setAttribute("class", Obj.classList(`${this.classList}-${valLvl}`, Obj.combine(this.classList, "-Percents")).join(" "))
    this.percentsElement.innerHTML = `${val} %`
    this.needleElement.setAttribute("style", `--val: ${140 + 2.6 * val}deg`)
  }

  set text1(val) {
    this.textElement1.innerHTML = val
  }

  set text2(val) {
    this.textElement2.innerHTML = val
  }

  set text3(val) {
    this.textElement3.innerHTML = val
  }

  show() {
    super.show()
    this.value = 0
  }

  constructor(kvargs = []) {
    super(kvargs)
    this.classList = Obj.classList("Gauge", kvargs.classList)
    this.tresholds = kvargs.tresholds || [70, 90]
  }

  #circle(classList, cx, cy, r, dash, offset) {
    const elm = document.createElementNS('http://www.w3.org/2000/svg', "circle")
    elm.setAttribute("class", Obj.classList(classList, Obj.combine(this.classList, "-Scale")).join(' '))
    elm.setAttribute("cx", cx)
    elm.setAttribute("cy", cy)
    elm.setAttribute("r", r)
    elm.setAttribute("stroke-width", 0.2 * r)
    elm.setAttribute("stroke-linecap", "butt")
    elm.setAttribute("stroke-dasharray", `${dash[0]} ${dash[1]}`)
    elm.setAttribute("stroke-dashoffset", offset)
    this.svgElement.appendChild(elm)
  }

  #text(parent, classList, x, y, txt) {
    const elm = document.createElementNS('http://www.w3.org/2000/svg', "text")
    parent.appendChild(elm)
    elm.setAttribute("y", y)
    const elm1 = document.createElementNS('http://www.w3.org/2000/svg', "tspan")
    elm.appendChild(elm1)
    elm1.setAttribute("class", classList.join(' '))
    elm1.setAttribute("x", x)
    elm1.setAttribute("text-anchor", "middle")
    if (txt) {
      elm1.innerHTML = txt }
    return elm1
  }
}

//******************************************************************************
export class ProgressBar extends Obj {
  set value(val) {
    val = val.toFixed(0)
    if (!this.progressElement) {
      this.progressElement = Obj.createElement({ parent: this.element }) }
    this.progressElement.className = Obj.combine(this.classList,
        val > this.tresholds[1] ? "-Critical" : val > this.tresholds[0] ? "-Warning" : "-Normal").join(" ")
    if (this.vertical) {
      this.progressElement.style.height = `${val * this.element.clientHeight / 100}px` }
    else {
      this.progressElement.style.width = `${val * this.element.clientWidth / 100}px` }
  }

  set text(txt) {
    this.progressElement.innerHTML = txt
  }

  constructor(kvargs = []) {
    super(kvargs)
    this.vertical = kvargs.vertical || false
    this.tresholds = kvargs.tresholds || [70, 90]
    this.classList = Obj.classList("ProgressBar", kvargs.classList)
    if (this.vertical) {
      this.classList = Obj.classList(this.classList, Obj.combine(this.classList, "-Vertical")) }
  }
}

//******************************************************************************
export class Form extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Form", kvargs.classList)
    super(kvargs)
    this.fields = kvargs.fields
  }

  show() {
    super.show()
    for (const field of this.fields) {
      if (field[0]) {
        const lbl = Obj.createElement({ classList: Obj.combine(this.classList, "-Field-Label"),
          children: field[0] })
        field[1].classList = Obj.combine(this.classList, "-Field-Value")
        let layout = this.add(Obj.createElement({ classList: Obj.combine(this.classList, "-Fields"),
          children: [lbl, field[1]] }))
      }
      else {
        field[1].parent = this.element
        field[1].show()
      }
    }
    const buttonsElement = Obj.createElement({ parent: this.element,
      classList: Obj.combine(this.classList, "-Buttons") })
    let kvargs = { parent: buttonsElement, classList: Obj.combine(this.classList, "-Button"),
      disabled: true }
    for (const idx in this.buttons) {
      kvargs.children = this.buttons[idx].children
      kvargs.events = this.buttons[idx].events
      const btn = new Button(kvargs)
      this.buttons[idx].element = btn.show()
    }
    return this.element
  }
}

//******************************************************************************
export class Dialog extends Obj {
  constructor(kvargs = []) {
    console.log(">>> Dialog", document.body)
    kvargs.classList = Obj.classList("Dialog", kvargs.classList)
    kvargs.parent = document.body
    super(kvargs)
    this.show()
    const buttons = []
    for (let idx = 0; idx < kvargs.buttons.length; idx++) {
      const btn = Obj.createElement({ classList: Obj.combine(this.classList, "-Button"),
        children: kvargs.buttons[idx][0], events: [{"click": evn => {
          if (kvargs.buttons[idx][1]) {
            kvargs.buttons[idx][1]() }
          this.element.remove() }
        }]
      })
      buttons.push(btn)
    }
    Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-Title"),
      children: kvargs.title })
    Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-LayoutMessage"),
      children: [
        Obj.createElement({ classList: Obj.combine(this.classList, "-Picture") }),
        Obj.createElement({ classList: Obj.combine(this.classList, "-Message"),
          children: kvargs.msg })
      ]
    })
    Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-LayoutButtons"),
      children: buttons })
  }
}

// //******************************************************************************
// export class Dialog extends Obj {
//   constructor(kvargs = []) {
//     kvargs.classList = Obj.classList("Item", kvargs.classList)
//     super(kvargs)
//     const win = window.open("about:blank", kvargs.title, "left=150,top=100,width=400,height=160")
//     win.opener.__parent__ = kvargs.parent
//     let btnsHTML = ""
//     for (let idx = 0; idx < kvargs.buttons.length; idx++) {
//       btnsHTML += `<div class="Button" onclick="console.log(window.opener.__parent__); ${(kvargs.buttons[idx][1] ? `(${kvargs.buttons[idx][1]})(); ` : "") + 'window.close()"'}>${kvargs.buttons[idx][0]}</div>\n` }
//     win.document.write(`
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <title>${kvargs.title}</title>
//   <link rel="stylesheet" type="text/css" media="screen" href="/Application/1.0.0/front/styles/dialog.css">
// </head>
// <body>
//   <div class="HLayout LayoutMessage">
//     <div class="Picture"></div>
//     <div class="Message">${kvargs.msg}</div>
//   </div>
//   <div class="HLayout LayoutButtons">
//     ${btnsHTML}
//   </div>
// </body>
// </html>
// `   )
//     win.onbeforeunload = evn => {
//     }
//   }
// }

//******************************************************************************
export class Item extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Item", kvargs.classList)
    super(kvargs)
  }
}

//******************************************************************************
export class Tree extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Tree", kvargs.classList)
    super(kvargs)
    this.level = kvargs.level || 0
    this.name = kvargs.name
    this.isCollapsed = kvargs.isCollapsed || true
    this.items = []
    if (kvargs.items) {
      for (const obj of kvargs.items) {
        this.addItem(obj) }
    }
  }

  show() {
    super.show()
    if (this.name) {
      this.toggleElement = Obj.createElement({
        classList: this.isCollapsed ? Obj.combine(this.classList, "-Header-Toggler") : Obj.combine(this.classList, "-Header-Toggler-Expanded"),
        events: [{"click": evn => this.toggle()}]
      })
      const nameElement = Obj.createElement({ classList: Obj.combine(this.classList, "-Header-Name"),
        children: this.name })
      this.header = new Obj({ parent: this.element, classList: Obj.combine(this.classList, "-Header"),
        children: [this.toggleElement, nameElement] })
      this.header.show()
    }
    else {
      this.isCollapsed = false }
    if (!this.isCollapsed) {
      this.expand() }
    return this.element
  }

  addTree(kvargs = []) {
    kvargs.level = this.level + 1
    kvargs.classList = Obj.classList("Tree-Item", kvargs.classList)
    const tree = new Tree(kvargs)
    this.items.push(tree)
    return tree
  }

  addItem(kvargs = []) {
    kvargs.classList = Obj.classList("Tree-Item", kvargs.classList)
    const item = new Item(kvargs)
    this.items.push(item)
    return item
  }

  expand() {
    for (const item of this.items) {
      item.parent = this.element
      item.show()
    }
    if (this.toggleElement) {
      this.toggleElement.className = Obj.combine(this.classList, "-Header-Toggler-Expanded").join(" ") }
    this.isCollapsed = false
  }

  collapse() {
    for (const item of this.items) {
      item.element.remove() }
    if (this.toggleElement) {
      this.toggleElement.className = Obj.combine(this.classList, "-Header-Toggler").join(" ") }
    this.isCollapsed = true
  }

  toggle(evn) {
    this.isCollapsed ? this.expand() : this.collapse()
  }
}

//******************************************************************************
export class Splitter extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Splitter", kvargs.classList)
    super(kvargs)
    this.direction = kvargs.direction || "H"
    this.panels = kvargs.panels
  }

  show() {
    super.show()
    for (let idx = 0; idx < this.panels.length; idx++) {
      this.panels[idx].classList = [...this.panels[idx].classList, `Splitter-Panel${idx + 1}`]
      this.panels[idx].parent = this.element
      this.panels[idx].show()
    }
    const separator = Obj.createElement({ parent: this.element,
      classList: Obj.combine(this.classList, "-Separator") })
    separator.onmousedown = evn => {
      const mouseDownEvent = evn
      evn.offsetLeft = separator.offsetLeft
      evn.offsetTop = separator.offsetTop
      for (let idx = 0; idx < this.panels.length; idx++) {
        this.panels[idx].__width__ = this.panels[idx].element.offsetWidth
      }
      document.onmousemove = evn => {
        let delta = {
          x: evn.clientX - mouseDownEvent.clientX,
          y: evn.clientY - mouseDownEvent.clientY
        }
        if (this.direction === "H") { // Horizontal
          // Prevent negative-sized elements
          delta.x = Math.min(Math.max(delta.x, -this.panels[0].__width__), this.panels[1].__width__)
          separator.style.left = `${mouseDownEvent.offsetLeft + delta.x}px`
          this.panels[0].element.style.width = `${this.panels[0].__width__ + delta.x}px`
          this.panels[1].element.style.width = `${this.panels[1].__width__ - delta.x}px`
        }
      }
      document.onmouseup = evn => {
        document.onmousemove = document.onmouseup = null;
      }
    }
    return this.element
  }
}

//******************************************************************************
export class App extends Obj {
}
