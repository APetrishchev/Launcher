import { Obj } from "./Obj.js"
import { Button } from "./Button.js"

//******************************************************************************
export class Form extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Form", kvargs.classList)
    super(kvargs)
    this.fields = kvargs.fields || []
    this.buttons = kvargs.buttons || []
  }

  addField(kvargs) {
    this[kvargs.id] = kvargs.field
    this.fields.push([kvargs.field, kvargs.label])
    return kvargs.field
  }

  addButton(id, button) {
    this[id] = button
    this.buttons.push(button)
    return button
  }

  show() {
    super.show()
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
    const buttonsElement = Obj.createElement({ parent: this.element,
      classList: Obj.combine(this.classList, "-Buttons") })
    const kvargs = { parent: buttonsElement, classList: Obj.combine(this.classList, "-Button"),
      disabled: true }
    // for (const idx in this.buttons) {
    //   kvargs.children = this.buttons[idx].children
    //   kvargs.events = this.buttons[idx].events
    //   this.buttons[idx].element = new Button(kvargs).show()
    // }
    if (this.buttons) {
      for (const btn of this.buttons) {
      btn.parent = buttonsElement
        btn.show()
      }
    }
    return this.element
  }
}
