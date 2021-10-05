import { App } from "../../../import/scripts/App.js"
import { Obj } from "../../../import/scripts/Obj.js"
import { Button } from "../../../import/scripts/Button.js"

//******************************************************************************
class Number_ extends Obj {
  static addSpace = (str, len) => {
    let res = str.slice(0, str.length % len) + " "
    for (let i = str.length % len; i < str.length; i += len) {
      res += str.slice(i, i + len) + " "
    }
    return res
  }

  get value() {
    return this.numberElement?.innerText || ""
  }
  set value(val) {
    if (!this.numberElement) {
      this.numberElement = Obj.createElement({
        owner: this,
        parent: this.element,
        events: [{
          click: (evn, obj) => console.log(obj.innerText)
        }]
      })
    }
    this.numberElement.innerText = val
  }

  get radix() {
    return parseInt(this.radixElement?.textContent) || 10
  }
  set radix(radix) {
    this.radixElement?.remove()

    // this.value = parseInt(this.value, this.numberSystems.radix)
    //   .toString(radix).toUpperCase()

    if (radix !== 10) {
      this.radixElement = Obj.createElement({
        owner: this,
        parent: this.element,
        classList: [`${this.classList}-Radix`],
        children: radix
      })
    }
  }

  constructor(app, kvargs) {
    const id = kvargs.id || "Number"
    super({
      id: id,
      parent: kvargs.parent,
      classList: [`${kvargs.classList}-Number`]
    })
    this.app = app
    this.show()
    this.value = kvargs.value || ""
    this.radix = kvargs.radix || this.app.numberSystems?.radix || 10
  }

  addChar(chr) {
    if (chr === "." && this.value.includes(".")) {
      return
    }
    this.value += chr
  }
}

//******************************************************************************
class Display extends Obj {
  get value() {
    return this.editableElement?.innerHTML || ""
  }

  add(item) {
    if (item.group === "Digit") {
      if (this.number?.id === "Result") {
        this.clear()
      }
      if (!this.number) {
        this.number = new Number_(this.app, {
          parent: this.editableElement,
          classList: this.classList
        })
      }
      this.number.addChar(item.element.innerText)
      if (this.app.numberSystems) {
        this.app.numberSystems.value = this.number.value
      }
    } else {
      if (this.app.numberSystems) {
        this.app.numberSystems.value = "0"
      }
      delete this.number
      if (item.id === "OpClr") {
        this.clear()
        return
      } else if (item.id === "OpBack") {
        if (this.number?.value.length) {
          this.number.value = this.number.value.slice(0, -1)
          if (this.number.value.length === 0) {
            this.number.element.remove()
            this.number.radixElement?.remove()
            delete this.number
          }
          if (this.app.numberSystems) {
            this.app.numberSystems.value = this.number?.value || "0"
          }
        } else {
          this.editableElement.lastChild?.remove()
        }
        return
      }
      const oper = Obj.createElement({
        id: item.id,
        parent: this.editableElement
      })
console.log(item)
      oper.operation = item.operation
      if (item.id === "OpEqu") {
        oper.append("=")
        this.result()
      } else if (item.id === "OpLPrnth") {
        oper.append("(")
      } else if (item.id === "OpRPrnth") {
        oper.append(")")
      } else if (this.editableElement.lastChild) {
        if (["*", "/", "+", "-"].includes(this.editableElement.lastChild.textContent)) {
          this.editableElement.lastChild.remove()
        }
        oper.append(item.element.textContent)
      }
    }
  }

  constructor(app, kvargs) {
    super(kvargs)
    this.app = app
    this.classList = [`${kvargs.classList}-Display`]
  }

  show() {
    super.show()
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
  }

  clear() {
    this.errorElement.innerText = ""
    this.editableElement.innerText = ""
    delete this.number
    if (this.app.numberSystems) {
      this.app.numberSystems.value = "0"
    }
  }

  result() {
    let exp = ""
    for (const item of this.editableElement.childNodes) {
console.log(item.id, item.operation)
      if (item.id === "Number") {
        exp += parseInt(item.owner.value, item.owner.radix)
      } else {
        if (item.id !== "OpEqu")
        exp += item.operation
      }
    }
console.log(exp)
    try {
      const result = eval(exp).toString(this.app.numberSystems?.radix || 10).toUpperCase()
      console.log(result)
      this.errorElement.innerText = ""
      this.add("=")
      new Number_(this.app, {
        parent: this.editableElement,
        classList: this.classList,
        value: result
      })
      Obj.createElement({
        parent: this.historyElement,
        classList: [`${this.classList}-History-Row`]
      }).innerHTML = this.editableElement.innerHTML
      this.editableElement.innerText = ""
      this.number = new Number_(this.app, {
        id: "Result",
        parent: this.editableElement,
        classList: this.classList,
        value: result
      })
      if (this.app.numberSystems) {
        this.app.numberSystems.value = result
      }
    } catch (err) {
      this.errorElement.innerText = "Err"
    }
  }
}

//******************************************************************************
class KeyPad extends Obj {
  constructor(kvargs) {
    super(kvargs)
    this.classList = [`${kvargs.classList}-KeyPad`]
    this.display = new Display(this, {
      parent: kvargs.parent,
      classList: kvargs.classList
    })
  }
}

