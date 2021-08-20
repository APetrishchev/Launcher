import { App, Obj, Splitter, Tree, Item,
  Form, ListBox, Label, Button, CheckBox, Dialog
} from "../../../../Laucher/1.0.0/front/scripts/system.js"
import { firstZero } from "../../../../Laucher/1.0.0/front/scripts/etc.js"
import { BinPosCode } from "./cron.js"
import { Calendar } from "../../../../Laucher/1.0.0/front/scripts/calendar.js"
import { LaucherDB } from "../../../../Laucher/1.0.0/front/scripts/laucher_db.js"

var instance

//******************************************************************************
class CronList extends Tree {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("CronList", kvargs.classList)
    super(kvargs)
  }

  show() {
    for (const [type, ids] of Object.entries(instance.types)) {
      const branch = this.addTree({ name: type, events: { "click": instance.branchOnClick} })
      for (const id of ids) {
        const nameElement = Obj.createElement({ classList: Obj.combine(this.classList, "-Item-Name"), children: instance.data[id].name })
        const descrElement = Obj.createElement({ classList: Obj.combine(this.classList, "-Item-Descr"), children: instance.data[id].descr })
        const leaf = branch.addItem({ classList: branch.classList, children: [nameElement, descrElement],
          events: {"click": instance.leafOnClick} })
        leaf.data = instance.data[id]
      }
    }
    super.show()
  }
}

//******************************************************************************
class CronPanel extends Tree {
  get value() { return this._value }
  set value(val) {
    this._value = val
    if (this._value) {
      this.clearButton.disabled = false
      if (this.isCollapsed) {
        this.expand() }
    }
    else {
      this.clearButton.disabled = true
      if (!this.isCollapsed) {
        this.collapse() }
    }
    if (this.elements) {
      for (const elm of this.elements) {
        if (val & (typeof(val) === "bigint" ? 1n : 1)) {
          elm.status = "down" }
        else {
          elm.status = "up" }
        elm.setAttribute("status", elm.status)
        typeof (val) === "bigint" ? val >>= 1n : val >>>= 1
      }
      if (this._value !== this.items[0].value) {
        instance.panels[1].buttonsEnable() }
    }
  }

  constructor(kvargs = {}) {
    kvargs.classList = ["CronForm-Spoiler"]
    super(kvargs)
    this._value = kvargs.value
    this.addItem({ classList: Obj.combine(this.classList, "-Panel") })
  }

  show() {
    super.show()
    this.clearButton = new Button({ classList: Obj.combine(this.classList, "-Header-ClearButton"),
      disabled: true,  events: {"click": evn => { this.value = 0 }} })
    this.clearButton.show()
    this.header.add(this.clearButton.element)
    this.value = this._value
  }

  addCells(rows, cols, start, end) {
    let idx = start
    for (let row = 0; row < rows; row++) {
      const rowElm = Obj.createElement({ parent: this.items[0].element,
        classList: Obj.combine(this.classList, "-Row") })
      for (let col = 0; col < cols; col++) {
        const elm = Obj.createElement({ parent: rowElm,
          classList: Obj.combine(this.classList, "-Cell"), children: firstZero(idx),
          events: { "click": elm => this.elmOnClick(elm) }
        })
        elm.value = typeof(this.value) === "bigint" ? 2n ** BigInt(idx - start) : 2 ** (idx - start)
        this.elements.push(elm)
        if (++idx > end) { break }
      }
    }
  }

  elmOnClick(elm) {
    if (elm.status === "down") {
      this.value &= ~elm.value }
    else if (elm.status === "up") {
      this.value |= elm.value }
    console.log(this.value.toString(16), elm.value.toString(16))
    console.dir(this)
  }

  expand() {
    super.expand()
    this.elements = []
  }

  collapse() {
    super.collapse()
    // delete this.elements
  }
}

//******************************************************************************
class DateTimePanel extends CronPanel {
  get value() { return this._value }
  set value(val) {
    this._value = val
    if (this._value && this.isCollapsed) {
      this.items[0].children = this._value
      this.expand() }
    else if (!this._value && !this.isCollapsed) {
      this.collapse() }
    // if (this.element) {
    //   this.element.innerHTML = this._value }
  }

  constructor(kvargs) {
    kvargs.items = [{ classList: ["CronForm-Start"], placeholder: "yyyy-mm-dd hh:mm" }]
    super(kvargs)
  }

  expand() {
    super.expand()
    this.items[0].element.contentEditable = true
  }
}

//******************************************************************************
class ActionPanel extends CronPanel {
  constructor(kvargs) {
    super(kvargs)
    this.items[0].classList = Obj.classList("CronForm-Spoiler-PlayPanel", this.items[0].classList)
  }

