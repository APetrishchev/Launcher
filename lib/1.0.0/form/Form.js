import { Obj } from "../Obj.js"
import { Button } from "../button/Button.js"


export class Form extends Obj {
	static SaveButton = 1
	static CanselButton = 2

  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Form", kvargs.classList)
    super(kvargs)
		this.behaviors = kvargs.behaviors || 0
    this.title = kvargs.title
    this.fields = kvargs.fields || []
    this.buttons = kvargs.buttons || []
    if (this.behaviors & Form.SaveButton) {
      this.addButton("SaveButton", Button.Save()) }
    if (this.behaviors & Form.CanselButton) {
      this.addButton("CancelButton", Button.Cancel()) }
  }

  // addField(kvargs) {
  //   this[kvargs.id] = kvargs.field
  //   this.fields.push([kvargs.field, kvargs.label])
  //   return kvargs.field
  // }

  addButton(id, button) {
    this[id] = button
    this.buttons.push(button)
    return button
  }

  show() {
    super.show()
		if (this.title || this.buttons.length) {
      const headersElement = Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-Headers") })
      this.titleElement = Obj.createElement({ parent: headersElement, classList: Obj.combine(this.classList, "-Title"),
        children: this.title })
      this.buttonsElement = Obj.createElement({ parent: headersElement, classList: Obj.combine(this.classList, "-Buttons"),
        children: this.buttons, disabled: true })
    }
    for (const field of this.fields) {
      if (field[1]) {
        const lbl = Obj.createElement({ classList: Obj.combine(this.classList, "-Field-Label"),
          children: field[1] })
        field[0].classList = Obj.combine(this.classList, "-Field-Value")
        this.add(Obj.createElement({ classList: Obj.combine(this.classList, "-Fields"),
          children: [lbl, field[0]] }))
      }
      else {
        field[0].parent = this.element
        field[0].show()
      }
    }
    return this.element
  }
}
