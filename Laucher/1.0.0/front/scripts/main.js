import { Init, App, Obj, Button } from "./system.js"
import { debug, firstZero, capitalize } from "./etc.js"
import { ApplicationDB, CronDB } from "./laucher_db.js"
import { Calendar } from "./calendar.js"
import { Cron } from "../../../../AppChronos/1.0.0/front/scripts/cron.js"

let profile

//******************************************************************************
class RunButton {
  constructor(kvargs) {
    const buttonClassList = kvargs.button.classList



    const titleClassList = `${kvargs.classList}Title`
    const title = Obj.createElement({ classList: [titleClassList], children: kvargs.name })
    if (profile.RunningApplications[kvargs.name]) {
      title.classList.add(`${titleClassList}Active`) }


    this.button = kvargs.button
    this.button.id = kvargs.name
    this.element = Obj.createElement({ parent: kvargs.parent,
      classList: [`${kvargs.classList}Layout`], children: [this.button, title] })
    if (!(kvargs.app?.Windows)) {
      return }
    if (typeof kvargs.app.Windows.MainWin === "string" ) {
      kvargs.app.Windows.MainWin = JSON.parse(kvargs.app.Windows.MainWin)
    } else {
      kvargs.app.Windows.MainWin = { Name: "MainWin", Left: 100, Top: 50, Width: 520, Height: 480 } }
    this.button.onclick = (evn) => {
      if (!profile.RunningApplications[kvargs.name]) {
        profile.RunningApplications[kvargs.name] = { windows: { mainWin: {} } }
        profile.RunningApplications[kvargs.name].windows.mainWin = window.open(`${window.location.origin}/${kvargs.app.URL}/front/index.html`, "_blank",
          `left=${kvargs.app.Windows.MainWin.Left},top=${kvargs.app.Windows.MainWin.Top},width=${kvargs.app.Windows.MainWin.Width},height=${kvargs.app.Windows.MainWin.Height}`)
        const timer = setInterval(() => {
          if (profile.RunningApplications[kvargs.name].windows.mainWin.closed) {
            clearInterval(timer)
            this.button.classList.remove(`${buttonClassList[0]}Active`)
            title.classList.remove(`${titleClassList}Active`)
            delete profile.RunningApplications[kvargs.name]
          }
        }, 500)
        this.button.classList.add(`${buttonClassList[0]}Active`)
        title.classList.add(`${titleClassList}Active`)

      } else {
        profile.RunningApplications[kvargs.name].windows.mainWin.focus() }
    }
  }
}

//******************************************************************************
class ChronosRunButton extends RunButton {
  constructor(kvargs) {
    super({ parent: kvargs.parent, classList: ["ChronosRunButton"], name: "Chronos",
      button: Obj.createElement({ classList: ["ChronosRunButton"] }), app: kvargs.app })
    this.sep = ':'
  }

  update(now) {
    this.sep = this.sep === ':' ? ' ' : ':'
    this.button.innerHTML = `${firstZero(now.getHours())}${this.sep}${firstZero(now.getMinutes())}`
  }
}

//******************************************************************************
class CalendarRunButton extends RunButton {
  constructor(parent, lang) {
    super({
      parent: parent, classList: ["CalendarRunButton"], name: "Calendar",
      button: Obj.createElement({ classList: ["CalendarRunButton"] })
    })
    this.lang = lang
    this.element.addEventListener("mouseenter", evn => {
      Obj.clearElement(this.button)
      new Calendar({ parent: this.button, lang: this.lang }).show()
    })
    this.element.addEventListener("mouseleave", evn => {
      this.update(new Date())
    })
  }

  update(now) {
    Obj.clearElement(this.button)
    Obj.createElement({ parent: this.button,
      children: `${capitalize(new Intl.DateTimeFormat(this.lang, { weekday: "short" }).format(now))} ${now.getDate()}` })
    Obj.createElement({ parent: this.button,
      children: `${capitalize(new Intl.DateTimeFormat(this.lang, { month: "short" }).format(now))} ${now.getFullYear()}` })
  }
}

