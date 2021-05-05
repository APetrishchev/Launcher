import {firstZero, clearElement} from "./etc.js"

export class Clock {
  constructor(argkv={}) {
    this.parent = argkv.parent
    this.className = argkv.className || "Clock"
    this.size = 250 // getStylePropeties(this.className).width
  }

  show() {
    let radius = 0.47 * this.size
    let xCenter = radius + 2
    let yCenter = radius + 2

    this.element = document.createElement("div")
    this.parent.appendChild(this.element)

    let cnv = document.createElement("canvas")
    this.element.appendChild(cnv)
    cnv.width = this.size
    cnv.height = this.size
    this.clockFaceContext = cnv.getContext("2d")
    this.clockFaceContext.save()
    // Minute & Seconds Ring
    this.clockFaceContext.beginPath()
    this.clockFaceContext.shadowOffsetX = 0.05 * radius
    this.clockFaceContext.shadowOffsetY = 0.05 * radius
    this.clockFaceContext.shadowBlur = 0.05 * radius
    this.clockFaceContext.shadowColor = "rgba(0, 0, 0, 0.5)"
    this.clockFaceContext.arc(xCenter, yCenter, radius, 0, 360)
    let gradient = this.clockFaceContext.createRadialGradient(xCenter-0.025*radius, yCenter-0.025*radius,
      0.9*radius, xCenter, yCenter, radius)
    gradient.addColorStop(0, "#fff")
    gradient.addColorStop(1, "#aaa")
    this.clockFaceContext.fillStyle = gradient
    this.clockFaceContext.fill()
    this.clockFaceContext.strokeStyle = "#444"
    this.clockFaceContext.stroke()
    this.clockFaceContext.restore()

    this.clockFaceContext.textAlign = "center"
    this.clockFaceContext.textBaseline = "middle"
    //Minute & Seconds digits
    this.clockFaceContext.font = `bold ${0.10*radius}px monospace`
    for(let i = 0; i < 60; i++) {
      let x = xCenter+0.93*radius*Math.sin(i*Math.PI/30)
      let y = yCenter-0.93*radius*Math.cos(i*Math.PI/30)
      if(i%5 == 0) {
        this.clockFaceContext.beginPath()
        this.clockFaceContext.fillStyle = "#000"
        this.clockFaceContext.fillText(firstZero(i), x, y)
      } else {
        this.clockFaceContext.beginPath()
        this.clockFaceContext.strokeStyle = "#000"
        this.clockFaceContext.fillStyle = "#ddd"
        this.clockFaceContext.arc(x, y, 0.015*radius, 0, 360)
        this.clockFaceContext.stroke()
        this.clockFaceContext.fill()
      }
    }
    //Hour ring
    this.clockFaceContext.beginPath()
    this.clockFaceContext.arc(xCenter, yCenter, 0.85*radius, 0, 360)
    gradient = this.clockFaceContext.createLinearGradient(0, 0, 1.7*radius, 1.7*radius)
    gradient.addColorStop(0, "#888")
    gradient.addColorStop(1, "#fff")
    this.clockFaceContext.fillStyle = gradient
    this.clockFaceContext.fill()
    this.clockFaceContext.strokeStyle = "#444"
    this.clockFaceContext.stroke()

    cnv = document.createElement("canvas")
    this.element.appendChild(cnv)
    cnv.style = `z-index: 1; margin-left: -${this.size}px;`
    cnv.width = this.size
    cnv.height = this.size
    this.clockDigitsContext = cnv.getContext("2d")
    this.clockDigitsContext.textAlign = "center"
    this.clockDigitsContext.textBaseline = "middle"

    cnv = document.createElement("canvas")
    this.element.appendChild(cnv)
    cnv.style = `z-index: 2; margin-left: -${this.size}px;`
    cnv.width = this.size
    cnv.height = this.size
    this.clockHandsContext = cnv.getContext("2d")

    //Central disk
    cnv = document.createElement("canvas")
    this.element.appendChild(cnv)
    cnv.style = `z-index: 3; margin-left: -${this.size}px;`
    cnv.width = this.size
    cnv.height = this.size
    let ctx = cnv.getContext("2d")
    ctx.beginPath()
    ctx.arc(xCenter, yCenter, 0.1 * radius, 0, 360)
    gradient = ctx.createLinearGradient(-0.05*radius, -0.05*radius, 0.1*radius, 0.1*radius)
    gradient.addColorStop(0, "#fff")
    gradient.addColorStop(1, "#aaa")
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = "#444"
    ctx.stroke()

    this.timer = setInterval((evn) => this.update(evn), 500)
  }

  hide() {
    clearInterval(this.timer)
    clearElement(this.element)
    delete (this.clockFaceContext)
    delete (this.clockDigitsContext)
    delete (this.clockHandsContext)
  }

