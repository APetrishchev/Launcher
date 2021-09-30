import { App } from "../../../import/scripts/App.js"
import { Obj } from "../../../import/scripts/Obj.js"
import { Button } from "../../../import/scripts/Button.js"

//******************************************************************************
class Display extends Obj {
  get value() {
    return this.editableElement?.innerText
  }

  set value(key) {
    if (("0" <= key && key.toLowerCase() <= "f") || key === ".") {
      if (!this.numberElement) {
        this.numberElement = Obj.createElement({
          tagName: "span",
          parent: this.editableElement,
          classList: [`${this.classList}-Number`],
          events: [{
            click: (evn, obj) => console.log(obj.innerText)
          }]
        })
        if (this.numberSystems?.radix !== 10) {
          Obj.createElement({
            tagName: "sub",
            parent: this.editableElement,
            children: this.numberSystems.radix
          })
        }
      }
      if (key === "." && this.numberElement.innerText.includes(".")) {
        return }
      this.numberElement.innerText += key
      this.numberSystems?.update(this.numberElement.innerText)
    } else {
      delete this.numberElement
      this.editableElement.append(key)
    }
  }

  constructor(kvargs) {
    kvargs.classList = [`${kvargs.classList}-Display`]
    super(kvargs)
    this.show()
    this.numberSystems = kvargs.numberSystems
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
    if (this.numberSystems) {
      this.numberSystems.parent = this.element
      this.numberSystems.show()
      this.numberSystems.onChange.push(radix => {
        if (this.numberElement) {
          this.numberElement.innerText = parseInt(this.numberElement.innerText, this.numberSystems.radix).toString(radix)
        }
      })
    }
  }

  operation(opr) {
    if (opr === "OpClr") {
      this.editableElement.innerText = ""
      this.numberSystems?.update("0")
    } else if (opr === "OpEqu") {
      this.compute()
    } else if (opr === "OpBack") {
      if (this.editableElement.lastChild instanceof HTMLElement) {
        this.editableElement.lastChild.innerText = this.editableElement.lastChild.innerText.slice(0, -1)
        if (this.editableElement.lastChild.innerText.length === 0) {
          this.editableElement.lastChild.remove() }
        this.numberSystems?.update(this.editableElement.lastChild.innerText)
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
      this.numberSystems?.update(result)
      delete this.numberElement
    } catch(err) {
      this.errorElement.innerText = "Err" }
console.log(this.editableElement.textContent)
  }
}

//******************************************************************************
class KeyPad extends Obj {
  constructor(kvargs) {
    super(kvargs)
    this.classList = [`${kvargs.classList}-KeyPad`]
  }

  onClick(evn, btn) {
    if (btn.id.startsWith("Key")) {
      this.display.value = btn.element.innerText
    } else {
      this.display.operation(btn.id) }
  }
}

//******************************************************************************
class ProgrammerCalculator extends KeyPad {
  constructor(kvargs) {
    super(kvargs)
    this.display = new Display({
      parent: kvargs.parent,
      classList: kvargs.classList,
      numberSystems: new NumberSystems({ classList: kvargs.classList })
    })
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
    const layout = [
      ["OpLPrnth"  ,"OpRPrnth"  ,"OpBack"    ,"OpClr"],
      ["OpLSh"     ,"OpRSh"     ,"OpXOR"     ,""     ],
      ["OpAND"     ,"OpOR"      ,"OpNOT"     ,"OpSqr"],
      ["KeyD"      ,"KeyE"      ,"KeyF"      ,"OpSqu"],
      ["KeyA"      ,"KeyB"      ,"KeyC"      ,"OpDiv"],
      ["Key7"      ,"Key8"      ,"Key9"      ,"OpMul"],
      ["Key4"      ,"Key5"      ,"Key6"      ,"OpSub"],
      ["Key1"      ,"Key2"      ,"Key3"      ,"OpAdd"],
      ["OpMinus"   ,"Key0"      ,"KeyPoint"  ,"OpEqu" ]
    ]
    super.show()
    this.display.numberSystems.getControlElement({ parent: this.element, classList: this.classList })
    for (let row = 0; row < layout.length; row++) {
      const rowElement = Obj.createElement({
        parent: this.element,
        classList: [`${this.classList}-Row`]
      })
      for (let col = 0; col < layout[row].length; col++) {
        if (layout[row][col]) {
          const btn = new Button({
            id: layout[row][col],
            parent: rowElement,
            classList: [`${this.classList}-Button`],
            children: keys[layout[row][col]],
            events: [{
              click: this.onClick.bind(this)
            }]
          })
          btn.show()
        } else {
          Obj.createElement({
            parent: rowElement,
            classList: [`${this.classList}-Button`],
          })
        }
      }
    }
    this.keyEnable(this.display.numberSystems.radix)
    this.display.numberSystems.onChange.push(this.keyEnable)
  }

