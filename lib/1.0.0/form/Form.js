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
			this.addButton(Button.Save())
		}
		if (this.behaviors & Form.CanselButton) {
			this.addButton(Button.Cancel())
		}
	}

	addField(kvargs) {
		this[kvargs.id] = kvargs
		this.fields.push(kvargs)
		return kvargs
	}

	addButton(button) {
		this[button.id] = button
		this.buttons.push(button)
		return button
	}

	show() {
		super.show()
		if (this.title || this.buttons.length) {
			const headersElement = Obj.createElement({
				parent: this.element,
				classList: Obj.combine(this.classList, "-Headers")
			})
			if (this.title) {
				this.titleElement = Obj.createElement({
					parent: headersElement,
					classList: Obj.combine(this.classList, "-Title"),
					children: this.title
				})
			}
			if (this.title || this.buttons.length) {
				this.buttonsElement = Obj.createElement({
					parent: headersElement,
					classList: Obj.combine(this.classList, "-Buttons"),
					children: this.buttons,
					disabled: true
				})
			}
		}
		for (const field of this.fields) {
			const fieldElement = Obj.createElement({
				parent: this.element,
				classList: Obj.combine(this.classList, "-Field")
			})
			if (field.label) {
				const lbl = Obj.createElement({
					parent: fieldElement,
					classList: Obj.combine(this.classList, "-Field-Label"),
					children: field.label
				})
			}
			field.parent = fieldElement
			field.classList = Obj.combine(this.classList, "-Field-Value")
			const valueElement = Obj.createElement(field)
		}
		return this.element
	}
}