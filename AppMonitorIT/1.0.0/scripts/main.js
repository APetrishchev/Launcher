import { Obj } from "../../../import/scripts/Obj.js"
import { App } from "../../../import/scripts/App.js"
import { Form } from "../../../import/scripts/Form.js"
import { ProgressBar } from "../../../import/scripts/ProgressBar.js"
import { Gauge } from "../../../import/scripts/Gauge.js"
import { wait, units } from "../../../import/scripts/etc.js"

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
