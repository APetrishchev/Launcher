import { Obj } from "./Obj.js"

//******************************************************************************
export class Gauge extends Obj {
  set value(val) {
    val = val.toFixed(0)
    const valLvl = val < this.tresholds[0] ? "Normal" : val < this.tresholds[1] ? "Warning" : "Critical"
    const size = this.element.clientWidth < this.element.clientHeight ? this.element.clientWidth : this.element.clientHeight
    const cx = 0.5 * size
    const cy = 0.55 * size
    const r = 0.4 * size
    if (!this.svgElement) {
      this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', "svg")
      this.element.append(this.svgElement)
      this.svgElement.setAttribute("class", [...Obj.combine(this.classList, "-Scale"), "shadow"].join(" "))
      this.svgElement.setAttribute("width", "100%")
      this.svgElement.setAttribute("height", "100%")
      this.svgElement.setAttribute("viewBox", `0 0 ${size} ${size}`)
      const l = 2 * Math.PI * r
      const lNorm = l * 0.007 * this.tresholds[0]
      const lWarn = l * 0.007 * (this.tresholds[1] - this.tresholds[0])
      const lCrit = l * 0.007 * (100 - this.tresholds[1])
      this.#circle(Obj.combine(this.classList, "-Normal"), cx, cy, r, [lNorm, l - lNorm], l * 0.6)
      this.#circle(Obj.combine(this.classList, "-Warning"), cx, cy, r, [lWarn, l - lWarn], l * 0.6 - lNorm)
      this.#circle(Obj.combine(this.classList, "-Critical"), cx, cy, r, [lCrit, l - lCrit], l * 0.6 - lNorm - lWarn)

      this.needleElement = document.createElementNS('http://www.w3.org/2000/svg', "line")
      this.svgElement.append(this.needleElement)
      this.needleElement.setAttribute("class", Obj.combine(this.classList, "-Needle").join(' '))
      this.needleElement.setAttribute("x1", cx)
      this.needleElement.setAttribute("y1", cy)
      this.needleElement.setAttribute("x2", cx + 0.85 * r)
      this.needleElement.setAttribute("y2", cy)
      this.needleElement.setAttribute("stroke-width", 0.05 * r)
      this.needleElement.setAttribute("stroke-linecap", "round")
      this.needleElement.setAttribute("style", "--val: 140deg")

      let elm = document.createElementNS('http://www.w3.org/2000/svg', "circle")
      this.svgElement.append(elm)
      elm.setAttribute("class", Obj.combine(this.classList, "-Needle").join(' '))
      elm.setAttribute("cx", cx)
      elm.setAttribute("cy", cy)
      elm.setAttribute("r", 0.1 * r)

      elm = document.createElementNS('http://www.w3.org/2000/svg', "g")
      this.svgElement.append(elm)
      elm.setAttribute("class", Obj.combine(this.classList, "-Text").join(' '))
      for (let i = 0; i <= 100; i += 10) {
        this.#text(elm, Obj.combine(this.classList, "-Scale-Digits"),
          cx + 1.22 * r * Math.sin(-i * Math.PI / 70 - 70),
          cy + 1.22 * r * Math.cos(-i * Math.PI / 70 - 70),
          `${i}`)
      }
      this.percentsElement = this.#text(elm, [], "50%", "45%")
      this.textElement1 = this.#text(elm, Obj.combine(this.classList, "-Text1"), "50%", "70%")
      this.textElement2 = this.#text(elm, Obj.combine(this.classList, "-Text2"), "50%", "80%")
      this.textElement3 = this.#text(elm, Obj.combine(this.classList, "-Text3"), "50%", "90%")
    }
    this.percentsElement.setAttribute("class", Obj.classList(`${this.classList}-${valLvl}`, Obj.combine(this.classList, "-Percents")).join(" "))
    this.percentsElement.innerText = `${val} %`
    this.needleElement.setAttribute("style", `--val: ${140 + 2.6 * val}deg`)
  }

  set text1(val) {
    this.textElement1.innerText = val
  }

  set text2(val) {
    this.textElement2.innerText = val
  }

  set text3(val) {
    this.textElement3.innerText = val
  }

  show() {
    super.show()
    this.value = 0
  }

  constructor(kvargs = []) {
    super(kvargs)
    this.classList = Obj.classList("Gauge", kvargs.classList)
    this.tresholds = kvargs.tresholds || [70, 90]
  }

  #circle(classList, cx, cy, r, dash, offset) {
    const elm = document.createElementNS('http://www.w3.org/2000/svg', "circle")
    elm.setAttribute("class", Obj.classList(classList, Obj.combine(this.classList, "-Scale")).join(' '))
    elm.setAttribute("cx", cx)
    elm.setAttribute("cy", cy)
    elm.setAttribute("r", r)
    elm.setAttribute("stroke-width", 0.2 * r)
    elm.setAttribute("stroke-linecap", "butt")
    elm.setAttribute("stroke-dasharray", `${dash[0]} ${dash[1]}`)
    elm.setAttribute("stroke-dashoffset", offset)
    this.svgElement.append(elm)
  }

  #text(parent, classList, x, y, txt) {
    const elm = document.createElementNS('http://www.w3.org/2000/svg', "text")
    parent.append(elm)
    elm.setAttribute("y", y)
    const elm1 = document.createElementNS('http://www.w3.org/2000/svg', "tspan")
    elm.append(elm1)
    elm1.setAttribute("class", classList.join(' '))
    elm1.setAttribute("x", x)
    elm1.setAttribute("text-anchor", "middle")
    if (txt) {
      elm1.append(txt) }
    return elm1
  }
}
