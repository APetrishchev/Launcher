import { App } from "../../../lib/App.js"

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


// 🌑 127761 1F311
// 🌒 127762 1F312
// 🌓 127763 1F313
// 🌔 127764 1F314
// 🌕 127765 1F315
// 🌖 127766 1F316
// 🌗 127767 1F317
// 🌘 127768 1F318
