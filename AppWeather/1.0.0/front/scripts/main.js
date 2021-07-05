import { App, Obj } from "../../../../Application/1.0.0/front/scripts/system.js"

//******************************************************************************
export class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    this.parent = kvargs.parent
    this.className = kvargs.
  }

  show() {
    super.show()
  }

  hide() {
    super.hide()
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body, className: "Weather" })
})
