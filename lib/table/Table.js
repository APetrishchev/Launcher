import { Obj } from "../Obj.js"
import { Form } from "../form/Form.js"
import { Tabs } from "../tabs/Tabs.js"
import { Spoiler } from "../spoiler/Spoiler.js"

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
			// this.toolBar = new ToolBar(this)
			// this.addMainTollSet()
		}
		this.tabs = new Tabs()
		if (kvargs.tabs) {
			for (const tab of kvargs.tabs) {
				this.addTab(tab)
			}
		}
	}

	addTab(kvargs) {
		const tab = this.tabs.addTab(kvargs)
		tab.columns = kvargs.columns || []
		tab.rows = []
		tab.footers = []
		// tab.addRow = () => this._addRow(tab)
		this.tabs.tab = tab
		tab.show = this.#tabShow.bind(this)
		return tab
	}

	toggle(tab) {
		this.tabs.tab = tab
	// 	if (this.behaviors&Table.RowDelete) {
	// 		this.toolBar.mainSet.deleteButton.disabled = this.getChecked(this.tabs.tab, {first: true}).length ? 0 : 1	}
	// 	this.show()
	}

	#tabShow() {
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
			Obj.createElement({
				parent: columnsElement,
				id: `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`,
				classList: ["Table-Column", `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`],
				children: column.name+" ^"
			})
		}
		// 		this.toolBar?.show("mainSet")
		this.#tabUpdate()
		for (const row of this.tabs.tab.rows) {
			const rowElement = Obj.createElement({ parent: this.tabs.bodyElement,
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
						row.spoilerBodyElement = Obj.createElement()
						rowElement.after(row.spoilerBodyElement)
						row.spoiler.parent = row.spoilerBodyElement
						row.spoiler.show()
					}	else {
						row.spoiler.hide()
						row.spoilerBodyElement.remove()
						delete row.spoilerBodyElement
					}
				}
				spoiler.show()
			}
			for (const column of this.tabs.tab.columns) {
				Obj.createElement({	parent: rowElement,
					classList: ["Table-Cell", `Table${this.id}-Tab${this.tabs.tab.id}-Column${column.id}`],
					children: row[column.data]
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

	#tabUpdate() {
		if (this.tabs.tab.id === "Networks") {
			this.addRow({
				name: "172.28.141.0/24",
				network: "172.28.141.0/24",
				gateway: "172.28.141.249",
				disabled: 0,
				description: "",
				spoiler: new Table({
					id: "Addresses",
					behaviors: Table.RowAdd | Table.RowDelete,
					className: "Table",
					tabs: [{
						id: "Addresses",
						name: "Addresses",
						columns: [
							{
								id: "Ip",
								name: "IP",
								data: "ip"
							},
							{
								id: "NodeName",
								name: "NodeName",
								data: "nodeName"
							},
							{
								id: "Avail",
								name: "Avail",
								data: "availabled"
							},
							{
								id: "Connected",
								name: "Connected",
								data: "connected"
							},
							{
								id: "Authorized",
								name: "Authorized",
								data: "authorized"
							},
							{
								id: "LastChange",
								name: "LastChange",
								data: "lastChange"
							},
							{
								id: "Disabled",
								name: "Disabled",
								data: "disabled"
							},
							{
								id: "Description",
								name: "Description",
								data: "description"
							}
						]
					}]
				})
			})
			this.addRow({
				name: "172.28.138.0/24",
				network: "172.28.138.0/24",
				gateway: "172.28.138.249",
				disabled: 0,
				description: "",
				spoiler: true
			})
		}
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

	// async addMainTollSet() {
	// 	const toolSet = this.toolBar.addToolSet("mainSet")
	// 	if (this.behaviors&Table.RowDelete) {
	// 		const btn = document.createElement("button")
	// 		btn.className = "button deleteButton"
	// 		btn.disabled = 1
	// 		btn.addEventListener("click", (evn) => {
	// 			evn.preventDefault()
	// 			btn.disabled = 1
	// 			this.#deleteRows()
	// 		})
	// 		toolSet.add("deleteButton", btn)
	// 	}
	// 	if (this.behaviors&Table.RowAdd) {
	// 		const btn = document.createElement("button")
	// 		btn.className = "button addButton"
	// 		btn.addEventListener("click", async evn => {
	// 			evn.preventDefault()
	// 			await this.#addNewRow()
	// 		})
	// 		toolSet.add("addButton", btn)
	// 	}
	// }

	async show() {
		super.show()
		this.tabs.parent = this.element
		this.tabs.show()
	}

}
