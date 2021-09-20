import { Obj } from "./Obj.js"

//******************************************************************************
export class CheckBox extends Obj {
  get checked() {
    const val = this.element?.checked
    if (val !== undefined) {
      this._checked = val }
    return this._checked
  }
  set checked(val) {
    this._checked = val
    if (this.isDisplayed) {
      this.element.checked = this._checked }
  }

  constructor(kvargs = []) {
    kvargs.tagName = "input"
    kvargs.classList = Obj.classList("CheckBox", kvargs.classList)
    super(kvargs)
  }

  show() {
    super.show()
    this.element.setAttribute("type", "checkbox")
  }
}
