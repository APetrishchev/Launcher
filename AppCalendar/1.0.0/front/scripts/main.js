import { Widget } from "../../../../import/front/scripts/system.js"
import { Calendar } from "../../../../import/front/scripts/calendar.js"
import { AnalogClock } from "../../../../import/front/scripts/clock.js"
import { TalkClock } from "../../../../import/front/scripts/clock.js"
import { Cron } from "./cron.js"

//******************************************************************************
class Application extends Widget {
  constructor(kvargs = {}) {
    super(kvargs)
    this.className = kvargs.className || "Clock"

    this.clock = new AnalogClock()
    this.calendar = new Calendar({ parent: this.parent })
    this.calendar.onMouseOver = (evn) => { console.log(evn.target.innerHTML) }
    this.calendar.onMouseOut = (evn) => { }
    this.calendar.onClick = (evn) => {
      let win = window.open(
        `${location.origin}/AppCalendarWidget/cron.html&date=${evn.target.innerHTML}`,
        "_blank", "left=100,top=100,width=520,height=480")
    }
    this.show()
    this.talkClock = new TalkClock({ lang: "ru-RU", gender: "female", volume: 0.35,
      preSound: "/import/audio/warning.mp3" })
  }

  show() {
    let div = document.createElement("div")
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

  async update() {
    let now = new Date()
    this.clock.update(now)
    this.calendar.update(now)
    let minutes = now.getMinutes()
    if (this.minutes === undefined || this.minutes !== minutes) {
      this.minutes = minutes

      const events = await Cron.getEvents(now, null, {key: "disabled", val: 0})
      for (const time in events) {
console.log(`[${time}] - ${events[time].name} ${events[time].descr}`)
        if (events[time].type == "TalkClock" && this.talkClock.enable) {
          self.talkClock.play() }
        else if (events[time].type == "Alarm") {
          if (events[time].action == "play") {
            // self.player = Player(app, events[time]["cmdParams"],
            //   timeout = events[time],duration, msg = events[time],descr, loop = true)
          }}
        else if (events[time].action == "exec") {
      // os.system(events[time].cmdParams)
        }
      }

      if (this.minutes === 0 || this.minutes === 15 || this.minutes === 30 || this.minutes === 45) {
      this.talkClock.play(now)}
    }
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  // window.addEventListener("unhandledrejection", evn => {
  //   console.error(`Error: ${evn.reason.message}`)
  // })

  new Application({ parent: document.body })
})
