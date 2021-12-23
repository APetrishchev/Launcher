import { App } from "../../../lib/scripts/App.js"
import { Obj } from "../../../lib/scripts/Obj.js"
import { SmartHomeDB } from "./db.js"
import { debug } from "../../../lib/scripts/etc.js"

const db = new SmartHomeDB()

//******************************************************************************
class Remote {
  static websocket = null
  static waiting = {}

  static connect() {
    return new Promise((resolve, reject) => {
      // Remote.websocket = new WebSocket(`ws://${window.location.host}/ws`)
      Remote.websocket = new WebSocket(`ws://127.0.0.1/ws`)
      Remote.websocket.onopen = () => {
        resolve()
      }
      Remote.websocket.onerror = err => {
        reject(err);
      }
      Remote.websocket.onmessage = evn => {
        const result = JSON.parse(evn.data)
        for (const id in result) {
          console.log(`>>> MESSAGE ${id}:`, result[id])
          if (Remote.waiting[id]) {
            Remote.waiting[id].resolve(Remote.waiting[id].onmessage(result))
            delete Remote.waiting[id]
          } else if (id === "event") {
            const obj = Application.objects[result[id].objId]
            obj.value = result[id].event
            obj.update()
          }
        }
      }
    })
  }

  static promise(id, body, onmessage) {
    let resolve_, reject_
    const promise = new Promise((resolve, reject) => {
      resolve_ = resolve
      reject_ = reject
      console.log(`<<< MESSAGE ${id}:`, body)
      Remote.websocket.send(`{${id}": ${JSON.stringify(body)}}`)
    })
    Remote.waiting[id] = { "resolve": resolve_, "reject": reject_, "onmessage": onmessage }
    return promise
  }
}

var instance, svg = {}
//******************************************************************************
export class Application extends App {
  static zones = {}
  static objects = {}
  static updateElements = [] // needed???????????????????????????????????????????????

  static async getInstance(kvargs) {
    instance = new Application(kvargs)
    instance.className = kvargs.className

    try {
      instance.cfg = await instance.getData()
    } catch(err) {
      console.error("SmartHome: No Config Error.", err)
    }

    try {
      await Remote.connect()
    } catch(err) {
alert(`Ошибка подключения к "HomeServer".\nСервер не запущен или не установлен.\n${err}\n\nПри необходимости загрузите https://cabinet.duckdns.org/dounload/HomeServer ,\nзатем установите и запустите его.`,)
    }
      instance.show()
    window.addEventListener("resize", () => {
      instance.show()
      console.log(">>> resize")
    })
    return instance
  }

  async getData() {
    try {
      const res = await fetch("/home/.application/SmartHome/data.json")
      const data = await res.json()
      debug("SmartHome", data)
      await db.put("config", [data], 1)
    } catch(err) {
      console.error("SmartHome: get Config Error.", err) }
    return (await db.get("config"))[0]
  }

  show() {
    super.show()
    const checkbox = document.createElement("input")
    checkbox.id = "UpdateButton"
    checkbox.type = "checkbox"
    this.element.className = this.className
    this.element.append(checkbox)
    const rect = this.element.getBoundingClientRect()
    console.log(rect)
    svg.width = rect.width - 8
    svg.height = rect.height - 8

    svg.element = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.element.setAttribute("width", `${svg.width}px`)
    svg.element.setAttribute("height", `${svg.height}px`)
    this.element.append(svg.element)
    for (const [zoneId, zone] of Object.entries(this.cfg.Home.Zones)) {
      new Zone(zoneId, zone).show()
    }
    for (const [zoneId, zone] of Object.entries(this.cfg.Home.Objects)) {
      for (const [objId, obj] of Object.entries(zone)) {
        console.log(objId, obj.type)
        obj.zoneId = zoneId
        obj.hide = obj.hide || false

        const obj_ = new (Application[obj.type])(`${zoneId}_${objId}`, obj)
        Application.objects[obj_.id] = obj_
        if (1) { //(!obj.hide) {
          // Application.updateElements.push({"zoneId": obj_.zoneId,
          //   "deviceId": obj_.deviceId, "objId": obj_.id})
          obj_.show()
          obj_.update()
        }
      }
    }
    // setInterval(this.update, 10000)
  }

  async update() {
    for (const obj of Application.updateElements) {
      obj.update()
    }
  }
}

//******************************************************************************
class Zone {
  constructor(zoneId, kvargs) {
    Application.zones[zoneId] = this
    this.name = kvargs.name
    this.geometry = kvargs.geometry
  }

