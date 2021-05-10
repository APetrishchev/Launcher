import { Init, Widget } from "../../../import/front/scripts/system.js"
import { Calendar } from "../../../import/front/scripts/calendar.js"
import { AnalogClock } from "../../../import/front/scripts/clock.js"
import { TalkClock } from "../../../import/front/scripts/clock.js"
import { Cron } from "./cron.js"

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
    let toolbar = new Widget({ parent: this.parent, className: "Toolbar"} )
    toolbar.show()
    let btn = Widget.createElement({ tagName: "Button", parent: toolbar.element })
    btn.innerHTML = "win"
    btn.onclick = (evn) => {
      console.log("Win", location.href)
      let strWinFeatures = "location=no,height=570,width=520,scrollbars=no,status=no"
      // let URL = "https://www.linkedin.com/cws/share?mini=true&amp;url=" + location.href;
      let URL = location.href
      let win = window.open(URL, "_blank", strWinFeatures);
    }

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

  new AppCalendarWidget({ parent: document.body })

})
