import { Obj } from "../Obj.js"


export class Button extends Obj {
  // new Button({
  //   parent,
  //   type: { Button.Button* | Button.Toggle | Button.Radio },
  //   classList,
  //   status: { Button.Up* | Button.Down }
  // })

  static Button = 0
  static Toggle = 1
  static Radio = 2
  static Up = 0
  static Down = 1

  static Ok = (kvargs={}) => {
    kvargs.id = kvargs.id || "OkButton"
    // kvargs.type = Button
    kvargs.classList = Obj.classList("Button-Ok", kvargs.classList)
    return new Button(kvargs)
  }

  static Save = (kvargs = {}) => {
    kvargs.id = kvargs.id || "SaveButton"
    // kvargs.type = Button
    kvargs.classList = Obj.classList("Button-Save", kvargs.classList)
    return new Button(kvargs)
  }

  static Cancel = (kvargs = {}) => {
    kvargs.id = kvargs.id || "CanselButton"
    // kvargs.type = Button
    kvargs.classList = Obj.classList("Button-Cancel", kvargs.classList)
    return new Button(kvargs)
  }

  static Close = (kvargs = {}) => {
    kvargs.id = kvargs.id || "CloseButton"
    // kvargs.type = Button
    kvargs.classList = Obj.classList("Button-Close", kvargs.classList)
    return new Button(kvargs)
  }

  get status() {
    return this._status
  }

  set status(val) {
    this._status = val
    if (this.isDisplayed) {
      if (this._status === Button.Down) {
        this.element.setAttribute("status", "down") }
      else if(this._status === Button.Up) {
        this.element.setAttribute("status", "up") }
    }
    return this._status
  }

  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Button", kvargs.classList)
    super(kvargs)
    this.picture = kvargs.picture
    this.type = kvargs.type || Button.Button
    this._status = kvargs.status || Button.Up
    let events = []
    if (this.type === Button.Toggle) {
      events = [
        {"click": evn => {
          if (this.status === Button.Up) {
            this.status = Button.Down }
          else if (this.status === Button.Down) {
            this.status = Button.Up }
        }}
      ]
    }
    this.events = [...events, ...(kvargs.events instanceof Array ? kvargs.events : (kvargs.events ? [kvargs.events] : []))]
    this.group = kvargs.group
  }

  show() {
    let type
    if (this.type === Button.Button || this.type === Button.Toggle) {
      this.tagName = this.picture ? "img" : "button"
      type = "button" }
    else if (this.type === Button.Radio) {
      this.tagName = "input"
      type = "radio" }
    super.show()
    this.element.setAttribute("type", type)
    if (this.type = Button.Radio) {
      this.element.setAttribute("name", this.group) }
    this.status = this._status
    if (this.picture) {
      this.element.src = this.picture }
    return this.element
  }
}
