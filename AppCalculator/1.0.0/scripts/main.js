import { App } from "../../../import/scripts/App.js"
import { Obj } from "../../../import/scripts/Obj.js"
import { Button } from "../../../import/scripts/Button.js"

//******************************************************************************
export class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    this.show()
  }

  get value() {
    return this.displayElement?.innerText || 0
  }

  set value(val) {
    if (this.displayElement.innerText === "0") {
      this.displayElement.innerText = val
    } else {
      this.displayElement.innerText += val
    }
  }
  show() {
    const keys = {
      "Key0": "0", "Key1": "1", "Key2": "2", "Key3": "3", "Key4": "4",
      "Key5": "5", "Key6": "6", "Key7": "7", "Key8": "8", "Key9": "9",
      "KeyA": "A", "KeyB": "B", "KeyC": "C", "KeyD": "D", "KeyE": "E",
      "KeyF": "F", "KeyPoint": ".", "OpMinus": "±", "KeyLPrnth": "(", "KeyRPrnth": ")",
      "OpDiv": "÷", "OpMul": "×", "OpSub": "-", "OpAdd": "+",
      "OpAND": "AND", "OpOR": "OR", "OpXOR": "XOR", "OpNOT": "NOT", "OpLSh": "<<",
      "OpRSh": ">>", "OpSqr": "Sqr", "OpSqu": "q", "OpEqu": "=", "OpBack": "Bck",
      "OpClr": "Clr"
    }
    const programmer = [
      ["KeyLPrnth", "KeyRPrnth", "OpBack", "OpClr"],
      ["OpAND", "OpOR", "OpXOR", "OpNOT", "OpLSh", "OpRSh"],
      ["KeyC", "KeyD", "KeyE", "KeyF", "OpDiv", "OpSqr"],
      ["Key8", "Key9", "KeyA", "KeyB", "OpMul", "OpSqu"],
      ["Key4", "Key5", "Key6", "Key7", "OpSub"],
      ["Key0", "Key1", "Key2", "Key3", "OpAdd"],
      ["KeyPoint", "OpMinus", "OpEqu"],
    ]
    const layout = programmer
    super.show()
    Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}`],
      children: "ordinary financical programmer"
    })
    this.displayElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-Display`],
      children: this.value
    })
    this.displayElement.setAttribute("contenteditable", "true")
    for (let row = 0; row < layout.length; row++) {
      const rowElement = Obj.createElement({ parent: this.element,
        classList: [`${this.classList}-Digits-Row`] })
      for (let col = 0; col < layout[row].length; col++) {
        const btn = new Button({
          id: layout[row][col],
          parent: rowElement,
          classList: [`${this.classList}-Digits-Button`],
          children: keys[layout[row][col]],
          events: [{ click: this.onKeyPress.bind(this) }]
        })
        btn.show()
      }
    }
  }

  hide() {
    super.hide()
  }

  onKeyPress(evn, obj) {
    if (obj.id.startsWith("Key")) {
      this.value = obj.element.innerText
    } else if (obj.id === "OpClr") {
      this.value = "0"
    } else if (obj.id === "OpMul") {
      this.value = ` ${obj.element.innerText} `
    } else if (obj.id === "OpDiv") {
      this.value = ` ${obj.element.innerText} `
    } else if (obj.id === "OpAdd") {
      this.value = ` ${obj.element.innerText} `
    } else if (obj.id === "OpSub") {
      this.value = ` ${obj.element.innerText} `
    }

  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body, classList: ["Calculator"] })
})
