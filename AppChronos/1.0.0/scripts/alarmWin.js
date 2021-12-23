import { debug } from "../../../lib/scripts/etc.js"

export class Alarm {
  constructor(kvargs) {
    const width = 480
    const height = 193
    const left = (screen.width / 2) - (width / 2)
    const top = (screen.height / 4) - (height / 2)
    this.delay = 15
    debug(`Alarm(msg:${kvargs.msg}, media:${kvargs.media}, vol:${kvargs.vol}, timeout:${kvargs.timeout}, dly:${this.delay})`)
    this.winParams = ["about:blank", "Alarm", `left=${left},top=${top},width=${width},height=${height}`]
    this.html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Alarm</title>
  <link rel="stylesheet" type="text/css" media="screen" href="/AppChronos/1.0.0/styles/alarm.css">
  <script type="text/javascript" src="/AppChronos/1.0.0/scripts/alarmPlay.js"></script>
</head>
<body><script>main("${kvargs.msg}", "${kvargs.media}", ${kvargs.vol}, ${this.delay})</script></body>
</html>
`
    this.win = null
    this.timeout = (kvargs.timeout || 10) * 1000
    this.timeoutTimer = null
    this.delayTimer = null
    this.openWindow()
    this.closeTimer = setInterval(() => {
      if (window.__stopRequest__ || window.__delayRequest__) {
        this.win.close() }
    }, 500)
  }

  openWindow() {
    this.win = window.open(...this.winParams)
    this.win.document.write(this.html)

    if (this.delayTimer) {
      clearTimeout(this.delayTimer)
      this.delayTimer = null
    }
    if (this.timeout) {
      this.timeoutTimer = setTimeout(evn => {
        window.__stopRequest__ = true
        this.win.close()
      }, this.timeout)
    }
    this.win.onbeforeunload = evn => {
      if (window.__delayRequest__) {
        this.delayTimer = setTimeout(evn => this.openWindow(), this.delay * 6e4) }
      else {
        clearInterval(this.closeTimer) }
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
      delete window.__delayRequest__
      delete window.__stopRequest__
      this.win = null
    }
  }
}
