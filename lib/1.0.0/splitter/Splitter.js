import { Obj } from "../Obj.js"


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
        const delta = {
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
