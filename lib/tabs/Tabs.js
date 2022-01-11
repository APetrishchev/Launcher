import { Obj } from "../Obj.js"

export class Tab {
	get isChanged() {
		return this._isChanged || false
	}
	set isChanged(val) {
		this._isChanged = val
		this.element?.setAttribute("isChanged", val ? "yes" : "no")
	}

	get state() {
		this.element?.setAttribute("state", "off")
		return this._state || 0
	}
	set state(val) {
		this._state = val
		this.element?.setAttribute("state", val ? "on" : "off")
	}

	constructor(kvargs) {
		this.id = kvargs.id
		this.element = Obj.createElement({
			id: this.id,
			classList: ["Tabs-Tab"],
			events: { "click": evn => kvargs.owner.toggle(this) }
		})
		if (kvargs.behaviors & Tabs.TabClose) {
			Obj.createElement({ parent: this.element, classList: ["Tabs-Tab-Close"],
				events: {"click": console.log(this)} })
		}
		this.element.append(kvargs.name)
		this.state = 0
		this.isChanged = false
	}

	show() {
	}
}


export class Tabs {
	// Behaviors
	static TabNew = 0x01
	static TabRename = 0x02
	static TabClose = 0x08
	static TabMove = 0x10

	get tab() {return this._tab}
	set tab(val) {
		if (this._tab) {
			this._tab.state = 0	}
		if (this.bodyElement) {
			while (this.bodyElement.firstChild) {
				this.bodyElement.lastChild.remove() }
		}
		this._tab = this.getTab(val)
		this._tab.state = 1
		this._tab.show()
	}

	constructor(kvargs=[]) {
		this.behaviors = kvargs.behaviors || 0
		this.parent = kvargs.parent
		this.tabs = []
		this._tab = null
	}

	getTab(tab) {
		if (typeof tab === "number") {
			tab = this.tabs[tab]
		} else if (typeof tab === "string") {
			tab = this[tab] }
		return tab
	}

	addTab(kvargs) {
		kvargs.behaviors = this.behaviors
		kvargs.owner = this
		const tab = new Tab(kvargs)
		if (kvargs.after) {
			if (typeof kvargs.after !== "number") {
				kvargs.after = this.tabs.indexOf(this.getTab(after)) }
			this.tabs.splice(kvargs.after, 0, tab)
		} else {
			this.tabs.push(tab) }
		this[kvargs.name] = tab
		this.tab = tab
		if (this.element) {
			this.show() }
		return tab
	}

	delTab(tab) {
		if (typeof tab !== "number") {
			tab = this.tabs.indexOf(this.getTab(tab))	}
		delete this[tab.id]
		this.tabs.splice(tab, 1)
	}

	toggle(tab) {
		this.tab = tab
	}

	show() {
		if (!this.element) {
			this.element = Obj.createElement({ parent: this.parent, classList: ["Tabs"] })
			this.parent.append(this.element)
		} else {
			this.hide() }
		this.leftButtonElement = Obj.createElement({ parent: this.element,
			classList: ["Button", "Button-Left", "Tabs-Button"] })
		this.scrollElement = Obj.createElement({ parent: this.element, classList: ["Tabs-Scroll"] })
		this.rightButtonElement = Obj.createElement({ parent: this.element,
			classList: ["Button", "Button-Right", "Tabs-Button"]
			})
		// if (this.tabs.length > 1) {
			for (const tab of this.tabs) {
				this.scrollElement.append(tab.element) }
		// }
		this.bodyElement = Obj.createElement({ classList: ["Tabs-Body"] })
		this.element.after(this.bodyElement)
	}

	hide() {
		Obj.clearElement(this.element)
		this.bodyElement.remove()
  }
}
