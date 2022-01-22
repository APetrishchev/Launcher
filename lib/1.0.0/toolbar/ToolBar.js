import { Obj } from "../Obj.js"

export class ToolBar extends Obj {
	constructor(kvargs) {
		kvargs.classList = ["ToolBar"]
		super(kvargs)
		this.items = []
		if (kvargs.toolSetIds) {
			for (const id of kvargs.toolSetIds) {
				this.addToolSet({ id: id }) }
		}
	}

	addToolSet(kvargs) {
		const toolSet = new ToolSet({ parent: this, id: kvargs.id })
		this.items.push(toolSet)
		this[kvargs.id] = toolSet
		return toolSet
	}

	show() {
		super.show()
		for (const item of this.items) {
			Obj.append(this, item)
		}
	}
}


class ToolSet extends Obj {
	constructor(kvargs) {
		kvargs.classList = ["ToolSet"]
		super(kvargs)
		this.items = []
		if (kvargs.tools) {
			for (const tool of kvargs.tools) {
				this.addTool(tool) }
		}
	}

	addTool(tool) {
		this.items.push(tool)
		this[tool.id] = tool
		return tool
	}

	show() {
		super.show()
		for (const item of this.items) {
			Obj.append(this, item)	}
	}
}
