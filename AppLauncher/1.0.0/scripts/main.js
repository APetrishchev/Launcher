import { Obj } from "../../../lib/1.0.0/obj.js"
import { App } from "../../../lib/1.0.0/app.js"
import { api } from "../../../lib/1.0.0/api.js"
import { debug, firstZero, capitalize } from "../../../lib/1.0.0/etc/etc.js"
import { Menu, Item } from "../../../lib/1.0.0/menu/menu.js"
import { Button } from "../../../lib/1.0.0/button/button.js"
import { Calendar } from "../../../lib/1.0.0/calendar/calendar.js"
import { Cron } from "../../../AppChronos/1.0.0/scripts/cron.js"
import { LauncherDB } from "./db.js"

let instance
class RunningApplications {
  static #instance = null

  static getInstance() {
    if (!RunningApplications.#instance) {
      RunningApplications.#instance = new RunningApplications() }
    return RunningApplications.#instance
  }

  constructor() {
    this.applications = {}
    setInterval(() => {
      for (const [name, applications] of Object.entries(this.applications)) {
        let idx = 0
        for (const running of applications.applications) {
          if (running.windows?.MainWin.closed) {
            this.stop(name, idx) }
          idx++
        }
      }
    }, 500)
  }

  run(runButton) {
    if (!instance.mainMenu[runButton.name]) {
      runButton = new AppRunButton(instance.mainMenu, { name: runButton.name, title: runButton.title,
        picture: runButton.picture, index: instance.mainMenu.lastPosition++ })
      instance.mainMenu.show()
    }
    Obj.addEventListeners(null, runButton.element, {
      mouseenter: evn => this.thumbnailsShow(runButton),
      mouseleave: evn => {
        if (this.thumbnails) {
          this.timer = window.setTimeout(this.thumbnailsHide.bind(this), 2000) }
      }
    })
    if (!this.applications[runButton.name]) {
      this.applications[runButton.name] = {}
      this.applications[runButton.name].runButton = runButton
      this.applications[runButton.name].applications = []
    }
    this.applications[runButton.name].applications.push(App.run(instance.data.applications[runButton.name]))
    runButton.buttonElement.classList.add(`${runButton.buttonElement.classList[0]}-Active`)
    runButton.titleElement.classList.add(`${runButton.titleElement.classList[0]}-Active`)
  }

  stop(name, idx) {
    this.applications[name].applications.splice(idx, 1)
    if (this.applications[name].applications.length === 0) {
      if (instance.data.profile.preferredApplications.includes(name)
      || instance.systemApplication.includes(name)) {
        this.applications[name].runButton.buttonElement.classList.remove(
          `${this.applications[name].runButton.buttonElement.classList[0]}-Active`)
        this.applications[name].runButton.titleElement.classList.remove(
          `${this.applications[name].runButton.titleElement.classList[0]}-Active`)
      } else {
        instance.mainMenu.del(this.applications[name].runButton)
        instance.mainMenu.lastPosition--
      }
      delete this.applications[name]
    }
  }

  thumbnailsShow(runButton) {
    if (this.thumbnails) {
      this.thumbnailsHide() }
    if (!this.applications[runButton.name]) {
      return }
    this.thumbnails = new Obj({ parent: document.body, classList: ["Thumbnails"] })
    this.thumbnails.show()
    this.thumbnails.element.addEventListener("mouseenter", evn => {
      window.clearTimeout(this.timer)
      delete this.timer
    })
    this.thumbnails.element.addEventListener("mouseleave", evn => this.thumbnailsHide())
    for (const running of this.applications[runButton.name].applications) {
      const thumbnailElement = Obj.createElement({ parent: this.thumbnails.element, classList: ["Thumbnail"] })
      const winElement = Obj.createElement({ parent: thumbnailElement, classList: ["Thumbnail-Win"] })
      winElement.addEventListener("click", evn => {
        running.windows.MainWin.focus()
        this.thumbnailsHide()
      })
      winElement.setAttribute("scale", this.thumbnails.element.offsetWidth / running.windows.MainWin.innerWidth)
      winElement.innerHTML = running.windows.MainWin.document.body.innerHTML
      const toolBarElement = Obj.createElement({
        parent: thumbnailElement,
        classList: ["Thumbnail-TollBar"]
      })
      Button.Close({
        parent: toolBarElement,
        classList: ["Thumbnail-TollBar-CloseButton"],
        events: [{ click: evn => {
          evn.stopPropagation()
          running.windows.MainWin.close()
          this.thumbnailsHide()
        }}]
      }).show()
      new Button({
        parent: toolBarElement,
        classList: ["Thumbnail-TollBar-MoveToButton"],
        events: [{
          click: evn => {
            evn.stopPropagation()
            running.windows.MainWin.moveTo(2, 2)
            this.thumbnailsHide()
          }
        }]
      }).show()
    }
    this.thumbnails.element.style.left = `${runButton.element.offsetLeft + runButton.element.offsetWidth / 2 - this.thumbnails.element.offsetWidth / 2}px`
    this.thumbnails.element.style.top = `${runButton.element.offsetTop + runButton.element.offsetHeight + 45}px`
  }

  thumbnailsHide() {
    if (this.thumbnails) {
      this.thumbnails.remove()
      delete this.thumbnails
    }
  }
}


export class Item_ extends Item {
  constructor(menu, kvargs) {
    super(menu, kvargs)
    this.title = kvargs.title
    this.picture = kvargs.picture
    // this.show()
  }