//******************************************************************************
class AppRunButton extends RunButton {
  constructor(kvargs) {
    kvargs.classList = kvargs.classList || ["AppRunButton"]
    kvargs.button = new Image()
    kvargs.button.className = kvargs.classList.join(" ")
    kvargs.button.width = parseInt(kvargs.button.clientWidth)
    kvargs.button.height = parseInt(kvargs.button.clientHeight)
    kvargs.button.src = kvargs.app.Picture
    super(kvargs)
  }
}

//******************************************************************************
class MenuButton extends RunButton {
  constructor(kvargs) {
    kvargs.classList = kvargs.classList || ["AppRunButton"]
    const btn = new Button({
      picture: kvargs.picture, classList: kvargs.classList,
      width: parseInt(kvargs.parent.clientWidth), height: parseInt(kvargs.parent.clientHeight)
    })
    super({
      parent: kvargs.parent, classList: kvargs.classList,
      name: kvargs.name, button: btn
    })
    const instance = this
    btn.element.addEventListener("mouseenter", evn => {
      instance.showMenu(kvargs.menu) })
    // btn.element.addEventListener("mouseleave", evn => {
    //   instance.timer = setTimeout(instance.hideMenu.bind(instance), 500) })
  }

  showMenu(menu) {
    console.log(this)
    if (this.menu) {
      return }
    this.menu = new Obj({
      parent: document.body, classList: ["Laucher"],
      events: {
        "mouseenter": evn => { clearInterval(this.timer) },
        // "mouseleave": this.hideMenu.bind(this)
      }
    })
    this.menu.show()
    for (const [name, item] of Object.entries(menu)) {
      if (item.Applications) {
        new MenuButton({ parent: this.menu.element, name: name,
          picture: item.Picture, menu: item.Applications })
      } else {
// console.log(name, item)
        new AppRunButton({ parent: this.menu.element, name: item, app: profile.Applications[item] }) }
    }
  }

  hideMenu() {
    this.menu.element.remove()
    delete this.menu
  }

}

//******************************************************************************
class Application extends App {
  static async getInstance(kvargs) {
    const instance = new Application(kvargs)
    const res = await fetch("/profile")
    profile = await res.json()
    debug("Profile", profile)

    // const db = new ApplicationDB()
    // db.init(profile.Applications)
    // console.log(await this.db.get("applications", "Name", "AppStore"))

    new Init()
    instance.show()
    for (const [appName, app] of Object.entries(profile.Applications)) {
      for (const [groupName, group] of Object.entries(profile.AppGroups)) {
        if (app.Groups.includes(groupName)) {
          if (!group.Applications) {
            group.Applications = [] }
          group.Applications.push(appName)
        }
      }
    }
    new MenuButton({ parent: instance.element, name: profile.Name,
      picture: profile.Picture, menu: profile.AppGroups })
    for (const name of profile.PreferredApplications) {
      if (name == "Chronos") {
        continue }
      new AppRunButton({ parent: instance.element, name: name, app: profile.Applications[name] })
    }
    if (profile.Applications.Chronos) {
      instance.cron = await Cron.getInstance({ lang: profile.Applications.Chronos.Lang, db: new CronDB() })
      instance.chronosRunButton = new ChronosRunButton({ parent: instance.element, app: profile.Applications.Chronos })
    } else {
      instance.chronosRunButton = new ChronosRunButton({ parent: instance.element }) }
    instance.calendarRunButton = new CalendarRunButton(instance.element, profile.Applications.Calendar.Lang)
    instance.update()
    instance.timer = setInterval(evn => instance.update(evn), 1000)
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
      if (this.cron) {
        this.cron.update(now) }
    }
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  // window.addEventListener("unhandledrejection", evn => {
  //   console.error(`Error: ${evn.reason.message}`)
  // })
  Application.getInstance({ parent: document.body, classList: ["Laucher"] })
})
