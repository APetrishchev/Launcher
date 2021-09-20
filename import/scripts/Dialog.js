import { Obj } from "./Obj.js"

//******************************************************************************
export class Dialog extends Obj {
  constructor(kvargs = []) {
    console.log(">>> Dialog", document.body)
    kvargs.classList = Obj.classList("Dialog", kvargs.classList)
    kvargs.parent = document.body
    super(kvargs)
    this.show()
    const buttons = []
    for (let idx = 0; idx < kvargs.buttons.length; idx++) {
      const btn = Obj.createElement({ classList: Obj.combine(this.classList, "-Button"),
        children: kvargs.buttons[idx][0], events: [{"click": evn => {
          if (kvargs.buttons[idx][1]) {
            kvargs.buttons[idx][1]() }
          this.element.remove() }
        }]
      })
      buttons.push(btn)
    }
    Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-Title"),
      children: kvargs.title })
    Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-LayoutMessage"),
      children: [
        Obj.createElement({ classList: Obj.combine(this.classList, "-Picture") }),
        Obj.createElement({ classList: Obj.combine(this.classList, "-Message"),
          children: kvargs.msg })
      ]
    })
    Obj.createElement({ parent: this.element, classList: Obj.combine(this.classList, "-LayoutButtons"),
      children: buttons })
  }
}

// //******************************************************************************
// export class Dialog extends Obj {
//   constructor(kvargs = []) {
//     kvargs.classList = Obj.classList("Item", kvargs.classList)
//     super(kvargs)
//     const win = window.open("about:blank", kvargs.title, "left=150,top=100,width=400,height=160")
//     win.opener.__parent__ = kvargs.parent
//     let btnsHTML = ""
//     for (let idx = 0; idx < kvargs.buttons.length; idx++) {
//       btnsHTML += `<div class="Button" onclick="console.log(window.opener.__parent__); ${(kvargs.buttons[idx][1] ? `(${kvargs.buttons[idx][1]})(); ` : "") + 'window.close()"'}>${kvargs.buttons[idx][0]}</div>\n` }
//     win.document.write(`
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <title>${kvargs.title}</title>
//   <link rel="stylesheet" type="text/css" media="screen" href="/Application/1.0.0/front/styles/dialog.css">
// </head>
// <body>
//   <div class="HLayout LayoutMessage">
//     <div class="Picture"></div>
//     <div class="Message">${kvargs.msg}</div>
//   </div>
//   <div class="HLayout LayoutButtons">
//     ${btnsHTML}
//   </div>
// </body>
// </html>
// `   )
//     win.onbeforeunload = evn => {
//     }
//   }
// }
