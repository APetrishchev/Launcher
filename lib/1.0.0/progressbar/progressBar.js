import { Obj } from "../obj.js"


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
    this.progressElement.innerText = txt
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
