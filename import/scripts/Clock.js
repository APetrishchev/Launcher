import { Obj } from "./Obj.js"
import { firstZero, roundRect } from "./etc.js"

//******************************************************************************
export class DigitalClock extends Obj {
  constructor(kvargs = {}) {
    super(kvargs)
    this.parent = parent
    this.className = kvargs.className || "DigitalClock"
  }

  show() {
    super.show()
  }

  hide() {
    super.hide()
  }

  update(now) {
  }
}

//******************************************************************************
export class AnalogClock extends Obj {
  constructor(kvargs = {}) {
    super(kvargs)
    this.parent = parent
    this.className = kvargs.className || "AnalogClock"
    this.digitalEnable = kvargs.digitalEnable || true
  }

  addCanvas(className) {
    const cnv = Obj.createElement({ tagName: "canvas", parent: this.element })
    cnv.width = cnv.clientWidth
    cnv.height = cnv.clientHeight
    return cnv.getContext("2d")
  }

  show() {
    const font = "serif" //"DejaVu Sans Mono"
    const minuteDigitsFillColor = "#44f"
    const minuteDotStrokeColor = "#000"
    const minuteDotFillColor = "#44f"
    const hourDigitsFillColor = "#44f"
    const digitalClockFrameColor = "#666"
    const digitalClockBackgroundColor = "#fff"

    super.show()
    const ctx = this.addCanvas()
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const r = 0.47 * ctx.canvas.width
    const xc = r + 2
    const yc = r + 2

    // Minute & Seconds Ring
    ctx.save()
    ctx.beginPath()
    ctx.shadowOffsetX = 0.05 * r
    ctx.shadowOffsetY = 0.05 * r
    ctx.shadowBlur = 0.05 * r
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
    const gradient = ctx.createRadialGradient(xc - 0.025 * r, yc - 0.025 * r,
      0.9 * r, xc, yc, r)
    gradient.addColorStop(0, "#fff")
    gradient.addColorStop(1, "#aaa")
    ctx.fillStyle = gradient
    ctx.strokeStyle = "#444"
    ctx.arc(xc, yc, r, 0, 360)
    ctx.fill()
    ctx.stroke()
    //Minute & Seconds Digits
    ctx.font = `bold ${0.10 * r}px monospace`
    for (let i = 0; i < 60; i++) {
      const x = xc + 0.93 * r * Math.sin(i * Math.PI / 30)
      const y = yc - 0.93 * r * Math.cos(i * Math.PI / 30)
      if (i % 5 == 0) {
        ctx.beginPath()
        ctx.fillStyle = minuteDigitsFillColor
        ctx.fillText(firstZero(i), x, y)
      } else {
        ctx.beginPath()
        ctx.strokeStyle = minuteDotStrokeColor
        ctx.fillStyle = minuteDotFillColor
        ctx.arc(x, y, 0.015 * r, 0, 360)
        ctx.stroke()
        ctx.fill()
      }
    }
    ctx.restore()
    //Hour Disk
    ctx.save()
    ctx.beginPath()
    gradient = ctx.createRadialGradient(xc - 0.25 * r, yc - 0.25 * r, 0.75 * r,
      xc - 0.25 * r, yc - 0.25 * r, r)
    gradient.addColorStop(0, "#ccc")
    gradient.addColorStop(1, "#fff")
    ctx.fillStyle = gradient
    ctx.strokeStyle = "#444"
    ctx.arc(xc, yc, 0.85 * r, 0, 360)
    ctx.fill()
    ctx.stroke()
    // Hour Digits
    ctx.fillStyle = hourDigitsFillColor
    ctx.strokeStyle = "#000"
    ctx.font = `bold ${0.16 * r}px ${font}`
    for (let i = 1; i < 13; i++) {
      ctx.fillText(firstZero(i),
        xc + 0.73 * r * Math.sin(i * Math.PI / 6),
        yc - 0.73 * r * Math.cos(i * Math.PI / 6))
    }
    if (this.digitalEnable) {
      ctx.fillStyle = digitalClockBackgroundColor
      ctx.strokeStyle = digitalClockFrameColor
      roundRect(ctx, xc - 0.5 * r, yc - 0.54 * r, r, 0.34 * r, 10, true) // Hours:Minutes Frame
      roundRect(ctx, xc - 0.63 * r, yc - 0.13 * r, 0.5 * r, 0.28 * r, 10, true) // Weekday Frame
      roundRect(ctx, xc + 0.2 * r, yc - 0.13 * r, 0.38 * r, 0.28 * r, 10, true) // Date Frame
      roundRect(ctx, xc - 0.4 * r, yc + 0.2 * r, 0.8 * r, 0.32 * r, 10, true) // Month Frame
      this.digitalClockContext = this.addCanvas()
    }
    this.clockHandsContext = this.addCanvas()
  }

  hide() {
    super.hide()
    delete (this.digitalClockContext)
    delete (this.clockHandsContext)
  }