  expand() {
    super.expand()
    new ListBox({ parent: this.items[0].element, options: ["", "play"], value: instance.panels[1].data.action }).show()
    if (instance.panels[1].data.action === "play") {
      new Obj({ parent: this.items[0].element, classList: ["PlayPanel-Media"], children: instance.panels[1].data.params.media || "" }).show()
      new Button({ parent: this.items[0].element, classList: ["PlayPanel-ChoiseButton"], children: "..." }).show()
      new Button({ parent: this.items[0].element, classList: ["PlayPanel-PlayButton"], children: ">" }).show()
      new Obj({ parent: this.items[0].element, classList: ["PlayPanel-Timeout"], children: instance.panels[1].data.timeout || "" }).show()
      new Obj({ parent: this.items[0].element, classList: ["PlayPanel-Volume"], children: instance.panels[1].data.params.volume || "" }).show()
    }
  }
}

//******************************************************************************
class MonthsPanel extends CronPanel {
  expand() {
    super.expand()
    this.addCells(3, 4, 1, 12)
  }
}

//******************************************************************************
class MonthDaysPanel extends CronPanel {
  expand() {
    super.expand()
    this.addCells(4, 8, 1, 31)
  }
}

//******************************************************************************
class WeekDaysPanel extends CronPanel {
  expand() {
    super.expand()
    const rowElm = Obj.createElement({ parent: this.items[0].element,
      classList: Obj.combine(this.classList, "-Row") })
    const btn = new Button({ type: Button.Toggle, parent: rowElm,
      classList: Obj.combine(this.classList, "-WeekDaysButton"),
      events: { "click": elm => {
        // this.collapse()
        this.expand()
      }}
    })
    btn.show()
    let elm
    for (let col = 1; col < 8; col++) {
      elm = Calendar.getWeekdayName(col, { parent: rowElm,
        classList: Obj.combine(this.classList, "-Cell"),
        events: { "click": elm => this.elmOnClick(elm) }
      })
      this.elements.push(elm)
      elm.value = this.value < 256 ? 2 ** (col - 1) : 2 ** (5 + col) + 2 ** (12 + col) + 2 ** (19 + col) + 2 ** (26 + col)
console.dir(elm)
    }
    if (this.value & (!BinPosCode.weekDaysEnableMask) >= 256) {
      btn.status = Button.Down
      for (let row = 1; row < 5; row++) {
        const rowElm = Obj.createElement({ parent: this.items[0].element,
          classList: Obj.combine(this.classList, "-Row") })
        elm = Obj.createElement({ parent: rowElm,
          classList: Obj.combine(this.classList, "-Cell"), children: row,
          events: { "click": elm => this.elmOnClick(elm) }
        })
        this.elements.push(elm)
        elm.value = 127 * (2 ** (7 * row - 7))
        for (let col = 1; col < 8; col++) {
          elm = Obj.createElement({ parent: rowElm,
            classList: Obj.combine(this.classList, "-Cell"), children: "&nbsp;",
            events: { "click": elm => this.elmOnClick(elm) }
          })
          this.elements.push(elm)
          elm.value = 2 ** (7 * row + col - 9)
        }
      }
    }
  }
}

//******************************************************************************
class HoursPanel extends CronPanel {
  expand() {
    super.expand()
    this.addCells(3, 8, 0, 23)
  }
}

//******************************************************************************
class MinutesPanel extends CronPanel {
  expand() {
    super.expand()
    this.addCells(6, 10, 0, 59)
  }
}

//******************************************************************************
class CronForm extends Form {
  get isChanged() {
console.log(`  disabled "${this.fields[1][1].checked}" = "${this.data.disabled}" ? ${!this.fields[1][1].checked === !this.data.disabled}`)
console.log(`  name "${this.fields[2][1].element.innerHTML}" = "${this.data.name}" ? ${this.fields[2][1].element.innerHTML === this.data.name}`)
console.log(`  descr "${this.fields[3][1].element.innerHTML}" = "${this.data.descr}" ? ${this.fields[3][1].element.innerHTML === this.data.descr}`)
console.log(`  start "${this.fields[4][1].value}" = "${this.data.start}" ? ${this.fields[4][1].value === this.data.start}`)
console.log(`  months "${this.fields[5][1].value}" = "${this.data.months}" ? ${ this.fields[5][1].value === this.data.months}`)
console.log(`  monthDays "${this.fields[6][1].value}" = "${this.data.monthDays}" ? ${this.fields[6][1].value === this.data.monthDays}`)
console.log(`  weekDays "${this.fields[7][1].value}" = "${this.data.weekDays}" ? ${this.fields[7][1].value === this.data.weekDays}`)
console.log(`  hours "${this.fields[8][1].value}" = "${this.data.hours}" ? ${this.fields[8][1].value === this.data.hours}`)
console.log(`  minutes "${this.fields[9][1].value}" = "${this.data.minutes}" ? ${this.fields[9][1].value === this.data.minutes}`)
console.log(`  stop "${this.fields[10][1].value}" = "${this.data.stop}" ? ${this.fields[10][1].value === this.data.stop}`)
console.log(`  action "${this.fields[11][1].value}" = "${this.data.action}" ? ${this.fields[11][1].value == this.data.action}`)
    if (!this.fields[1][1].checked !== !this.data.disabled
      || this.fields[2][1].element.innerHTML !== this.data.name
      || this.fields[3][1].element.innerHTML !== this.data.descr
      || this.fields[4][1].value !== this.data.start
      || this.fields[5][1].value !== this.data.months
      || this.fields[6][1].value !== this.data.monthDays
      || this.fields[7][1].value !== this.data.weekDays
      || this.fields[8][1].value !== this.data.hours
      || this.fields[9][1].value !== this.data.minutes
      || this.fields[10][1].value !== this.data.stop
      || this.fields[11][1].value != this.data.action
    // || self.cronObject.event_['timeout'] == ('' if not self.durationInputField.text else int(self.durationInputField.text))
    // || self.cronObject.event_['params'] == self.cmdParamsInputField.text
    ) {
      return true }
  }

