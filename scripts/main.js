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
    for (let idx = 1; idx < 8; idx++) {
      let innerHTML = formatter.format(new Date(2017, 4, idx))
      innerHTML = innerHTML[0].toUpperCase() + innerHTML.slice(1)
      let div = document.createElement("div")
      let className = "TextScale CalendarWeekday"
      div.className = idx < 6 ? className : `${className} CalendarWeekend`
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
    this.element = document.createElement("div")
    this.element.className = "CalendarPanel"
    this.element.appendChild(Calendar.getWeekdayNames())
    parent.appendChild(this.element)
    let pos = 1
    for (let row = 1; row < 7; row++) {
      for (let col = 1; col < 8; col++) {
        let div = document.createElement("div")
        this.element.appendChild(div)
        if (row == 1 && col < todayWeekday - 1 || pos >= daysInMonth) {
          div.className = "CalendarDay"
          continue
        }
        let className = "CalendarDay"
        if (col > 5) {
          className += " CalendarWeekend"
        }
        if (pos == now.getDate()) {
          className += " CalendarToday"
        }
        div.className = className
        div.innerHTML = pos < 10 ? `0${pos}` : pos
        pos++
      }
    }
  }
}

//******************************************************************************
function onResize(args) {
  console.log(this, args)
  // this.resize()
}

//******************************************************************************
function main() {
  window._measuring_ = document.createElement("div")
  window._measuring_.id = "measuring"
  document.body.appendChild(window._measuring_)

  window.addEventListener("resize", (evn) => {
    for (const elm of document.querySelectorAll(".TextScale")) {
      let fontSize = parseInt(window.getComputedStyle(elm).getPropertyValue('font-size'), 10)
      window._measuring_.innerHTML = elm.innerHTML
      window._measuring_.style.fontSize = `${fontSize}px`

      let width = window._measuring_.clientWidth
      // while (Math.round(width) != Math.round(elm.clientWidth)) {
        if (width > elm.clientWidth) {
          fontSize -= 1
        }
        if (width < elm.clientWidth) {
          fontSize += 1
        }
        window._measuring_.style.fontSize = `${fontSize}px`
        width = window._measuring_.clientWidth
      // }
      elm.style.fontSize = `${fontSize}px`
      console.log(fontSize)

      // while (!(fontSize - 1 < elm.clientHeight && elm.clientHeight < fontSize + 1)) {
      //   if(elm.clientHeight > top) {
      //     top *= 2
      //   }
      //   if(elm.clientHeight > fontSize) {
      //     fontSize *= 2
      //   }
      // }
    }
  })

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
