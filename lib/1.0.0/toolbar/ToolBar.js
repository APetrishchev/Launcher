import { Obj } from "../Obj.js"

export class ToolBar extends Obj {
	constructor(kvargs) {
		kvargs.classList = ["ToolBar"]
		super(kvargs)
		this.items = []
	}

	addToolSet(toolSetName) {
		const toolSet = new ToolSet({ parent: this, id: toolSetName })
		this.items.push(toolSet)
		this[toolSetName] = toolSet
		return toolSet
	}
}


class ToolSet extends Obj {
	constructor(kvargs) {
		kvargs.classList = ["ToolSet"]
		super(kvargs)
		this.items = []
	}

	addTool(tool) {
		this.items.push(tool)
		this[tool.id] = tool
		return tool
	}

	show() {
		super.show()
		for (const item of this.items) {
			this.element.append(item)	}
	}
}
