class Table extends Tabs {
	static RowDelete = 1
	static RowAdd = 2

	static _addColumn(param1, className, tagName="div") {
		// this - row
		let elm
		if (param1 instanceof HTMLElement) {
			elm = param1
		} else {
			elm = document.createElement(tagName)
			elm.className = `table-field${className ? " " + className : ""}`
			if (param1) {
				elm.append(param1) }
		}
		this.append(elm)
		return elm
	}

  getChecked(tab, kvargs) {
  	const first = kvargs?.first || false
		const checked = []
		for (const row of tab.rows) {
			if (row.children[0].checked) {
				if (first) {
					return [row]
				} else {
					checked.push(row)	}
			}
		}
		return checked
  }

	_addRow(tab) {
		const elm = document.createElement("div")
		elm.className = "table-row"
		tab.rows.push(elm)
		elm.addColumn = Table._addColumn.bind(elm)
		if (this.behaviors&Table.RowDelete) {
			const checkBox = elm.addColumn(null, null, "input")
			checkBox.type = "checkbox"
			checkBox.onchange = () => {
				if (checkBox.checked) {
					this.toolBar.mainSet.deleteButton.disabled = 0
				} else {
					this.toolBar.mainSet.deleteButton.disabled = this.getChecked(tab, {first: true}).length ? 0 : 1
				}
			}
		}
		return elm
	}

	constructor (parent, behaviors) {
		super(parent)
		this.behaviors = behaviors
		if (this.behaviors) {
			this.toolBar = new ToolBar(this)
			this.addMainTollSet()
		}
	}

	addTab(name) {
		const tab = super.addTab(name)
		tab.headers = []
		tab.rows = []
		tab.footers = []
		tab.addRow = () => this._addRow(tab)
		return tab
	}

	toggle(tab) {
		super.toggle(tab)
		if (this.behaviors&Table.RowDelete) {
			this.toolBar.mainSet.deleteButton.disabled = this.getChecked(this.tab, {first: true}).length ? 0 : 1	}
		this.show()
	}

	addHeader(text, className) {
		const elm = document.createElement("div")
		elm.className = `table-header${className ? " " + className : ""}`
		elm.append(text)
		this.tab.headers.push(elm)
	}

	addFooter(text, className) {
		const elm = document.createElement("div")
		elm.className = `table-footer${className ? " " + className : ""}`
		elm.append(text)
		this.tab.footers.push(elm)
	}

	deleteRow(row) {
		this.tab.rows.splice(this.tab.rows.indexOf(row), 1)
		if (this.isDisplayed) {
			row.remove() }
	}

	async #addNewRow() {
		this.toolBar.hide()
		const newRowElement = document.createElement("div")
		newRowElement.className = "new-row"
		this.toolBar.element.append(newRowElement)
		await this.addNewRow(newRowElement)
		let btn = document.createElement("Button")
		btn.className = "button saveButton"
		btn.addEventListener("click", evn => {
			evn.preventDefault()
			const row = this.saveNewRow(newRowElement)
			if (row) {
				newRowElement.remove()
				this.bodyElement.append(row)
				this.toolBar.show("mainSet")
			}
		})
		newRowElement.append(btn)

		btn = document.createElement("Button")
		btn.className = "button canselButton"
		btn.addEventListener("click", evn => {
			evn.preventDefault()
			newRowElement.remove()
			this.toolBar.show("mainSet")
		})
		newRowElement.append(btn)
	}

	#deleteRows() {
		const checked = this.getChecked(this.tab)
		if (checked.length > 0 && this.deleteRows(checked)) {
			checked.forEach(row => this.deleteRow(row)) }
	}

	async addMainTollSet() {
		const toolSet = this.toolBar.addToolSet("mainSet")
		if (this.behaviors&Table.RowDelete) {
			const btn = document.createElement("button")
			btn.className = "button deleteButton"
			btn.disabled = 1
			btn.addEventListener("click", (evn) => {
				evn.preventDefault()
				btn.disabled = 1
				this.#deleteRows()
			})
			toolSet.add("deleteButton", btn)
		}
		if (this.behaviors&Table.RowAdd) {
			const btn = document.createElement("button")
			btn.className = "button addButton"
			btn.addEventListener("click", async evn => {
				evn.preventDefault()
				await this.#addNewRow()
			})
			toolSet.add("addButton", btn)
		}
	}

	async show() {
		super.show()
		if (!this.tableElement) {
			this.tableElement = document.createElement("div")
			this.tableElement.className = "table"
			this.parent.append(this.tableElement)
			this.headersElement = document.createElement("div")
			this.headersElement.className = "table-headers"
			this.tableElement.append(this.headersElement)
			this.toolBar?.show("mainSet")
			this.bodyElement = document.createElement("div")
			this.bodyElement.className = "table-body"
			this.tableElement.append(this.bodyElement)
			this.footersElement = document.createElement("div")
			this.footersElement.className = "table-footers"
			this.tableElement.append(this.footersElement)
		} else {
			while (this.headersElement.firstChild) {
				this.headersElement.removeChild(this.headersElement.lastChild) }
			while (this.bodyElement.firstChild) {
				this.bodyElement.removeChild(this.bodyElement.lastChild) }
			while (this.footersElement.firstChild) {
				this.footersElement.removeChild(this.footersElement.lastChild) }
		}
		for (const header of this.tab.headers) {
			this.headersElement.append(header) }
		for (const row of this.tab.rows) {
			this.bodyElement.append(row) }
		for (const footer of this.tab.footers) {
			this.footersElement.append(footer) }
	}
}
