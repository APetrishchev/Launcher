import { App, Obj } from "../../../../Laucher/1.0.0/front/scripts/system.js"

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
