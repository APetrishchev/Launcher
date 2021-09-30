import { Tips } from "./Tips.js"

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
    for (const [eventName, event] of Object.entries(events)) {
      let eventListener, options = false
      if (event instanceof Array) {
        [eventListener, options] = event
      } else {
        eventListener = event }
// console.log("addEventListeners", eventName, element, eventListener, options)
      element.addEventListener(eventName, evn => eventListener(evn, owner || element), options) }
  }

  static createElement(kvargs) {
    const element = kvargs.tagName ? document.createElement(kvargs.tagName) : document.createElement("div")
    if (kvargs.id) {
      element.id = kvargs.id }
    if (kvargs.name) {
      element.setAttribute("name", kvargs.name) }
    if (kvargs.parent) {
      kvargs.parent.append(element) }
    if (kvargs.classList) {
      element.className = kvargs.classList.join(" ") }
    if (kvargs.children !== undefined) {
      Obj.append(element, kvargs.children) }
    if (kvargs.left !== undefined) {
      element.style.left = `${kvargs.left}px` }
    if (kvargs.top !== undefined) {
      element.style.top = `${kvargs.top}px` }
    if (kvargs.width !== undefined) {
      element.style.width = `${kvargs.width}px` }
    if (kvargs.height !== undefined) {
      element.style.height = `${kvargs.height}px` }
    if (kvargs.type !== undefined) {
      element.type = kvargs.type }
    if (kvargs.value !== undefined) {
      element.value = kvargs.value }
    if (kvargs.src) {
      element.setAttribute("src", kvargs.src) }
    if (kvargs.placeholder) {
      element.setAttribute("placeholder", kvargs.placeholder) }
    if (kvargs.disabled) {
      element.setAttribute("disabled", "disabled") }
    if (kvargs.tips) {
      new Tips(element, kvargs.tips) }
    // if (kvargs.owner) {
    //   element.owner = kvargs.owner
    if (kvargs.events) {
      if (kvargs.events instanceof Array) {
        for (const event of kvargs.events) {
          Obj.addEventListeners(kvargs.owner, element, event) }
      }
      else {
        Obj.addEventListeners(kvargs.owner, element, kvargs.events) }
    }
    return element
  }

  static append(element, children) {
    if (typeof children === "string" || typeof children === "number" || children instanceof HTMLElement) {
      element.append(children) }
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
      element.lastChild.remove() }
  }

  get disabled() {
    return this._disabled
  }
  set disabled(val) {
    this._disabled = val
    if (this.isDisplayed) {
      if (this._disabled) {
        this.element.setAttribute("disabled", "disabled") }
      else {
        this.element.removeAttribute("disabled") }
    }
  }

  constructor(kvargs = {}) {
    this.id = kvargs.id
    this.tagName = kvargs.tagName
    this.parent = kvargs.parent
    this.classList = kvargs.classList
    this.placeholder = kvargs.placeholder
    this.children = kvargs.children
    this.events = kvargs.events || []
    this.disabled = kvargs.disabled || false
    this.isDisplayed = false
  }

  show() {
    if (!this.isDisplayed) {
      this.element = Obj.createElement({ id: this.id, owner: this, tagName: this.tagName, parent: this.parent,
      classList: this.classList, placeholder: this.placeholder, disabled: this.disabled,
      children: this.children, events: this.events })
      this.isDisplayed = true
      return true
    } else {
      this.hide() }
    this.isDisplayed = true
    return false
  }

  hide() {
    if (this.isDisplayed) {
      Obj.clearElement(this.element)
      this.isDisplayed = false
    }
  }

  remove() {
    if (this.element) {
      this.element.remove()
      delete this.element
    }
    this.isDisplayed = false
  }

  add(obj, idx) {
    if (this.children === undefined) {
      this.children = [] }
    this.children.push(obj)
    if (this.isDisplayed) {
      Obj.append(this.element, obj) }
    return obj
  }

  toString() { return `object "${this.constructor.name}"` }
}
