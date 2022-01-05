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

	constructor(behaviors, name, show, events) {
		this.element = Obj.createElement({ id: name, classList: ["Tabs-Tab"], events: events })
		if (behaviors&Tabs.TabClose) {
			Obj.createElement({ parent: this.element, classList: ["Tabs-Tab-Close"],
				events: {"click": console.log(this)} })
		}
		this.element.append(name)
		this.show = show
		this.state = 0
		this.isChanged = false
	}
}

export class Tabs {
	// Behaviors
	static TabNew = 0x01
	static TabRename = 0x02
	static TabClose = 0x08
	static TabMove = 0x10

	constructor(kvargs=[]) {
		this.behaviors = kvargs.behaviors || 0
		this.parent = kvargs.parent
		this.tabs = []
		this.tab = null
	}

	getTab(tab) {
		if (typeof tab === "number") {
			tab = this.tabs[tab]
		} else if (typeof tab === "string") {
			tab = this[tab] }
		return tab
	}

	addTab(name, show, after) {
		const tab = new Tab(this.behaviors, name, show, {"click": evn => this.toggle(tab)})
		if (after) {
			if (typeof after !== "number") {
				after = this.tabs.indexOf(this.getTab(after)) }
			this.tabs.splice(after, 0, tab)
		} else {
			this.tabs.push(tab) }
		this[name] = tab
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
		tab = this.getTab(tab)
		if (this.tab) {
			this.tab.state = 0 }
		tab.state = 1
		while (this.bodyElement.firstChild) {
			this.bodyElement.lastChild.remove() }
		tab.show(this.bodyElement)
		this.tab = tab
	}

	show() {
		if (!this.element) {
			this.element = Obj.createElement({ parent: this.parent, classList: ["Tabs"] })
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
