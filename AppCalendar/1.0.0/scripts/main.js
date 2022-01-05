import { App } from "../../../lib/App.js"
import { Calendar } from "../../../lib/calendar/Calendar.js"

//******************************************************************************
class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    this.calendar = new Calendar({ parent: this.parent })
    this.calendar.onMouseOver = (evn) => { console.log(evn.target.id) }
    this.calendar.onMouseOut = (evn) => { }
    this.calendar.onClick = (evn) => {
      const win = window.open(
        `${location.origin}/AppScheduler/1.0.0/front/index.html&date=${evn.target.id}`,
        "_blank", "left=100,top=100,width=520,height=480")
    }
    this.calendar.show()
    this.timer = setInterval((evn) => this.update(evn), 1000)
  }

  async update() {
    this.calendar.update(new Date())
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body })
})
