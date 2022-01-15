import { Obj } from "../Obj.js"


export class ListBox extends Obj {
  get value() {
    const val = this.element?.value
    if (val) {
      this._value = val }
    return this._value
  }
  set value(val) {
    this._value = val
    if (this.isDisplayed) {
      this.element.value = this._value }
  }

  constructor(kvargs = []) {
    kvargs.tagName = "select"
    kvargs.classList = Obj.classList("ListBox", kvargs.classList)
    super(kvargs)
    this.options = kvargs.options
    this._value = kvargs.value
  }

  show() {
    super.show()
    for (const option of this.options) {
      Obj.createElement({ tagName: "option", parent: this.element, children: option,
        classList: Obj.combine(this.classList, "-Option") })
    }
    this.value = this._value
  }
}
