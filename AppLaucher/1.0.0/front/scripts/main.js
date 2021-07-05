import { tokens, applications } from "../../../../ini.js"
import { Init, App, Obj } from "../../../../Application/1.0.0/front/scripts/system.js"
import { firstZero, capitalize } from "../../../../Application/1.0.0/front/scripts/etc.js"
import { Cron } from "../../../../Application/1.0.0/front/scripts/cron.js"
import { Calendar } from "../../../../Application/1.0.0/front/scripts/calendar.js"
import { LaucherDB } from "./laucher_db.js"
import { TalkClock } from "./talkClock.js"
import { Alarm } from "./alarm.js"

var app
//******************************************************************************
class RunButton {
  constructor(kvargs) {
    const buttonClassList = kvargs.button.classList
    const titleClassList = `${kvargs.classList}Title`
    const title = Obj.createElement({ classList: [titleClassList], children: kvargs.name })
    this.button = kvargs.button
    this.button.id = kvargs.name
    const app_ = app.ini.applications[kvargs.name]
    const ini = app_.MainWin
    this.button.onclick = (evn) => {
      if (ini) {
        if (!app_.MainWin.win) {
          app_.MainWin.win = window.open(
            `${window.location.origin}/${applications.applications[kvargs.name][app_.version].path}/front/index.html?token=${app.token}`,
            "_blank",
            `left=${ini?.left || 100},top=${ini?.top || 100},width=${ini?.width || 520},height=${ini?.height || 480}`)
          const timer = setInterval(() => {
            if (app_.MainWin.win.closed) {
              clearInterval(timer)
              this.button.classList.remove(`${buttonClassList}Active`)
              title.classList.remove(`${titleClassList}Active`)
              delete app_.MainWin.win
            }
          }, 500)
          this.button.classList.add(`${buttonClassList}Active`)
          title.classList.add(`${titleClassList}Active`)
        }
        else {
          app_.MainWin.win.focus() }
      }
    }
    this.element = Obj.createElement({ parent: kvargs.parent, classList: [`${kvargs.classList}Layout`],
      children: [this.button, title]
    })
  }
}

//******************************************************************************
class ChronosRunButton extends RunButton {
  constructor(parent) {
    super({ parent: parent, classList: ["ChronosRunButton"], name: "Chronos",
      button: Obj.createElement({ classList: ["ChronosRunButton"] })
    })
    this.sep = ':'
  }

  update(now) {
    this.sep = this.sep === ':' ? ' ' : ':'
    this.button.innerHTML = `${firstZero(now.getHours())}${this.sep}${firstZero(now.getMinutes())}`
  }
}

//******************************************************************************
class CalendarRunButton extends RunButton {
  constructor(parent) {
    super({
      parent: parent, classList: ["CalendarRunButton"], name: "Calendar",
      button: Obj.createElement({ classList: ["CalendarRunButton"] })
    })
    this.element.addEventListener("mouseenter", evn => {
      Obj.clearElement(this.button)
      new Calendar({ parent: this.button, lang: app.ini.lang }).show()
    })
    this.element.addEventListener("mouseleave", evn => {
      this.update(new Date())
    })
  }

  update(now) {
    Obj.clearElement(this.button)
    Obj.createElement({ parent: this.button,
      children: `${capitalize(new Intl.DateTimeFormat(app.ini.lang, { weekday: "short" }).format(now))} ${now.getDate()}` })
    Obj.createElement({ parent: this.button,
      children: `${capitalize(new Intl.DateTimeFormat(app.ini.lang, { month: "short" }).format(now))} ${now.getFullYear()}` })
  }
}

//******************************************************************************
class AppRunButton extends RunButton {
  constructor(kvargs) {
    const app_ = app.ini.applications[kvargs.name]
    const classList = kvargs.classList || ["AppRunButton"]
    const img = new Image()
    img.className = classList.join(" ")
    img.width = parseInt(img.clientWidth)
    img.height = parseInt(img.clientHeight)
    img.src = applications.applications[kvargs.name][app_.version].picture
    super({ parent: kvargs.parent, classList: classList, name: kvargs.name, button: img })
  }
}

//******************************************************************************
class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    app = this
    new Init()
    super.show()
    const db = new LaucherDB()
    db.init(this)
    this.cron = new Cron(db)

    // CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG
    this.token = "hgfhgfhDFgdfHGdhknj979jh876lDghfdrtdsg65rcv89yg87g87dfgdfhmp"
    this.ini = tokens[this.token]
    // end CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG

    for (const name of this.ini.applicationList) {
      new AppRunButton({ parent: this.element, name: name }) }
    this.chronosRunButton = new ChronosRunButton(this.element)
    this.calendarRunButton = new CalendarRunButton(this.element)
    let ini = this.ini.Laucher.TalkClock
    if (!ini.disable) {
      this.talkClock = new TalkClock({ path: `${ini.path}/${ini.lang}/${ini.gender}/`,
        preSound: ini.preSound, volume: ini.volume }) }
    this.update()
    this.timer = setInterval(evn => this.update(evn), 1000)
    // new Alarm({ media: "/data/applications/audio/music/greensleeves.mp3", msg: "Blah-Blah-Blah-Blah", timeout: 60 })
  }

  async update() {
    const now = new Date()
    this.chronosRunButton.update(now)
    const date = now.getDate()
    const minutes = now.getMinutes()
    if (this.date === undefined || this.date !== date) {
      this.date = date
      this.calendarRunButton.update(now)
    }
    if (this.minutes === undefined || this.minutes !== minutes) {
      this.minutes = minutes
      const events = await this.cron.getEvents(now, { key: "disabled", val: 0 })
      for (const [time, event] of Object.entries(events)) {
        if (event.type == "TalkClock" && this.talkClock) {
          this.talkClock.play(now) }
        else if (event.type == "Alarm") {
          if (event.action == "play") {
            new Alarm({ media: event.params.media, vol: event.params.volume, msg: event.descr, timeout: event.timeout })
          }
          else if (events.action == "exec") {
          //   os.system(events[time].params)
          }
        }
        else if (event.type == "Exec") {
          //   os.system(events[time].params)
        }
      }
    }
  }

}

//******************************************************************************
window.addEventListener("load", async () => {
  // window.addEventListener("unhandledrejection", evn => {
  //   console.error(`Error: ${evn.reason.message}`)
  // })

  new Application({ parent: document.body, classList: ["Laucher"] })
})
