window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
    .then(() => navigator.serviceWorker.ready.then((worker) => {
      console.log("ServiceWorker registration successful with scope:", worker.scope)
      worker.sync.register("syncdata")}))
    .catch(
      (err) => console.log("ServiceWorker registration failed:", err))
  }
  main()
})

//******************************************************************************
class Calendar {
  static getWeekdayNames() {
    let formatter = new Intl.DateTimeFormat("ru", {weekday: "short"})
    let fragment = document.createDocumentFragment()
    for(let idx = 1; idx < 8; idx++) {
      let innerHTML = formatter.format(new Date(2017, 4, idx))
      innerHTML = innerHTML[0].toUpperCase() + innerHTML.slice(1)
      let div = document.createElement("div")
      div.className = idx < 6 ? "CalendarWeekday" : "CalendarWeekday CalendarWeekend"
      div.innerHTML = innerHTML
      fragment.appendChild(div)
    }
    return fragment
  }

  static getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  constructor() {
  }

  show(parent) {
    let now = new Date()
    let todayWeekday = now.getDay() || 7
    let daysInMonth = Calendar.getDaysInMonth(now.getFullYear(), now.getMonth() + 1)
    console.log(now.getMonth(), daysInMonth)
    this.element = document.createElement("div")
    this.element.className = "CalendarPanel"
    this.element.appendChild(Calendar.getWeekdayNames())
    parent.appendChild(this.element)
    let pos = 0
    for(let row = 1; row < 7; row++) {
      for (let col = 1; col < 8; col++) {
        let div = document.createElement("div")
        this.element.appendChild(div)
        if (!pos && col < todayWeekday || pos >= daysInMonth) {
          div.className = "CalendarDay"
          continue
        }
        div.className = col < 6 ? "CalendarDay" : "CalendarDay CalendarWeekend"
        div.innerHTML = ++pos
      }
    }
  }
}

//******************************************************************************
function main() {
  let div = document.createElement("div")
  div.className = "Toolbar"
  div.innerHTML = "= = = = = = = = = ="
  document.body.appendChild(div)

  div = document.createElement("div")
  div.className = "DateTimePanel"
  div.innerHTML = "01:23"
  document.body.appendChild(div)

  new Calendar().show(document.body)
}
