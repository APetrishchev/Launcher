import { App, Obj } from "../../../../Application/1.0.0/front/scripts/system.js"
import { tokens } from "../../../../ini.js"

var app, svg = {}
//******************************************************************************
export class Application extends App {
  static zones = {}
  static objects = {}
  static updateElements = [] // needed???????????????????????????????????????????????

  constructor(kvargs = {}) {
    super(kvargs)
    app = this
    this.token = new URL(location.href).searchParams.get("token")
    // CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG
    this.ini = tokens[this.token]
    // end CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG
    this.show()

    let checkbox = document.createElement("input")
    checkbox.id = "UpdateButton"
    checkbox.type = "checkbox"
    this.element.appendChild(checkbox)

    svg.element = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    this.element.appendChild(svg.element)
    const svgRect = svg.element.getBoundingClientRect()
    svg.width = svgRect.width
    svg.height = svgRect.height

    // CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG
    // await Remote.connect()
    // let const = await Remote.promise("getConfig", null, (res) => {return res["getConfig"]})
    const cfg = this.ini.applications.SmartHome.Home
    // end CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG CONFIG
    for (const [zoneId, zone] of Object.entries(cfg.Zones)) {
      new Zone(zoneId, zone).show()
    }
    for (const [zoneId, zone] of Object.entries(cfg.Objects)) {
      for (const [objId, obj] of Object.entries(zone)) {
        console.log(objId, obj.type)
        obj.zoneId = zoneId
        obj.hide = obj.hide || false

        let obj_ = new (Application[obj.type])(`${zoneId}_${objId}`, obj)
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
class Remote {
  static websocket = null
  static waiting = {}

  static connect() {
    return new Promise((resolve, reject) => {
      Remote.websocket = new WebSocket(`ws://${window.location.host}/ws`)
      Remote.websocket.onopen = function () {
        resolve()
      }
      Remote.websocket.onerror = function (err) {
        reject(err);
      }
      Remote.websocket.onmessage = Remote.onMessage
    })
  }

  static promise(id, body, onmessage) {
    let resolve_, reject_
    let promise = new Promise((resolve, reject) => {
      resolve_ = resolve
      reject_ = reject
      console.log(`<<< MESSAGE ${id}:`, body)
      Remote.websocket.send(`{${id}": ${JSON.stringify(body)}}`)
    })
    Remote.waiting[id] = { "resolve": resolve_, "reject": reject_, "onmessage": onmessage }
    return promise
  }

  static onMessage(evn) {
    let result = JSON.parse(evn.data)
    for (let id in result) {
      console.log(`>>> MESSAGE ${id}:`, result[id])
      if (Remote.waiting[id]) {
        Remote.waiting[id].resolve(Remote.waiting[id].onmessage(result))
        delete Remote.waiting[id]
      } else if (id === "event") {
        let obj = Application.objects[result[id].objId]
        obj.value = result[id].event
        obj.update()
      }
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
    let ln = document.createElementNS(svg.element.namespaceURI, "polygon")
    ln.className.baseVal = "Zone"
    let points = ''
    for (let idx = 1; idx < this.geometry.length; idx++) {
      points += `${this.geometry[idx][0] * svg.width},${this.geometry[idx][1] * svg.height} `
    }
    points += `${this.geometry[0][0] * svg.width},${this.geometry[0][1] * svg.height}`
    ln.setAttribute("points", points)
    ln.setAttribute("stroke", "rgb(0,0,0)")
    svg.element.appendChild(ln)
    let txt = document.createElementNS(svg.element.namespaceURI, "text")
    txt.className.baseVal = "ZoneName"
    txt.setAttribute('x', this.geometry[0][0] * svg.width + 3)
    txt.setAttribute('y', this.geometry[0][1] * svg.height + 10)
    txt.innerHTML = this.name
    svg.element.appendChild(txt)
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
    this.element = Obj.createElement({ id: this.id, parent: app.element,
      left: this.x, top: this.y,  tips: this.name })
    this.element.master = this
    this.update()
  }

  async update() {
    this.element.innerHTML = this.value === "on" ? "On" : "Off"
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
    this.element.innerHTML = this.value === "on" ? "Auto" : "Man"
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
    this.element.innerHTML = `t${parseFloat(this.value).toFixed(1)}&#8451;`
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
  new Application({ parent: document.body, className: "Home" })
})
