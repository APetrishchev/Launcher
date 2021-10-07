import { App } from "../../../import/scripts/App.js"

//******************************************************************************
class Application extends App {
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

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body, className: "AppMngr" })
})