export class Alarm {
  constructor(kvargs) {
    this.delay = 15
    this.winParams = [`/AppLaucher/1.0.0/front/alarm.html?media=${kvargs.media}&vol=${kvargs.vol}&msg=${kvargs.msg}&dly=${this.delay}`,
      "Alarm", "left=150,top=20,width=480,height=190"]
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
