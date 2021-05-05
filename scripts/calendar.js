export class Calendar {
  static getWeekdayNames(className) {
    let formatter = new Intl.DateTimeFormat("ru", { weekday: "short" })
    let fragment = document.createDocumentFragment()
    for (let idx = 1; idx < 8; idx++) {
      let innerHTML = formatter.format(new Date(2017, 4, idx))
      innerHTML = innerHTML[0].toUpperCase() + innerHTML.slice(1)
      let div = document.createElement("div")
      div.className = idx < 6 ? `TextScale ${className}Weekday` : `TextScale ${className}Weekday ${className}Weekend`
      div.innerHTML = innerHTML
      fragment.appendChild(div)
    }
    return fragment
  }

  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  constructor(argkv={}) {
    this.parent = argkv.parent
    this.className = argkv.className || "Calendar"
  }

  show(parent) {
    let now = new Date()
    let firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay() || 7
    let daysInMonth = Calendar.getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
    this.element = document.createElement("div")
    this.element.className = `${this.className}Panel`
    this.element.appendChild(Calendar.getWeekdayNames(this.className))
    parent.appendChild(this.element)
    let pos = 1
    for (let row = 1; row < 7; row++) {
      for (let col = 1; col < 8; col++) {
        let div = document.createElement("div")
        this.element.appendChild(div)
        if (row == 1 && col < firstDay || pos > daysInMonth) {
          div.className = `${this.className}Day`
          continue
        }
        let className = `${this.className}Day`
        if (col < 6 && pos < now.getDate()) {
          className += ` ${this.className}PastDay`
        } else if (col >= 6 && pos < now.getDate()) {
          className += ` ${this.className}PastWeekend`
        } else if (col >= 6 && pos > now.getDate()) {
          className += ` ${this.className}Weekend`
        } else if (pos == now.getDate()) {
          className += " CalendarToday"
        }
        div.className = className
        div.innerHTML = pos < 10 ? `0${pos}` : pos
        if (this.onMouseOver && this.onMouseOut) {
          div.addEventListener("mouseenter", this.onMouseOver)
          div.addEventListener("mouseleave", this.onMouseOut)
        }
        if (this.onClick) {
          div.addEventListener("click", this.onClick)
        }
        pos++
      }
    }
  }
}
