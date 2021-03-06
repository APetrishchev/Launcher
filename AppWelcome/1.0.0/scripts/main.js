import { App } from "../../../lib/1.0.0/app.js"


export class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    this.parent = kvargs.parent
    this.className = kvargs.className
  }

  show() {
    super.show()
  }

  hide() {
    super.hide()
  }
}


window.addEventListener("load", async () => {
  new Application({ parent: document.body, className: "Weather" })
})
