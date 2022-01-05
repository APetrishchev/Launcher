import { Obj } from "../../../lib/Obj.js"
import { App } from "../../../lib/App.js"
import { wait, units } from "../../../lib/etc.js"
import { Form } from "../../../lib/form/Form.js"
import { Table } from "../../../lib/table/Table.js"
import { ProgressBar } from "../../../lib/progressbar/ProgressBar.js"
import { Gauge } from "../../../lib/gauge/Gauge.js"

class Addresses {
  static async getInstance(table) {
    if (!Addresses.instance) {
      Addresses.instance = new Addresses()
      Addresses.instance.table = table
      await Addresses.instance.show()
    }
    return Addresses.instance
  }

  // async update() {
  //   return await Form.remote("MonitorIT", "Address", "getAddresses")
  // }

  async show() {
    const tab = this.table.addTab({
      id: "Addresses",
      name: "Addresses",
      columns: [{
          id: "Ip",
          header: "IP",
          data: "ip"
        },
        {
          id: "NodeName",
          header: "NodeName",
          data: "nodeName"
        },
        {
          id: "Avail",
          header: "Avail",
          data: "availabled"
        },
        {
          id: "Connected",
          header: "Connected",
          data: "connected"
        },
        {
          id: "Authorized",
          header: "Authorized",
          data: "authorized"
        },
        {
          id: "LastChange",
          header: "LastChange",
          data: "lastChange"
        },
        {
          id: "Disabled",
          header: "Disabled",
          data: "disabled"
        },
        {
          id: "Description",
          header: "Description",
          data: "description"
        },
      ]
    })
    // const results = await this.update()
    // for (const [_, item] of Object.entries(results.results)) {
    //   const row = tab.addRow()
    //   // row.addColumn("network", "addresses")
    //   // row = tab.addRow()
    //   for (const column of tab.columns) {
    //     row.addColumn({
    //       id: `Table${tab.id}-Column${column.id}`,
    //       text: item[column.data]
    //     })
    //   }
    //   // field.onchange = env => this.btnsDisable(0)
    // }
  }
}

class Networks {
  static async getInstance(table) {
    if (!Networks.instance) {
      Networks.instance = new Networks()
      Networks.instance.table = table
      await Networks.instance.show()
    }
    return Networks.instance
  }

  // async update() {
  //   return await Form.remote("MonitorIT", "Network", "getNetworks")
  // }

  async show() {
    const tab = this.table.addTab({
      id: "Networks",
      name: "Networks",
      columns: [{
					id: "Name",
					header: "Name",
					data: "name"
				},
				{
					id: "Network",
					header: "Network",
					data: "network"
				},
				{
					id: "Gateway",
					header: "Gateway",
					data: "gateway"
				},
				{
					id: "Disabled",
					header: "Disabled",
					data: "disabled"
				},
				{
					id: "Description",
					header: "Description",
					data: "description"
				}
			]
    })
    // const results = await this.update()
    // for (const [_, item] of Object.entries(results.results)) {
    //   const row = tab.addRow()
    //   for (const column of columns) {
    //     row.addColumn({
    //       id: `Table${tab.id}-Column${column.id}`,
    //       text: item[column.data]
    //     })
    //   }
    //   // field.onchange = env => this.btnsDisable(0)
    // }
  }
}

class Nodes {
  static async getInstance(table) {
    if (!Nodes.instance) {
      Nodes.instance = new Nodes()
      Nodes.instance.table = table
      await Nodes.instance.show()
    }
    return Nodes.instance
  }

  // async update() {
  //   return await Form.remote("MonitorIT", "Node", "getNodes")
  // }

  async show() {
    const tab = this.table.addTab({
      id: "Nodes",
      name: "Nodes",
      columns: [{
					id: "Name",
					header: "Name",
					data: "name"
				},
				{
					id: "OS",
					header: "OS",
					data: "osName"
				},
				{
					id: "Auth",
					header: "Auth",
					data: "auth"
				},
				{
					id: "Agent",
					header: "Agent",
					data: "agent"
				},
				{
					id: "IPs",
					header: "IPs",
					data: "addresses"
				},
				{
					id: "Description",
					header: "Description",
					data: "description"
				},
      ]
    })
    // const results = await this.update()
    // for (const [_, item] of Object.entries(results.results)) {
    //   const row = tab.addRow()
    //   for (const column of columns) {
    //     row.addColumn({
    //       id: `Table${tab.id}-Column${column.id}`,
    //       text: item[column.data]
    //     })
    //   }
    //   // field.onchange = env => this.btnsDisable(0)
    // }
  }
}

//******************************************************************************
export class Application extends App {
  static async getInstance() {
    const instance = new Application()
    await instance.show()
  }

  constructor(kvargs) {
    super(kvargs)
    this.classList = ["MonitorIT"]
  }

  async show() {
    // super.show()
    const table = new Table({
      title: "IT-Мониторинг",
      parent: document.body,
      behaviors: Table.SaveButton|Table.CanselButton|Table.RowAdd|Table.RowDelete,
      className: "Table"
    })
    await Networks.getInstance(table)
    await Addresses.getInstance(table)
    await Nodes.getInstance(table)
    table.show()
    // table.toggle(0)
}

  async update() {
  }

  hide() {
    super.hide()
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  await Application.getInstance()
})
