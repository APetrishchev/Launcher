import { Obj } from "../../../lib/scripts/Obj.js"
import { App } from "../../../lib/scripts/App.js"
import { Form } from "../../../lib/scripts/Form.js"
import { ProgressBar } from "../../../lib/scripts/ProgressBar.js"
import { Gauge } from "../../../lib/scripts/Gauge.js"
import { wait, units } from "../../../lib/scripts/etc.js"

//******************************************************************************
export class Application extends App {
  static async getInstance(kvargs) {
    const instance = new Application(kvargs)
    await instance.show()
  }

  constructor(kvargs) {
    super(kvargs)
    this.classList = ["MonitorIT"]
  }

  async show() {
    super.show()
  }

  async update() {
  }

  hide() {
    super.hide()
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  await Application.getInstance({ parent: document.body })
})