  keyEnable(radix) {
    if (radix === "16") {
      document.querySelector("#Key2").disabled = false
      document.querySelector("#Key3").disabled = false
      document.querySelector("#Key4").disabled = false
      document.querySelector("#Key5").disabled = false
      document.querySelector("#Key6").disabled = false
      document.querySelector("#Key7").disabled = false
      document.querySelector("#Key8").disabled = false
      document.querySelector("#Key9").disabled = false
      document.querySelector("#KeyA").disabled = false
      document.querySelector("#KeyB").disabled = false
      document.querySelector("#KeyC").disabled = false
      document.querySelector("#KeyD").disabled = false
      document.querySelector("#KeyE").disabled = false
      document.querySelector("#KeyF").disabled = false
    } else if (radix === "10") {
      document.querySelector("#Key2").disabled = false
      document.querySelector("#Key3").disabled = false
      document.querySelector("#Key4").disabled = false
      document.querySelector("#Key5").disabled = false
      document.querySelector("#Key6").disabled = false
      document.querySelector("#Key7").disabled = false
      document.querySelector("#Key8").disabled = false
      document.querySelector("#Key9").disabled = false
      document.querySelector("#KeyA").disabled = true
      document.querySelector("#KeyB").disabled = true
      document.querySelector("#KeyC").disabled = true
      document.querySelector("#KeyD").disabled = true
      document.querySelector("#KeyE").disabled = true
      document.querySelector("#KeyF").disabled = true
    } else if (radix === "2") {
      document.querySelector("#Key2").disabled = true
      document.querySelector("#Key3").disabled = true
      document.querySelector("#Key4").disabled = true
      document.querySelector("#Key5").disabled = true
      document.querySelector("#Key6").disabled = true
      document.querySelector("#Key7").disabled = true
      document.querySelector("#Key8").disabled = true
      document.querySelector("#Key9").disabled = true
      document.querySelector("#KeyA").disabled = true
      document.querySelector("#KeyB").disabled = true
      document.querySelector("#KeyC").disabled = true
      document.querySelector("#KeyD").disabled = true
      document.querySelector("#KeyE").disabled = true
      document.querySelector("#KeyF").disabled = true
    }
  }
}

//******************************************************************************
class NumberSystems extends Obj {
  constructor(kvargs) {
    kvargs.classList = [`${kvargs.classList}-NumberSystems`]
    super(kvargs)
    this.radix = 10
    this.onChange = []
  }

  show() {
    super.show()
    let numberSystemElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-NumberSystem`],
    })
    Obj.createElement({
      parent: numberSystemElement,
      classList: [`${this.classList}-NumberSystem-Raddix`],
      children: "Bin"
    })
    this.numBinElement = Obj.createElement({
      parent: numberSystemElement,
      classList: [`${this.classList}-NumberSystem-Number`],
      children: "0"
    })
    numberSystemElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-NumberSystem`],
    })
    Obj.createElement({
      parent: numberSystemElement,
      classList: [`${this.classList}-NumberSystem-Raddix`],
      children: "Dec"
    })
    this.numDecElement = Obj.createElement({
      parent: numberSystemElement,
      classList: [`${this.classList}-NumberSystem-Number`],
      children: "0"
    })
    numberSystemElement = Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-NumberSystem`],
    })
    Obj.createElement({
      parent: numberSystemElement,
      classList: [`${this.classList}-NumberSystem-Raddix`],
      children: "Hex"
    })
    this.numHexElement = Obj.createElement({
      parent: numberSystemElement,
      classList: [`${this.classList}-NumberSystem-Number`],
      children: "0"
    })
  }

  update(num) {
    const addSpace = (str, len) => {
      let res = str.slice(0, str.length % len) + " "
      for (let i = str.length % len; i < str.length; i += len) {
        res += str.slice(i, i + len) + " " }
      return res
    }
    num = parseInt(num, parseInt(this.radix))
    this.numBinElement.innerText = addSpace(num.toString(2).toUpperCase(), 8)
    this.numDecElement.innerText = addSpace(num.toString(10).toUpperCase(), 3)
    this.numHexElement.innerText = addSpace(num.toString(16).toUpperCase(), 2)
  }

  getControlElement(kvargs) {
    const controlElement = Obj.createElement({
      parent: kvargs.parent,
      classList: [`${kvargs.classList}-NumSys`],
    })
    Obj.createElement({
      tagName: "input",
      type: "radio",
      name: "NumSys",
      value: 2,
      parent: controlElement,
      events: {
        click: this.onClick.bind(this)
      }
    })
    controlElement.append("Bin")
    Obj.createElement({
      tagName: "input",
      type: "radio",
      name: "NumSys",
      value: 10,
      parent: controlElement,
      events: {
        click: this.onClick.bind(this)
      }
    })
    controlElement.append("Dec")
    Obj.createElement({
      tagName: "input",
      type: "radio",
      name: "NumSys",
      value: 16,
      parent: controlElement,
      events: {
        click: this.onClick.bind(this)
      }
    })
    controlElement.append("Hex")
    controlElement.children[1].checked = "checked"
  }

  onClick(evn, btn) {
    for (const fn of this.onChange) {
      fn(btn.value) }
    this.radix = btn.value
  }
}

//******************************************************************************
export class Application extends App {
  constructor(kvargs = {}) {
    super(kvargs)
    super.show()
    Obj.createElement({
      parent: this.element,
      classList: [`${this.classList}-ToolBar`],
      children: "ordinary financical programmer"
    })
    const Calculator = ProgrammerCalculator
    new Calculator({
      parent: this.element,
      classList: this.classList
    })
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body, classList: ["Calculator"] })
})