  update() {
    let radius = 0.47 * this.size
    let xCenter = radius + 2
    let yCenter = radius + 2
    let now = new Date()
    let hours = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()

    if (this.hours == undefined || (hours > 0 && hours < 12 && this.hours > 12) || (hours > 12 && this.hours <= 12)) {
      this.hours = hours
      // Hour digits
      this.clockDigitsContext.clearRect(0, 0,
        this.clockDigitsContext.canvas.width, this.clockDigitsContext.canvas.height)
      this.clockDigitsContext.beginPath()
      this.clockDigitsContext.strokeStyle = "#000"
      this.clockDigitsContext.fillStyle = "#444"
      if (hours < 12) {
        // Hour AM digits
        this.clockDigitsContext.font = `bold ${0.16 * radius}px monospace`
        for (let i = 1; i < 13; i++) {
          this.clockDigitsContext.fillText(firstZero(i),
            xCenter + 0.73 * radius * Math.sin(i * Math.PI / 6),
            yCenter - 0.73 * radius * Math.cos(i * Math.PI / 6))
        }
        // Hour PM digits
        this.clockDigitsContext.font = `${0.13 * radius}px monospace`
        for (let i = 1; i < 13; i++) {
          this.clockDigitsContext.fillText(firstZero((i == 12) ? 0 : i + 12),
            xCenter + 0.53 * radius * Math.sin(i * Math.PI / 6),
            yCenter - 0.53 * radius * Math.cos(i * Math.PI / 6))
        }
      } else {
        // Hour PM digits
        this.clockDigitsContext.font = `bold ${0.16 * radius}px monospace`
        for (var i = 1; i < 13; i++) {
          this.clockDigitsContext.fillText(firstZero((i == 12) ? 0 : i + 12),
            xCenter + 0.73 * radius * Math.sin(i * Math.PI / 6),
            yCenter - 0.73 * radius * Math.cos(i * Math.PI / 6))
        }
        // Hour AM digits
        this.clockDigitsContext.font = `${0.13 * radius}px monospace`
        for (var i = 1; i < 13; i++) {
          this.clockDigitsContext.fillText(firstZero(i),
            xCenter + 0.53 * radius * Math.sin(i * Math.PI / 6),
            yCenter - 0.53 * radius * Math.cos(i * Math.PI / 6))
        }
      }
    }

    // ClockHands
    hours = hours >= 12 ? hours - 12 : hours
    this.clockHandsContext.beginPath()
    this.clockHandsContext.clearRect(0, 0,
      this.clockHandsContext.canvas.width, this.clockHandsContext.canvas.height)
    this.clockHandsContext.save()
    this.clockHandsContext.translate(xCenter, yCenter)
    // Hour ClockHands
    this.clockHandsContext.beginPath()
    this.clockHandsContext.rotate(hours * Math.PI / 6 + minutes * Math.PI / 360);
    this.clockHandsContext.moveTo(0, 0)
    this.clockHandsContext.lineTo(-0.03 * radius, 0)
    this.clockHandsContext.lineTo(-0.03 * radius, -0.6 * radius)
    this.clockHandsContext.lineTo(0, -0.65 * radius)
    this.clockHandsContext.lineTo(0.03 * radius, -0.6 * radius)
    this.clockHandsContext.lineTo(0.03 * radius, 0)
    this.clockHandsContext.closePath()
    this.clockHandsContext.fillStyle = "rgba(0, 0, 0, 0.4)"
    this.clockHandsContext.fill()
    this.clockHandsContext.strokeStyle = "rgba(0, 0, 0, 0.7)"
    this.clockHandsContext.stroke()
    // Minute ClockHands
    this.clockHandsContext.beginPath()
    this.clockHandsContext.rotate(minutes * Math.PI / 30 + seconds * Math.PI / 1800)
    this.clockHandsContext.moveTo(0, 0)
    this.clockHandsContext.lineTo(-0.02 * radius, 0)
    this.clockHandsContext.lineTo(-0.02 * radius, -0.795 * radius)
    this.clockHandsContext.lineTo(0, -0.845 * radius)
    this.clockHandsContext.lineTo(0.02 * radius, -0.795 * radius)
    this.clockHandsContext.lineTo(0.02 * radius, 0)
    this.clockHandsContext.closePath()
    this.clockHandsContext.fillStyle = "rgba(0, 0, 0, 0.4)"
    this.clockHandsContext.fill()
    this.clockHandsContext.strokeStyle = "rgba(0, 0, 0, 0.7)"
    this.clockHandsContext.stroke()
    // Second ClockHands
    this.clockHandsContext.beginPath()
    this.clockHandsContext.lineWidth = 0.015 * radius
    this.clockHandsContext.rotate(seconds * Math.PI / 30)
    this.clockHandsContext.moveTo(0, 0.25 * radius)
    this.clockHandsContext.lineTo(0, -0.97 * radius)
    this.clockHandsContext.fillStyle = "#F44"
    this.clockHandsContext.fill()
    this.clockHandsContext.strokeStyle = "#F44"
    this.clockHandsContext.stroke()

    this.clockHandsContext.restore()
  }

  toString() {return 'object "Clock"'}

}

Clock.doc = ""