  show() {
    const ln = document.createElementNS(svg.element.namespaceURI, "polygon")
    ln.className.baseVal = "Zone"
    let points = ''
    for (let idx = 1; idx < this.geometry.length; idx++) {
      points += `${this.geometry[idx][0] * svg.width},${this.geometry[idx][1] * svg.height} `
    }
    points += `${this.geometry[0][0] * svg.width},${this.geometry[0][1] * svg.height}`
    ln.setAttribute("points", points)
    ln.setAttribute("stroke", "rgb(0,0,0)")
    svg.element.append(ln)
    const txt = document.createElementNS(svg.element.namespaceURI, "text")
    txt.className.baseVal = "ZoneName"
    txt.setAttribute('x', this.geometry[0][0] * svg.width + 3)
    txt.setAttribute('y', this.geometry[0][1] * svg.height + 10)
    txt.append(this.name)
    svg.element.append(txt)
  }
}

//******************************************************************************
class __Object {
  constructor(objId, kvargs) {
    this.id = objId
    this.deviceId = kvargs.deviceId
    this.zoneId = kvargs.zoneId
    this.sysId = kvargs.sysId
    this.name = kvargs.name
    this.value = kvargs.value
    this.hide = kvargs.hide
    this.x = kvargs.x * svg.width
    this.y = kvargs.y * svg.height
    this.w = 20
    this.h = 20
  }

  show() {
    this.element = Obj.createElement({ id: this.id, parent: instance.element,
      left: this.x, top: this.y,  tips: this.name })
    this.element.master = this
    this.update()
  }

  async update() {
    this.element.append(this.value === "on" ? "On" : "Off")
  }

  sendEvent(evn) {
    return Remote.promise("event",
      {deviceId: this.deviceId, objId: this.id, event: evn},
      (res) => {return res.event.event}
    )
  }
}

//******************************************************************************
Application.ModeButton = class ModeButton extends __Object {
  show() {
    super.show()
    this.element.className = "Button"
    this.element.addEventListener("click", evn => this.onClick(evn), false)
  }

  async onClick(evn) {
    this.value = await this.sendEvent(this.value === "on" ? "off" : "on")
    this.update()
  }

  async update() {
    this.element.append(this.value === "on" ? "Auto" : "Man")
  }
}

//******************************************************************************
Application.Sensor = class Sensor extends __Object {
  show() {
    super.show()
    this.element.className = "Sensor"
  }
}

//******************************************************************************
Application.TemperatureSensor = class TemperatureSensor extends Application.Sensor {
  constructor(objId, obj) {
    super(objId, obj)
    Application.updateElements.push(this)
  }

  async update() {
    this.value = await this.sendEvent("getValue")
    this.element.append(`t${parseFloat(this.value).toFixed(1)}&#8451;`)
  }
}

//******************************************************************************
Application.Relay = class Relay extends __Object {
  show() {
    super.show()
    this.element.className = "Relay"
  }
}

//******************************************************************************
Application.LightModeButton = class LightModeButton extends Application.ModeButton {
  async update() {
    super.update()
    this.element.className = `Button ${this.value === "on" ? "LightModeButtonOn" : "LightModeButtonOff"}`
  }
}

//******************************************************************************
Application.LightSensor = class LightSensor extends Application.Sensor {
  async update() {
    this.element.className = `Sensor ${this.value === "on" ? "LightSensorOn" : "LightSensorOff"}`
  }
}

//******************************************************************************
Application.LightRelay = class LightRelay extends Application.Relay {
  show() {
    super.show()
    this.element.addEventListener("click", evn => this.onClick(evn), false)
  }

  async update() {
    this.element.className = `Relay ${this.value === "on" ? "LightRelayOn" : "LightRelayOff"}`
  }

  async onClick(evn) {
    this.value = await this.sendEvent("press")
    this.update()
  }
}

//******************************************************************************
Application.DoorBellModeButton = class DoorBellModeButton extends Application.ModeButton {
  update() {
    super.update()
    this.element.className = `Button ${this.value === "on" ? "DoorBellModeButtonOn" : "DoorBellModeButtonOff"}`
  }
}

//******************************************************************************
Application.DoorBellRelay = class DoorBellRelay extends Application.Relay {
  update() {
    this.element.className = `Relay ${this.value === "on" ? "DoorBellRelayOn" : "DoorBellRelayOff"}`
  }
}

//******************************************************************************
Application.MotionDetector = class MotionDetector extends Application.Sensor {
  update() {
    this.element.className =  `Sensor ${this.value === "on" ? "MotionDetectorOn" : "MotionDetectorOff"}`
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  await Application.getInstance({ parent: document.body, className: "Home" })
})
