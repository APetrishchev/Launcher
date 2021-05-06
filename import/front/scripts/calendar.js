import { firstZero } from "./etc.js"
import { Widget } from "./system.js"

//******************************************************************************
export class Calendar extends Widget {
  static getWeekdayNames(className) {
    let formatter = new Intl.DateTimeFormat("ru", { weekday: "short" })
    let fragment = document.createDocumentFragment()
    for (let idx = 1; idx < 8; idx++) {
      let innerHTML = formatter.format(new Date(2017, 4, idx))
      innerHTML = innerHTML[0].toUpperCase() + innerHTML.slice(1)
      Widget.createElement({parent: fragment, innerHTML: innerHTML,
        className: idx < 6 ? `TextScale ${className}Weekday` : `TextScale ${className}Weekday ${className}Weekend`})
    }
    return fragment
  }

  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  constructor(kvargs={}) {
    super(kvargs)
    this.className = kvargs.className || "Calendar"
  }

  show() {
    super.show()
    let weekdaysLayout = Widget.createElement({ parent: this.element, className: `${this.className}Weekdays` })
    weekdaysLayout.appendChild(Calendar.getWeekdayNames(this.className))
    for (let row = 1; row < 7; row++) {
      let weekLayout = Widget.createElement({ parent: this.element, className: `${this.className}Week` })
      for (let col = 1; col < 8; col++) {
        let elm = Widget.createElement({ parent: weekLayout })
        if (this.onMouseOver && this.onMouseOut) {
          elm.addEventListener("mouseenter", this.onMouseOver)
          elm.addEventListener("mouseleave", this.onMouseOut)}
        if (this.onClick) {
          elm.addEventListener("click", this.onClick)}
      }
    }
    this.update()
  }

  hide() {
    super.hide()
  }

  update() {
    let now = new Date()
    let date = now.getDate()
    if (this.date === undefined || this.date !== date) {
      this.date = date
      let firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay() || 7
      let daysInMonth = Calendar.getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
      let day = 1
      for (let row = 0; row < 6; row++) {
        let weekLayout = this.element.children[row + 1]
        for (let col = 0; col < 7; col++) {
          console.log(weekLayout.children[col])
          if (7*row+col+1 < firstDay || day > daysInMonth) {
            weekLayout.children[col].className = `${this.className}Day`
            continue}
          let className = `${this.className}Day`
          if (col < 5 && day < now.getDate()) {
            className += ` ${this.className}PastDay`}
          else if (col >= 5 && day < now.getDate()) {
            className += ` ${this.className}PastWeekend`}
          else if (col >= 5 && day > now.getDate()) {
            className += ` ${this.className}Weekend`}
          else if (day == now.getDate()) {
            className += " CalendarToday"}
          weekLayout.children[col].className = className
          weekLayout.children[col].innerHTML = firstZero(day)
          day++
        }
      }
    }
  }
}