//******************************************************************************
class ProgrammerCalculator extends KeyPad {
  constructor(kvargs) {
    super(kvargs)
    this.numberSystems = new NumberSystems({
      classList: kvargs.classList
    })
    this.display.show()
    this.numberSystems.showPanel({
      parent: this.display.element,
      classList: kvargs.classList
    })
    this.show()
  }

  show() {
    const keys = {
      "Key0": "0",
      "Key1": "1",
      "Key2": "2",
      "Key3": "3",
      "Key4": "4",
      "Key5": "5",
      "Key6": "6",
      "Key7": "7",
      "Key8": "8",
      "Key9": "9",
      "KeyA": "A",
      "KeyB": "B",
      "KeyC": "C",
      "KeyD": "D",
      "KeyE": "E",
      "KeyF": "F",
      "KeyPoint": ".",
      "OpMinus": ["±", "-"],
      "OpLPrnth": ["(", "("],
      "OpRPrnth": [")", ")"],
      "OpDiv": ["÷", "/"],
      "OpMul": ["×", "*"],
      "OpSub": ["-", "-"],
      "OpAdd": ["+", "+"],
      "OpAND": ["AND", "&"],
      "OpOR": ["OR", "|"],
      "OpXOR": ["XOR", "^"],
      "OpNOT": ["NOT", "~"],
      "OpLSh": ["<<", "<<"],
      "OpRSh": [">>", ">>"],
      "OpSqr": ["Sqr", ""],
      "OpSqu": ["q", ""],
      "OpEqu": ["=", "="],
      "OpBack": ["Bck", ""],
      "OpClr": ["Clr", ""]
    }
    const layout = [
      ["OpLPrnth", "OpRPrnth", "OpBack", "OpClr"],
      ["OpLSh", "OpRSh", "OpXOR", ""],
      ["OpAND", "OpOR", "OpNOT", "OpSqr"],
      ["KeyD", "KeyE", "KeyF", "OpSqu"],
      ["KeyA", "KeyB", "KeyC", "OpDiv"],
      ["Key7", "Key8", "Key9", "OpMul"],
      ["Key4", "Key5", "Key6", "OpSub"],
      ["Key1", "Key2", "Key3", "OpAdd"],
      ["Key0", "KeyPoint", "OpMinus", "OpEqu"]
    ]
    super.show()
    this.numberSystems.parent = this.element
    this.numberSystems.show()
    for (let row = 0; row < layout.length; row++) {
      const rowElement = Obj.createElement({
        parent: this.element,
        classList: [`${this.classList}-Row`]
      })
      for (let col = 0; col < layout[row].length; col++) {
        if (layout[row][col]) {
          const isDigit = layout[row][col].startsWith("Key")
          const btn = new Button({
            id: layout[row][col],
            parent: rowElement,
            classList: [`${this.classList}-Button`],
            children: isDigit ? keys[layout[row][col]] : keys[layout[row][col]][0],
            events: [{click: (evn, btn) => { this.display.add(btn) } }]
          })
          btn.group = isDigit ? "Digit" : "Operation"
          if (isDigit) {
            btn.operation = keys[layout[row][col]][1]
          }
          btn.show()
        } else {
          Obj.createElement({
            parent: rowElement,
            classList: [`${this.classList}-Button`],
          })
        }
      }
    }
    this.keyEnable(this.numberSystems.radix)
    this.numberSystems.onChange = (radix) => {
      this.keyEnable(radix)
      if (this.display.number) {
        this.display.number.value = parseInt(this.display.number.value, this.numberSystems.radix)
          .toString(radix).toUpperCase()
        this.display.number.radix = radix
      }
    }
  }

  keyEnable(radix) {
    if (radix === 16) {
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
    } else if (radix === 10) {
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
    } else if (radix === 2) {
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
  get value() {
    return this.numBinElement.innerText
  }
  set value(num) {
    num = parseInt(num, this.radix)
    this.numBinElement.innerText = Number_.addSpace(num.toString(2).toUpperCase(), 8)
    this.numDecElement.innerText = Number_.addSpace(num.toString(10).toUpperCase(), 3)
    this.numHexElement.innerText = Number_.addSpace(num.toString(16).toUpperCase(), 4)
  }

  constructor(kvargs) {
    kvargs.classList = [`${kvargs.classList}-NumberSystems`]
    super(kvargs)
    this.radix = 10
  }

  show() {
    this.classList = [`${this.classList}-Control`]
    super.show()
    Obj.createElement({
      tagName: "input",
      type: "radio",
      name: "NumSys",
      value: 2,
      parent: this.element,
      events: {
        click: this.onClick.bind(this)
      }
    })
    this.element.append("Bin")
    Obj.createElement({
      tagName: "input",
      type: "radio",
      name: "NumSys",
      value: 10,
      parent: this.element,
      events: {
        click: this.onClick.bind(this)
      }
    }).checked = "checked"
    this.element.append("Dec")
    Obj.createElement({
      tagName: "input",
      type: "radio",
      name: "NumSys",
      value: 16,
      parent: this.element,
      events: {
        click: this.onClick.bind(this)
      }
    })
    this.element.append("Hex")
  }

  onClick(evn, btn) {
    const radix = parseInt(btn.value)
    this.onChange(radix)
    this.radix = radix
  }

  showPanel(kvargs) {
    const element = Obj.createElement({
      parent: kvargs.parent,
      classList: [`${kvargs.classList}-NumberSystems`],
    })
    let numberSystemElement = Obj.createElement({
      parent: element,
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
      parent: element,
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
      parent: element,
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
