import { App } from "../../../import/scripts/App.js"
import { Obj } from "../../../import/scripts/Obj.js"
import { Button } from "../../../import/scripts/Button.js"

//******************************************************************************
class Display extends Obj {
  get value() {
    return this.editableElement?.innerText
  }

  set value(key) {
    if (("0" <= key && key <= "9") || key === ".") {
      if (!this.numberElement) {
        this.numberElement = Obj.createElement({
          tagName: "span",
          parent: this.editableElement,
          classList: [`${this.classList}-Number`],
          events: [{
            click: (evn, obj) => console.log(obj.innerText)
          }]
        })
      }
      if (key === "." && this.numberElement.innerText.includes(".")) {
        return }
      this.numberElement.innerText += key
      this.numberSystem(parseInt(this.numberElement.innerText))
    } else {
      delete this.numberElement
      this.editableElement.append(key)
    }
  }

  constructor(kvargs = {}) {
    super(kvargs)
    this.show()
    this.historyElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-History`],
    })
    const inputElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-Input`],
    })
    this.errorElement = Obj.createElement({
      parent: inputElement,
      classList: [`${this.classList}-Error`],
    })
    this.editableElement = Obj.createElement({
      parent: inputElement,
      classList: [`${this.classList}-Editable`],
      placeholder: "0",
      children: this.value
    })
    this.editableElement.setAttribute("contenteditable", "true")
    this.numBinElement = Obj.createElement({
      classList: [`${this.classList}-NumberSystem-Bin`],
      children: "0"
    })
    this.numDecElement = Obj.createElement({
      classList: [`${this.classList}-NumberSystem-Dec`],
      children: "0"
    })
    this.numHexElement = Obj.createElement({
      classList: [`${this.classList}-NumberSystem-Hex`],
      children: "0"
    })
    Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-NumberSystem`],
      children: [this.numBinElement, this.numDecElement, this.numHexElement]
    })
  }

  numberSystem(num) {
    this.numBinElement.innerText = num.toString(2).toUpperCase()
    this.numDecElement.innerText = num.toString(10).toUpperCase()
    this.numHexElement.innerText = num.toString(16).toUpperCase()
  }

  operation(opr) {
    if (opr === "OpClr") {
      this.editableElement.innerText = ""
      this.numberSystem(0)
    } else if (opr === "OpEqu") {
      this.compute()
    } else if (opr === "OpBack") {
      if (this.editableElement.lastChild instanceof HTMLElement) {
        this.editableElement.lastChild.innerText = this.editableElement.lastChild.innerText.slice(0, -1)
        if (this.editableElement.lastChild.innerText.length === 0) {
          this.editableElement.lastChild.remove() }
        this.numberSystem(parseInt(this.editableElement.lastChild.innerText))
      } else {
        this.editableElement.lastChild.remove() }
    } else if (opr === "OpLPrnth") {
      this.value = "("
    } else if (opr === "OpRPrnth") {
      this.value = ")"
    } else if (this.editableElement.lastChild) {
      if (["*", "/", "+", "-"].includes(this.editableElement.lastChild.textContent)) {
        this.editableElement.lastChild.remove() }
      if (opr === "OpMul") {
        this.value = "*"
      } else if (opr === "OpDiv") {
        this.value = "/"
      } else if (opr === "OpAdd") {
        this.value = "+"
      } else if (opr === "OpSub") {
        this.value = "-"
      }
    }
  }

  compute() {
    try {
      const result = eval(this.editableElement.textContent)
      this.editableElement.append("=")
      Obj.createElement({
        tagName: "span",
        parent: this.editableElement,
        classList: [`${this.classList}-Number`],
        children: result,
        events: [{
          click: (evn, obj) => console.log(obj.innerText)
        }]
      })
      Obj.createElement({
        parent: this.historyElement,
        classList: [`${this.classList}-History-Row`]
      }).innerHTML = this.editableElement.innerHTML
      this.errorElement.innerText = ""
      this.editableElement.innerText = result
      this.numberSystem(result)
      delete this.numberElement
    } catch(err) {
      this.errorElement.innerText = "Err" }
console.log(this.editableElement.textContent)
  }
}

//******************************************************************************
export class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    this.show()
  }

  show() {
    const keys = {
      "Key0": "0", "Key1": "1", "Key2": "2", "Key3": "3", "Key4": "4",
      "Key5": "5", "Key6": "6", "Key7": "7", "Key8": "8", "Key9": "9",
      "KeyA": "A", "KeyB": "B", "KeyC": "C", "KeyD": "D", "KeyE": "E",
      "KeyF": "F", "KeyPoint": ".", "OpMinus": "±", "OpLPrnth": "(", "OpRPrnth": ")",
      "OpDiv": "÷", "OpMul": "×", "OpSub": "-", "OpAdd": "+",
      "OpAND": "AND", "OpOR": "OR", "OpXOR": "XOR", "OpNOT": "NOT", "OpLSh": "<<",
      "OpRSh": ">>", "OpSqr": "Sqr", "OpSqu": "q", "OpEqu": "=", "OpBack": "Bck",
      "OpClr": "Clr"
    }
    const programmer = [
      ["OpLPrnth"  ,"OpRPrnth"  ,"OpBack" ,"OpClr" , ""      ,""    ],
      ["OpAND"     ,"OpOR"      ,"OpXOR"  ,"OpNOT" ,"OpLSh" ,"OpRSh"],
      ["KeyC"      ,"KeyD"      ,"KeyE"   ,"KeyF"  ,"OpDiv" ,"OpSqr"],
      ["Key8"      ,"Key9"      ,"KeyA"   ,"KeyB"  ,"OpMul" ,"OpSqu"],
      ["Key4"      ,"Key5"      ,"Key6"   ,"Key7"  ,"OpSub" ,""     ],
      ["Key0"      ,"Key1"      ,"Key2"   ,"Key3"  ,"OpAdd" ,""     ],
      ["KeyPoint"  ,"OpMinus"   ,"OpEqu"  ,""      ,""      ,""     ],
    ]
    const layout = programmer
    super.show()
    Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}`],
      children: "ordinary financical programmer"
    })
    this.display = new Display({
      parent: this.element,
      classList: [`${this.classList}-Display`],
    })
    const numberSystemsElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-NumSys`],
    })
    numberSystemsElement.innerHTML = `<input type="radio" name="NumSys" value="2">Bin</input> ` +
      `<input type="radio" name="NumSys" value="10" checked>Dec</input> ` +
      `<input type="radio" name="NumSys" value="16">Hex</input>`
    for (let row = 0; row < layout.length; row++) {
      const rowElement = Obj.createElement({
        parent: this.element,
        classList: [`${this.classList}-Digits-Row`]
      })
      for (let col = 0; col < layout[row].length; col++) {
        if (layout[row][col]) {
          const btn = new Button({
            id: layout[row][col],
            parent: rowElement,
            classList: [`${this.classList}-Digits-Button`],
            children: keys[layout[row][col]],
            events: [{
              click: this.onKeyPress.bind(this)
            }]
          })
          btn.show()
        } else {
          Obj.createElement({
            parent: rowElement,
            classList: [`${this.classList}-Digits-Button`],
          })
        }
      }
    }
  }

  hide() {
    super.hide()
  }

  onKeyPress(evn, btn) {
    if (btn.id.startsWith("Key")) {
      this.display.value = btn.element.innerText
    } else {
      this.display.operation(btn.id) }
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body, classList: ["Calculator"] })
})
