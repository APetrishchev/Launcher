import { Obj } from "../obj.js"
import { capitalize, firstZero } from "../etc/etc.js"


export class Calendar extends Obj {
  static lang = "en"

  static getWeekdayName(day, kvargs) {
    const formatter = new Intl.DateTimeFormat(Calendar.lang, { weekday: "short" })
    kvargs.children = capitalize(formatter.format(new Date(2017, 4, day)))
    let classList = Obj.combine(kvargs.classList, '-Weekday')
    if (day > 5) {
      classList = [...classList, ...Obj.combine(kvargs.classList, '-Weekend')] }
    kvargs.classList = classList
    return Obj.createElement(kvargs)
  }

  static getWeekdayNames(parent, className) {
    const formatter = new Intl.DateTimeFormat(Calendar.lang, { weekday: "short" })
    for (let idx = 1; idx < 8; idx++) {
      Obj.createElement({ parent: parent, children: capitalize(formatter.format(new Date(2017, 4, idx))),
        classList: idx < 6 ? [`TextScale ${className}-Weekday`] : [`TextScale ${className}-Weekday ${className}-Weekend`] })
    }
  }

  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  constructor(kvargs={}) {
    kvargs.classList = kvargs.classList || ["Calendar"]
    super(kvargs)
    Calendar.lang = kvargs.lang
    this.className = this.classList.join(" ")
  }

  show() {
    super.show()
    Obj.createElement({ parent: this.element, classList: [`${this.className}-Header`] })
    const weekdaysLayout = Obj.createElement({ parent: this.element, classList: [`${this.className}-Weekdays`] })
    Calendar.getWeekdayNames(weekdaysLayout, this.className)
    for (let row = 1; row < 7; row++) {
      const weekLayout = Obj.createElement({ parent: this.element, classList: [`${this.className}-Week`] })
      for (let col = 1; col < 8; col++) {
        const elm = Obj.createElement({ parent: weekLayout })
        if (this.onMouseOver && this.onMouseOut) {
          elm.addEventListener("mouseenter", this.onMouseOver)
          elm.addEventListener("mouseleave", this.onMouseOut)}
        if (this.onClick) {
          elm.addEventListener("click", this.onClick)}
      }
    }
    this.update(new Date())
  }

  hide() {
    super.hide()
  }

  update(now) {
    const date = now.getDate()
    if (this.date === undefined || this.date !== date) {
      this.date = date
      this.element.children[0].append(`${capitalize(new Intl.DateTimeFormat(Calendar.lang, { month: "long" }).format(now))} ${now.getFullYear()}`)
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay() || 7
      const daysInPrevMonth = Calendar.getDaysInMonth(now.getFullYear(), now.getMonth())
      const daysInMonth = Calendar.getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
      let day = 1
      let otherDay = daysInPrevMonth - firstDay + 2
      for (let row = 0; row < 6; row++) {
        const weekLayout = this.element.children[row + 2]
        for (let col = 0; col < 7; col++) {
          if (7 * row + col + 1 < firstDay || day > daysInMonth) {
            weekLayout.children[col].append(firstZero(otherDay++))
            if (otherDay > daysInPrevMonth) {
              otherDay = 1 }
            let className = `${this.className}-Day`
            if (col < 5) {
              className += ` ${this.className}-OtherDay` }
            else {
              className += ` ${this.className}-OtherWeekend` }
            weekLayout.children[col].className = className
            continue }
          weekLayout.children[col].id = day
          let className = `${this.className}-Day`
          if (col < 5 && day < now.getDate()) {
            className += ` ${this.className}-PastDay`}
          else if (col >= 5 && day < now.getDate()) {
            className += ` ${this.className}-PastWeekend`}
          else if (col >= 5 && day > now.getDate()) {
            className += ` ${this.className}-Weekend`}
          else if (day == now.getDate()) {
            className += ` ${this.className}-Today`}
          weekLayout.children[col].className = className
          weekLayout.children[col].append(firstZero(day))
          day++
        }
      }
    }
  }
}
