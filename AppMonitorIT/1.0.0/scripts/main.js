import { Obj } from "../../../lib/Obj.js"
import { App } from "../../../lib/App.js"
import { wait, units } from "../../../lib/etc.js"
import { Form } from "../../../lib/form/Form.js"
import { Table } from "../../../lib/table/Table.js"
import { ProgressBar } from "../../../lib/progressbar/ProgressBar.js"
import { Gauge } from "../../../lib/gauge/Gauge.js"

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
      id: "MonitorIT",
      title: "IT-Мониторинг",
      parent: document.body,
      behaviors: Table.SaveButton|Table.CanselButton|Table.RowAdd|Table.RowDelete,
      className: "Table",
      tabs: [
        {
          id: "Networks",
          name: "Networks",
          columns: [{
              id: "Name",
              name: "Name",
              data: "name"
            },
            {
              id: "Network",
              name: "Network",
              data: "network"
            },
            {
              id: "Gateway",
              name: "Gateway",
              data: "gateway"
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
        },
        {
          id: "Nodes",
          name: "Nodes",
          columns: [{
              id: "Name",
              name: "Name",
              data: "name"
            },
            {
              id: "OS",
              name: "OS",
              data: "osName"
            },
            {
              id: "Auth",
              name: "Auth",
              data: "auth"
            },
            {
              id: "Agent",
              name: "Agent",
              data: "agent"
            },
            {
              id: "IPs",
              name: "IPs",
              data: "addresses"
            },
            {
              id: "Description",
              name: "Description",
              data: "description"
            },
          ]
        }
      ]
    })
    table.show()
    table.toggle("Networks")
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
