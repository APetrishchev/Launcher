class ToolBar {
	constructor(parent) {
		this.parent = parent
		this.items = []
	}

	addToolSet(name) {
		const toolSet = new ToolSet(this)
		this.items.push(toolSet)
		this[name] = toolSet
		return toolSet
	}

	show(name) {
		if (!this.element) {
			this.element = document.createElement("div")
			this.element.className = "toolbar"
			this.parent.tableElement.append(this.element) // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		} else {
			this.hide() }
		for (const item of this[name].items) {
			this.element.append(item) }
	}

	hide() {
		while (this.element.firstChild) {
		  this.element.removeChild(this.element.lastChild) }
	}
}


class ToolSet {
	constructor(toolbar) {
		this.toolbar = toolbar
		this.items = []
	}

	add(name, item) {
		this.items.push(item)
		this[name] = item
		if (this.toolbar.element) {
			this.toolbar.element.append(item) }
	}
}
