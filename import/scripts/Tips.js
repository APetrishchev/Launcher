import { Obj } from "./Obj.js"

export class Tips {
  constructor(element, text, timeout) {
    this.text = text
    this.timeout = timeout || 2
    element.addEventListener("mouseenter", evn => this.show(evn), false)
    element.addEventListener("mouseleave", evn => this.hide(evn), false)
  }

  show(evn) {
    if (this.element) {
      return }
    this.element = document.createElement("span")
    this.element.id = "Tips"
    document.body.append(this.element)
    this.element.style.left = `${evn.target.offsetLeft + 25}px`
    this.element.style.top = `${evn.target.offsetTop + 25}px`
    this.element.innerHTML = this.text
    if (this.timeout > 0) {
      this.timer = window.setTimeout(this.hide.bind(this), this.timeout * 1000) }
  }

  hide() {
    if (this.timer) {
      window.clearTimeout(this.timer)
      delete this.timer
    }
    this.element.remove()
    delete this.element
  }
}
