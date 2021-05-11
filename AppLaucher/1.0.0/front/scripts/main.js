import { Init, Widget } from "../../../../import/front/scripts/system.js"
import { applications } from "../../../../applications.js"

//******************************************************************************
class Application extends Widget {
  constructor(kvargs = {}) {
    super(kvargs)
    new Init()
    super.show()
    for (const [app, ver] of applications.currentVersion) {
      let layout = Widget.createElement({ parent: this.element })
      let btn = new Image()
      layout.appendChild(btn)
      btn.className = `${this.className}-RunAppButton`
      btn.id = app
      btn.width = parseInt(btn.clientWidth)
      btn.height = parseInt(btn.clientHeight)
      btn.src = applications.applications[app][ver].picture
      btn.onclick = (evn) => {
        if (!applications.applications[app][ver].window) {
          applications.applications[app][ver].window = window.open(
            `${location.origin}/${applications.applications[app][ver].path}/front/index.html`,
            "_blank", "left=100,top=100,width=520,height=480")
          let timer = setInterval(() => {
            if (applications.applications[app][ver].window.closed) {
              delete applications.applications[app][ver].window
              clearInterval(timer)
            }
          }, 500)
        }
        else {
          applications.applications[app][ver].window.focus()}
      }
      let title = Widget.createElement({ parent: layout })
      title.innerHTML = app
    }
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body, className: "Laucher" })
})