  show() {
    super.show()
    this.titleElement = Obj.createElement({ classList: [`${this.classList}-Title`],
      children: this.title })
    if (this.picture) {
      this.buttonElement = Obj.createElement({ tagName: "img", classList: [`${this.classList}-Button`],
        src: this.picture })
    } else {
      this.buttonElement = Obj.createElement({
        classList: [`${this.classList}-Button`]
      })
    }
    // this.button.width = parseInt(this.button.clientWidth)
    // this.button.height = parseInt(this.button.clientHeight)
    this.element.append(this.buttonElement, this.titleElement)
  }

  hide() {
    super.hide()
    delete this.titleElement
    delete this.buttonElement
  }
}


class RunButton extends Item_ {
  constructor(menu, kvargs) {
    super(menu, kvargs)
    this.events.push({ click: evn => instance.runningApplications.run(this) })
  }
}


class AppRunButton extends RunButton {
  constructor(menu, kvargs) {
    super(menu, kvargs)
    this.events.push({
      mouseenter: evn => {
        this.buttonMenuElement = Obj.createElement({ parent: this.element, classList: ["RunButtonMenu"] })
        new Button({ parent: this.buttonMenuElement, type: Button.Toggle, classList: ["PinButton"],
          status: instance.data.profile.preferredApplications.includes(this.name) ? Button.Down : Button.Up,
          events: [{ click: (evn, btn) => {
            evn.stopPropagation()
            if (btn.status) {
              instance.data.profile.preferredApplications.push(this.name)
            } else {
              instance.data.profile.preferredApplications.splice(
                instance.data.profile.preferredApplications.indexOf(this.name), 1)
              if (!instance.runningApplications.applications[this.name]) {
                instance.mainMenu.del(this) }
            }
          }}]
        }).show()
        this.buttonMenuElement.style.left = `${this.element.offsetLeft + this.element.offsetWidth / 2 - this.buttonMenuElement.offsetWidth / 2}px`
        this.buttonMenuElement.style.top = `${this.element.offsetTop - this.buttonMenuElement.offsetHeight*0.75}px`
      },
      mouseleave: evn => {
        this.buttonMenuElement.remove()
        delete this.buttonMenuElement
      }
    })
  }
}


class ChronosRunButton extends RunButton {
  constructor(menu, kvargs) {
    super(menu, { parent: kvargs.parent, classList: ["ChronosRunButton"],
      name: "Chronos", title: "Chronos", app: kvargs.app })
    this.sep = ':'
  }

  update(now) {
    this.sep = this.sep === ':' ? ' ' : ':'
    this.buttonElement.innerHTML = `${firstZero(now.getHours())}${this.sep}${firstZero(now.getMinutes())}`
  }
}


class CalendarRunButton extends RunButton {
  constructor(menu, kvargs) {
    super(menu, { parent: kvargs.parent, classList: ["CalendarRunButton"],
      name: "Calendar", title: "Calendar" })
    this.lang = instance.data.applications.Launcher.lang
  }

  show() {
    this.events.push({
      mouseenter: evn => { Obj.clearElement(this.buttonElement)
        new Calendar({ parent: this.buttonElement, lang: this.lang }).show() },
      mouseleave: evn => this.update(new Date())
    })
    super.show()
  }

