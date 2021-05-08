import { Widget } from "./system.js"
import { firstZero, roundRect } from "./etc.js"

//******************************************************************************
export class DigitalClock extends Widget {
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
export class AnalogClock extends Widget {
  constructor(kvargs = {}) {
    super(kvargs)
    this.parent = parent
    this.className = kvargs.className || "AnalogClock"
    this.digitalEnable = kvargs.digitalEnable || true
  }

  addCanvas(className) {
    let cnv = Widget.createElement({ tagName: "canvas", parent: this.element })
    cnv.width = cnv.clientWidth
    cnv.height = cnv.clientHeight
    return cnv.getContext("2d")
  }

  show() {
    let font = "serif" //"DejaVu Sans Mono"
    let minuteDigitsFillColor = "#44f"
    let minuteDotStrokeColor = "#000"
    let minuteDotFillColor = "#44f"
    let hourDigitsFillColor = "#44f"
    let digitalClockFrameColor = "#666"
    let digitalClockBackgroundColor = "#fff"

    super.show()
    let ctx = this.addCanvas()
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    let r = 0.47 * ctx.canvas.width
    let xc = r + 2
    let yc = r + 2

    // Minute & Seconds Ring
    ctx.save()
    ctx.beginPath()
    ctx.shadowOffsetX = 0.05 * r
    ctx.shadowOffsetY = 0.05 * r
    ctx.shadowBlur = 0.05 * r
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
    let gradient = ctx.createRadialGradient(xc - 0.025 * r, yc - 0.025 * r,
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
      let x = xc + 0.93 * r * Math.sin(i * Math.PI / 30)
      let y = yc - 0.93 * r * Math.cos(i * Math.PI / 30)
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
    let clockHandsFillColor = "rgba(70, 70, 70, 1)"
    let clockHandsStrokeColor = "rgba(30, 30, 30, 1)"
    let secondHandColor = "#f44"
    let font = "serif" //"DejaVu Sans Mono"
    let digitalClockDigitsColor = "#44f"
    let locale = "ru-RU"

    let r = 0.47 * this.clockHandsContext.canvas.width
    let xc = r + 2
    let yc = r + 2

    let hours = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()

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
    let gradient = this.clockHandsContext.createRadialGradient(xc - 0.05 * r, yc - 0.05 * r, 0.05 * r,
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

//******************************************************************************
export class TalkClock extends Widget {
  constructor(kvargs = {}) {
    super(kvargs)
    let lang = kvargs.lang || "en-US"
    let gender = kvargs.gender || "female"
    this.path = `/import/audio/clock/${lang}/${gender}/`
    this.preSound = kvargs.preSound  || null
    this.volume = kvargs.volume || 0.5
  }

  play(now) {
    let hours = now.getHours()
    let minutes = now.getMinutes()
    let playList = []
    if (this.preSound) {
      playList.push(this.preSound)}
    if (hours < 20) {
      playList.push(`${this.path}${hours}.wav`)}
    else {
      playList.push(`${this.path}20.wav`)}
    if (hours > 20) {
      playList.push(`${this.path}${hours % 20}.wav`)}
    playList.push(`${this.path}oclock.wav`)
    let tensOfMinutes
    if (minutes > 0) {
      if (minutes < 20) {
        playList.push(`${this.path}${minutes}.wav`)}
      else {
        tensOfMinutes = Math.floor(minutes / 10) * 10
        playList.push(`${this.path}${tensOfMinutes}.wav`)}
    }
    let unitsOfMinutes = minutes % tensOfMinutes
    if (unitsOfMinutes > 0) {
      playList.push(`${this.path}${unitsOfMinutes}.wav`)}
    playList.push(`${this.path}minutes.wav`)
    let idx = 0
    let audioElement = new Audio(playList[idx])
    audioElement.volume = this.volume
    audioElement.addEventListener("canplaythrough", evn => audioElement.play())
    audioElement.addEventListener("ended", evn => {
      if (++idx < playList.length) {
        audioElement.src = playList[idx]}
    })
  }
}
