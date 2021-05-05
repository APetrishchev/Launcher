import {MyWidget} from "./widget.js"

window.addEventListener("load", () => {
  new MyWidget({ parent: document.body })
})
