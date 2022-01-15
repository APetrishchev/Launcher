import { Obj } from "../Obj.js"
import { Form } from "../form/Form.js"
import { Tabs } from "../tabs/Tabs.js"
import { Button } from "../button/Button.js"
import { ToolBar } from "../toolbar/ToolBar.js"
import { Spoiler } from "../spoiler/Spoiler.js"

const Order = {None: 0, Asc: 1, Desc: 2}
const dataTimeout = 15000

export class Table extends Form {
	static SaveButton = Form.SaveButton
	static CanselButton = Form.CanselButton
	static RowDelete = 0x4
	static RowAdd = 0x8

	// static _addColumn(param1, className, tagName="div") {
	// 	// this - row
	// 	let elm
	// 	if (param1 instanceof HTMLElement) {
	// 		elm = param1
	// 	} else {
	// 		elm = document.createElement(tagName)
	// 		elm.className = `table-field${className ? " " + className : ""}`
	// 		if (param1) {
	// 			elm.append(param1) }
	// 	}
	// 	this.append(elm)
	// 	return elm
	// }

  // getChecked(tab, kvargs) {
	// 	const first = kvargs?.first || false
	// 	const checked = []
	// 	for (const row of tab.rows) {
	// 		if (row.children[0].checked) {
	// 			if (first) {
	// 				return [row]
	// 			} else {
	// 				checked.push(row)	}
	// 		}
	// 	}
	// 	return checked
  // }

	// _addRow(tab) {
	// 	const elm = document.createElement("div")
	// 	elm.className = "table-row"
	// 	tab.rows.push(elm)
	// 	elm.addColumn = Table._addColumn.bind(elm)
	// 	if (this.behaviors&Table.RowDelete) {
	// 		const checkBox = elm.addColumn(null, null, "input")
	// 		checkBox.type = "checkbox"
	// 		checkBox.onchange = () => {
	// 			if (checkBox.checked) {
	// 				this.toolBar.mainSet.deleteButton.disabled = 0
	// 			} else {
	// 				this.toolBar.mainSet.deleteButton.disabled = this.getChecked(tab, {first: true}).length ? 0 : 1
	// 			}
	// 		}
	// 	}
	// 	return elm
	// }

	constructor (kvargs) {
		super(kvargs)
		this.behaviors = kvargs.behaviors || 0
		if (this.behaviors & Table.RowAdd || this.behaviors & Table.RowDelete) {
			this.toolBar = new ToolBar({ parent: this })
			const toolSet = this.toolBar.addToolSet("mainToolSet")
			if (this.behaviors & Table.RowDelete) {
				const btn = document.createElement("button")
				btn.id = "deleteButton"
				btn.className = "button deleteButton"
				btn.disabled = 1
				btn.addEventListener("click", (evn) => {
					evn.preventDefault()
					btn.disabled = 1
					// this.#deleteRows()
				})
				toolSet.addTool(btn)
			}
			// 	if (this.behaviors&Table.RowAdd) {
			// 		const btn = document.createElement("button")
			// 		btn.className = "button addButton"
			// 		btn.addEventListener("click", async evn => {
			// 			evn.preventDefault()
			// 			await this.#addNewRow()
			// 		})
			// 		toolSet.add("addButton", btn)
			// 	}
		}
		this.tabs = new Tabs()
		if (kvargs.tabs) {
			for (const tab of kvargs.tabs) {
				this.addTab(tab) }
		}
	}

	addTab(kvargs) {
		const tab = this.tabs.addTab(kvargs)
		tab.orderBy = kvargs.orderBy
		tab.columns = kvargs.columns || []
		tab.rows = null
		tab.footers = []
		tab.updated = null
		this.tabs.tab = tab
		if (kvargs.rows) {
			for (const row of kvargs.rows) {
				this.addRow(row) }
		}
		// tab.addRow = () => this._addRow(tab)
		tab.show = this.#tabShow.bind(this)
		return tab
	}

