import { Widget } from "../../../../import/front/scripts/system.js"

//******************************************************************************
export class Application extends Widget {
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
  new Application({ parent: document.body, className: "Calculator" })
})
