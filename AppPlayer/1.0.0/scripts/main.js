import { App } from "../../../lib/1.0.0/App.js"


export class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
  }

  show() {
    super.show()
  }

  hide() {
    super.hide()
  }
}


window.addEventListener("load", async () => {
  new Application({ parent: document.body, className: "Player" })
})