  constructor(kvargs = {}) {
    kvargs.classList = Obj.classList("CronForm", kvargs.classList)
    super(kvargs)
  }

  async show(data = {}) {
    this.data = data
    if (this.element) {
      Obj.clearElement(this.element) }

    if (data.type === "Birthday") { }

    this.fields = []
    this.fields.push(["Event Type:", new Label({ children: data.type })])
    this.fields.push(["Disable:", new CheckBox({ checked: data.disabled || 0 })])
    this.fields.push(["Event Name:", new Obj({ children: data.name || "" })])
    this.fields.push(["Description:", new Obj({ children: data.descr || "" })])
    this.fields.push(["", new DateTimePanel({ name: "Start", value: data.start || "" })])
    this.fields.push(["", new MonthsPanel({ name: "Months", value: data.months || 0 })])
    this.fields.push(["", new MonthDaysPanel({ name: "Month Days", value: data.monthDays || 0 })])
    this.fields.push(["", new WeekDaysPanel({ name: "Week Days", value: data.weekDays || 0 })])
    this.fields.push(["", new HoursPanel({ name: "Hours", value: data.hours || 0 })])
    this.fields.push(["", new MinutesPanel({ name: "Minutes", value: data.minutes || 0n })])
    this.fields.push(["", new DateTimePanel({ name: "Stop", value: data.stop || "" })])
    this.fields.push(["", new ActionPanel({ name: "Action", value: data.action || "" })])
    this.fields.push(["Last Event Time:", new Label({ children: data.lastTime || "" })])
    this.fields.push(["Next Event Time:", new Label({ children: data.nextTime || "" })])
    this.buttons = [
      { children: "Save", disabled: true, events: [{ "click": () => this.save() }] },
      { children: "Cansel", disabled: true, events: [{ "click": () => this.show(this.data) }] }
    ]
    super.show()
  }

  buttonsDisable() {
    this.buttons[0].disabled = true
    this.buttons[1].disabled = true
  }

  buttonsEnable() {
    this.buttons[0].disabled = false
    this.buttons[1].disabled = false
  }

  async update(data) {
    if (this.data?.disabled !== undefined && this.isChanged) {
      new Dialog({ title: "Confirm", msg: "Save changes?",
        buttons: [
          ["Save", () => {
            this.save()
            this.show(data)
          }],
          ["Not Save", () => {
            this.show(this.data)
            this.show(data)
          }],
          ["Cansel", null]
        ]
      })
    }
    else {
      this.show(data) }
  }

  save() {
    this.data.type = this.fields[0][1].element.innerHTML
    this.data.disabled = this.fields[1][1].checked
    this.data.name = this.fields[2][1].element.innerHTML
    this.data.descr = this.fields[3][1].element.innerHTML
    this.data.start = this.fields[4][1].value
    this.data.months = this.fields[5][1].value
    this.data.monthDays = this.fields[6][1].value
    this.data.weekDays = this.fields[7][1].value
    this.data.hours = this.fields[8][1].value
    this.data.minutes = this.fields[9][1].value
    this.data.stop = this.fields[10][1].value
    this.data.action = this.fields[11][1].value
    this.buttonsDisable()
    // db
    this.data.isChanged = true
  }
}

//******************************************************************************
export class Application extends Splitter {
  static async getInstance() {
    instance = new Application({ parent: document.body, panels: [new CronList(), new CronForm()] })
    instance.changedIds = []
    const db = new LaucherDB()
    instance.data = []
    instance.types = {}
    for (const data of await db.get("cron")) {
      instance.data[data.id] = data
      if (!(instance.data.type in instance.types)) {
        instance.types[data.type] = [] }
      data.isChanged = false
      instance.types[data.type].push(data.id)
    }
    instance.show()
  }

  async branchOnClick(branch) {
    await this.panels[1].update({ type: branch.name })
  }

  async leafOnClick(leaf) {
    await this.panels[1].update(leaf.data)
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  await Application.getInstance()
})

// const toggle = new Button({
//   type: Button.Toggle, parent: this.element,
//   children: "Toggle", status: Button.Down
// })
// toggle.show()
// new Button({ type: Button.Radio, group: "Group1", parent: this.element, text: "Radio1" }).show()
// new Button({ type: Button.Radio, group: "Group1", parent: this.element, text: "Radio2" }).show()
// toggle.disabled = false