  update(now) {
    const clockHandsFillColor = "rgba(70, 70, 70, 1)"
    const clockHandsStrokeColor = "rgba(30, 30, 30, 1)"
    const secondHandColor = "#f44"
    const font = "serif" //"DejaVu Sans Mono"
    const digitalClockDigitsColor = "#44f"
    const locale = "ru-RU"

    const r = 0.47 * this.clockHandsContext.canvas.width
    const xc = r + 2
    const yc = r + 2

    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    // Digital Clock
    if (this.digitalEnable) {
      if (this.minutes === undefined || this.minutes !== minutes) {
        this.minutes = minutes
        this.digitalClockContext.clearRect(0, 0,
          this.digitalClockContext.canvas.width, this.digitalClockContext.canvas.height)
        this.digitalClockContext.save()
        this.digitalClockContext.fillStyle = digitalClockDigitsColor
        // Hours:Minutes
        this.digitalClockContext.font = `bold ${0.42 * r}px ${font}`
        this.digitalClockContext.fillText(`${firstZero(hours)}:${firstZero(minutes)}`, xc - 0.5 * r, yc - 0.23 * r)
        // Weekday
        this.digitalClockContext.font = `bold ${0.26 * r}px ${font}`
        this.digitalClockContext.fillText(new Intl.DateTimeFormat(locale, { weekday: "short" }).format(now).toUpperCase(),
          xc - 0.61 * r, yc + 0.1 * r)
        // Date
        this.digitalClockContext.font = `bold ${0.32 * r}px ${font}`
        this.digitalClockContext.fillText(firstZero(now.getDate()), xc + 0.23 * r, yc + 0.115 * r)
        // Month
        this.digitalClockContext.font = `bold ${0.30 * r}px ${font}`
        this.digitalClockContext.fillText(new Intl.DateTimeFormat(locale, { month: "short" }).format(now).toUpperCase(),
          xc - 0.38 * r, yc + 0.48 * r)
        this.digitalClockContext.restore()
      }
    }
    // ClockHands
    this.clockHandsContext.beginPath()
    this.clockHandsContext.clearRect(0, 0,
      this.clockHandsContext.canvas.width, this.clockHandsContext.canvas.height)
    // Hours ClockHand
    this.clockHandsContext.save()
    this.clockHandsContext.beginPath()
    this.clockHandsContext.translate(xc, yc)
    this.clockHandsContext.rotate((hours >= 12 ? hours - 12 : hours) * Math.PI / 6 + minutes * Math.PI / 360);
    this.clockHandsContext.moveTo(0, 0)
    this.clockHandsContext.lineTo(-0.03 * r, 0)
    this.clockHandsContext.lineTo(-0.03 * r, -0.6 * r)
    this.clockHandsContext.lineTo(0, -0.65 * r)
    this.clockHandsContext.lineTo(0.03 * r, -0.6 * r)
    this.clockHandsContext.lineTo(0.03 * r, 0)
    this.clockHandsContext.closePath()
    this.clockHandsContext.fillStyle = clockHandsFillColor
    this.clockHandsContext.fill()
    this.clockHandsContext.strokeStyle = clockHandsStrokeColor
    this.clockHandsContext.stroke()
    this.clockHandsContext.restore()
    // Minutes ClockHand
    this.clockHandsContext.save()
    this.clockHandsContext.beginPath()
    this.clockHandsContext.translate(xc, yc)
    this.clockHandsContext.rotate(minutes * Math.PI / 30 + seconds * Math.PI / 1800)
    this.clockHandsContext.moveTo(0, 0)
    this.clockHandsContext.lineTo(-0.03 * r, 0)
    this.clockHandsContext.lineTo(-0.03 * r, -0.77 * r)
    this.clockHandsContext.lineTo(0, -0.82 * r)
    this.clockHandsContext.lineTo(0.03 * r, -0.77 * r)
    this.clockHandsContext.lineTo(0.03 * r, 0)
    this.clockHandsContext.closePath()
    this.clockHandsContext.fillStyle = clockHandsFillColor
    this.clockHandsContext.fill()
    this.clockHandsContext.strokeStyle = clockHandsStrokeColor
    this.clockHandsContext.stroke()
    this.clockHandsContext.restore()
    // Seconds ClockHand
    this.clockHandsContext.save()
    this.clockHandsContext.beginPath()
    this.clockHandsContext.translate(xc, yc)
    this.clockHandsContext.rotate(seconds * Math.PI / 30)
    this.clockHandsContext.lineWidth = 0.015 * r
    this.clockHandsContext.moveTo(0, 0.25 * r)
    this.clockHandsContext.lineTo(0, -0.97 * r)
    this.clockHandsContext.strokeStyle = secondHandColor
    this.clockHandsContext.stroke()
    this.clockHandsContext.restore()
    //Central disk
    this.clockHandsContext.beginPath()
    const gradient = this.clockHandsContext.createRadialGradient(xc - 0.05 * r, yc - 0.05 * r, 0.05 * r,
      xc - 0.05 * r, yc - 0.05 * r, 0.1 * r)
    gradient.addColorStop(0, "#fff")
    gradient.addColorStop(1, "#aaa")
    this.clockHandsContext.fillStyle = gradient
    this.clockHandsContext.strokeStyle = "#444"
    this.clockHandsContext.arc(xc, yc, 0.1 * r, 0, 360)
    this.clockHandsContext.fill()
    this.clockHandsContext.stroke()
  }
}
