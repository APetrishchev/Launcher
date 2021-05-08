import { Init, Widget } from "../../../import/front/scripts/system.js"
import { Calendar } from "../../../import/front/scripts/calendar.js"
import { AnalogClock } from "../../../import/front/scripts/clock.js"
import { TalkClock } from "../../../import/front/scripts/clock.js"

//******************************************************************************
export class AppCalendarWidget extends Widget {
  constructor(kvargs = {}) {
    super(kvargs)
    new Init()
    this.parent = kvargs.parent
    this.className = kvargs.className || "Clock"

    this.clock = new AnalogClock()

    this.calendar = new Calendar({ parent: this.parent })
    this.calendar.onMouseOver = (evn) => { console.log(evn.target.innerHTML) }
    this.calendar.onMouseOut = (evn) => { }
    this.calendar.onClick = (evn) => { console.log(evn.target.innerHTML) }
    this.show()
    this.talkClock = new TalkClock({ lang: "ru-RU", gender: "female", volume: 0.35,
      preSound: "/import/audio/warning.mp3" })
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
    this.timer = setInterval((evn) => this.update(evn), 500)
  }

  hide() {
    clearInterval(this.timer)
    super.hide()
  }

  update() {
    let now = new Date()
    this.clock.update(now)
    this.calendar.update(now)
    let minutes = now.getMinutes()
    if (this.minutes === undefined || this.minutes !== minutes) {
      this.minutes = minutes
      this.talkClock.play(now)
    }
  }
}

//******************************************************************************
window.addEventListener("load", () => {
  new AppCalendarWidget({ parent: document.body })
})