	toggle(tab) {
		this.tabs.tab = tab
	// 	if (this.behaviors&Table.RowDelete) {
	// 		this.toolBar.mainSet.deleteButton.disabled = this.getChecked(this.tabs.tab, {first: true}).length ? 0 : 1	}
	// 	this.show()
	}

// 	async #tabShow() {
	#tabShow() {
		this.#tabHide()
		const columnsElement = Obj.createElement({
			parent: this.tabs.bodyElement,
			classList: ["Table-Columns"]
		})
		if (this.behaviors & Table.RowDelete) {
			Obj.createElement({
				parent: columnsElement,
				id: `Table${this.id}-ColumnCheckBox`,
				classList: ["Table-Column", "Table-ColumnCheckBox"],
				children: "\xa0"
			})
		}
		for (const column of this.tabs.tab.columns) {
			if (column.order) {
				const order = this.tabs.tab.orderBy[0] === column.id ? this.tabs.tab.orderBy[1] : 0
				const ascElement = Obj.createElement({ classList: ["Table-Column-Order-Asc"], disabled: order === Order.Asc ? 0 : 1 })
				const descElement = Obj.createElement({	classList: ["Table-Column-Order-Desc"], disabled:  order === Order.Desc ? 0 : 1 })
				const columnButton = new Button({
					parent: columnsElement,
					id: `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`,
					classList: ["Table-Column", `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`],
					tips: column.name,
					events: {click: (evn) => {
						if (this.tabs.tab.orderBy[0] !== column.id) {
							ascElement.setAttribute("disabled", "disabled")
							descElement.setAttribute("disabled", "disabled")
							this.tabs.tab.orderBy = [column.id, Order.None]
						}
						if (this.tabs.tab.orderBy[1] === Order.None) {
							this.tabs.tab.orderBy[1] = Order.Desc
							ascElement.setAttribute("disabled", "disabled")
							descElement.removeAttribute("disabled")
						} else if (this.tabs.tab.orderBy[1] === Order.Desc) {
							this.tabs.tab.orderBy[1] = Order.Asc
							ascElement.removeAttribute("disabled")
							descElement.setAttribute("disabled", "disabled")
						} else if (this.tabs.tab.orderBy[1] === Order.Asc) {
							this.tabs.tab.orderBy[1] = Order.None
							ascElement.setAttribute("disabled", "disabled")
							descElement.setAttribute("disabled", "disabled")
						}
// 						await this.#tabShow()
						this.#tabShow()
						console.log("######", this.tabs.tab.orderBy)
					}}
				}).show()
				Obj.createElement({
					parent: columnButton,
					classList: ["Table-Column-Order"],
					children: [ascElement, descElement]
				})
				Obj.createElement({
					parent: columnButton,
					classList: ["Table-Column-Name"],
					children: column.name
				})
			} else {
				Obj.createElement({
					parent: columnsElement,
					id: `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`,
					classList: ["Table-Column", `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`],
					children: column.name,
					tips: column.name
				})
			}
		}
		// this.toolBar.show()
		// this.toolBar.mainToolSet.show()
		if (this.tabs.tab.update) {
// 			await this.tabs.tab.update() }
			this.tabs.tab.update() }
		let rows = this.tabs.tab.rows
		if (this.tabs.tab.orderBy[1]) {
			rows = rows.sort((a, b) => {
				if (this.tabs.tab.orderBy[1] === Order.Desc) {
					if (a.name > b.name) { return 1 }
					if (a.name < b.name) {return -1 }
					return 0
				} else if (this.tabs.tab.orderBy[1] === Order.Asc) {
					if (a.name < b.name) { return 1 }
					if (a.name > b.name) { return -1 }
					return 0
				}
			})
		}
console.log(rows)
		for (const row of rows) {
			const rowElement = Obj.createElement({
				parent: this.tabs.bodyElement,
				classList: ["Table-Row"]
			})
			if (this.behaviors & Table.RowDelete) {
				Obj.createElement({
					parent: rowElement,
					id: `Table-ColumnCheckBox`,
					classList: ["Table-Cell", "Table-ColumnCheckBox"],
					children: "\xa0"
				})
			}
			if (row.spoiler) {
				const spoiler = new Spoiler({
					parent: rowElement,
					id: `Table-RowSpoiler`,
					classList: ["Table-Cell", "Table-RowSpoiler", "Spoiler"]
				})
				spoiler.toggle = () => {
					if (spoiler.expanded) {
						row.spoilerBodyElement = Obj.createElement({
							id: "SpoilerBody",
							classList: ["Table-SpoilerBody"]
						})
						rowElement.after(row.spoilerBodyElement)
						row.spoiler.parent = row.spoilerBodyElement
						row.spoiler.show()
					} else {
						row.spoiler.hide()
						row.spoilerBodyElement.remove()
						delete row.spoilerBodyElement
					}
				}
				spoiler.show()
			}
			for (const column of this.tabs.tab.columns) {
				Obj.createElement({
					parent: rowElement,
					classList: ["Table-Cell", `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`],
					children: row[column.data],
					tips: row[column.data]
				})
			}
		}
		const footersElement = Obj.createElement({
			parent: this.tabs.bodyElement,
			className: "Table-Footers"
		})
		for (const footer of this.tabs.tab.footers) {
			footersElement.append(footer)
		}
	}

	#tabHide() {
		Obj.clearElement(this.tabs.bodyElement)
	}

	clearData(tab) {
		const clearTimer = () => {
			window.clearTimeout(tab.dataTimeoutTimer)
			tab.dataTimeoutTimer = null
		}
		if (tab.dataTimeoutTimer) {
			clearTimer() }
		tab.dataTimeoutTimer = window.setTimeout(
			() => {
                clearTimer()
				tab.rows = null
			},
			dataTimeout
		)
		tab.updated = new Date()
		console.log(`The Tab ${tab.id} is updated at ${tab.updated}`)
	}

	addColumn(column) {
		this.tabs.tab.columns.push(column)
	}

	addRow(row) {
		this.tabs.tab.rows.push(row)
	}

	addFooter(footer) {
		this.tabs.tab.footers.push(footer)
	}

	// deleteRow(row) {
	// 	this.tabs.tab.rows.splice(this.tabs.tab.rows.indexOf(row), 1)
	// 	if (this.isDisplayed) {
	// 		row.remove() }
	// }

	// async #addNewRow() {
	// 	this.toolBar.hide()
	// 	const newRowElement = document.createElement("div")
	// 	newRowElement.className = "new-row"
	// 	this.toolBar.element.append(newRowElement)
	// 	await this.addNewRow(newRowElement)
	// 	let btn = document.createElement("Button")
	// 	btn.className = "button saveButton"
	// 	btn.addEventListener("click", evn => {
	// 		evn.preventDefault()
	// 		const row = this.saveNewRow(newRowElement)
	// 		if (row) {
	// 			newRowElement.remove()
	// 			this.bodyElement.append(row)
	// 			this.toolBar.show("mainSet")
	// 		}
	// 	})
	// 	newRowElement.append(btn)

	// 	btn = document.createElement("Button")
	// 	btn.className = "button canselButton"
	// 	btn.addEventListener("click", evn => {
	// 		evn.preventDefault()
	// 		newRowElement.remove()
	// 		this.toolBar.show("mainSet")
	// 	})
	// 	newRowElement.append(btn)
	// }

	// #deleteRows() {
	// 	const checked = this.getChecked(this.tabs.tab)
	// 	if (checked.length > 0 && this.deleteRows(checked)) {
	// 		checked.forEach(row => this.deleteRow(row)) }
	// }

	async show() {
		super.show()
		this.tabs.parent = this.element
		this.tabs.show()
	}

}