  update(now) {
    Obj.clearElement(this.buttonElement)
    Obj.createElement({ parent: this.buttonElement,
      children: `${capitalize(new Intl.DateTimeFormat(this.lang, { weekday: "short" }).format(now))} ${now.getDate()}`
    })
    Obj.createElement({ parent: this.buttonElement,
      children: `${capitalize(new Intl.DateTimeFormat(this.lang, { month: "short" }).format(now))} ${now.getFullYear()}`
    })
  }
}


export class Application extends App {
  static async getInstance(kvargs) {
    App.registryServiceWorker()

    instance = new Application(kvargs)
    instance.systemApplication = []
    instance.runningApplications = RunningApplications.getInstance()
    try {
      instance.data = await instance.getData()
    } catch(err) {
      console.error(err) }
instance.data.applications.Launcher = {lang: "ru-RU"}
// instance.data.applications.Launcher = {lang: "en-US"}
      if (!instance.data.applications.Launcher.lang) {
      instance.data.applications.Launcher.lang = instance.data.user.langs.filter(
        val => instance.data.applications.Launcher.langs.includes(val))
    }

    instance.mainMenu = new Menu({ id: "MainMenu", classList: ["Launcher"] })
    document.body.addEventListener("click", evn => instance.mainMenu.hide(1))

    const menu = new Menu({ id: "Profiles", classList: ["Launcher"] })
    new RunButton(instance.mainMenu, {subMenu: menu, name: "Profiles",
      title: instance.data.profile.name, picture: instance.data.profile.picture })
    instance.systemApplication.push("Profiles")
    const add = (menu_, items) => {
      if (items.applications) {
        if (items.applications.length) {
          const subMenu = new Menu({ id: items.name, classList: ["Launcher"] })
          new Item_(menu_, { subMenu: subMenu, name: items.name,
            title: items.name, picture: items.picture })
          add(subMenu, items.applications)
        }
        return
      }
      for (const name of items) {
        new RunButton(menu_, { name: name, title: name,
          picture: instance.data.applications[name].picture })
      }
    }
    for (const [_, items] of Object.entries(instance.data.appGroups)) {
      add(menu, items) }

    for (const name of instance.data.profile.preferredApplications) {
      if (name == "Chronos") {
        continue }
      new AppRunButton(instance.mainMenu, { name: name, title: name,
        picture: instance.data.applications[name].picture })
    }
    instance.mainMenu.lastPosition = instance.mainMenu.items.length

    if (instance.data.applications.Chronos) {
      instance.cron = await Cron.getInstance({ lang: instance.data.applications.Chronos.lang })
      instance.chronosRunButton = new ChronosRunButton(instance.mainMenu, { parent: instance.element,
        app: instance.data.applications.Chronos })
    } else {
      instance.chronosRunButton = new ChronosRunButton(instance.mainMenu, { parent: instance.element }) }
    instance.systemApplication.push("Chronos")

    instance.calendarRunButton = new CalendarRunButton(instance.mainMenu, { parent: instance.element })
    instance.systemApplication.push("Calendar")

    instance.mainMenu.show()
    instance.update()
    instance.timer = setInterval(evn => instance.update(evn), 1000)
  }

  async getData() {
    const db = new LauncherDB()
    let data
    try {
      data = await api({ cmd: "getUser", fields: "profiles, applications" })
      for (const [_, app] of Object.entries(data.applications)) {
        for (const [winName, win] of Object.entries(app.windows)) {
          app.windows[winName] = JSON.parse(win) }
      }
      for (const [name, profile] of Object.entries(data.profiles)) {
        if (data.profile === profile.id) {
          data.profile = name
          break
        }
      }
      await db.put("user", [data], 1)
    } catch(err) {
      console.error(err) }
    data = (await db.get("user"))[0]
    data.profile = data.profiles[data.profile]
    for (const [groupName, group] of Object.entries(data.appGroups)) {
      group.applications = []
      for (const [appName, app] of Object.entries(data.applications)) {
        if (app.groups.includes(groupName)) {
          group.applications.push(appName) }
      }
    }
    debug("UserData", data)
    return data
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


window.addEventListener("load", async () => {
  // window.addEventListener("unhandledrejection", evn => {
  //   console.error(`Error: ${evn.reason.message}`)
  // })
  Application.getInstance({ parent: document.body, classList: ["Launcher"] })
})
