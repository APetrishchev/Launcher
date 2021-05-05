import { Init, Widget } from "./system.js"
import { Calendar } from "./calendar.js"
import { Clock } from "./clock.js"

//******************************************************************************
export class MyWidget extends Widget {
  constructor(kvargs = {}) {
    super(kvargs)
    new Init()
    this.parent = kvargs.parent
    this.className = kvargs.className || "Clock"

    this.clock = new Clock()

    this.calendar = new Calendar({ parent: this.parent })
    this.calendar.onMouseOver = (evn) => { console.log(evn.target.innerHTML) }
    this.calendar.onMouseOut = (evn) => { }
    this.calendar.onClick = (evn) => { console.log(evn.target.innerHTML) }
    this.show()
  }

  show() {
    let div = document.createElement("div")
    this.parent.appendChild(div)
    div.className = "Toolbar"
    div.innerHTML = "= = = = = = = = = ="

    div = document.createElement("div")
    this.parent.appendChild(div)
    div.className = "DateTimePanel"
    this.clock.parent = div
    this.clock.show()

    this.calendar.show()
  }
}
