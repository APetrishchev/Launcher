import { App, Obj, Form, ProgressBar, Gauge } from "../../../../Laucher/1.0.0/front/scripts/system.js"
import { wait, units } from "../../../../Laucher/1.0.0/front/scripts/etc.js"

var app

//******************************************************************************
export class TopProcess extends Obj {
  constructor(kvargs = {}) {
    kvargs.classList = ["VLayout", "SMonitor-TopProcess"]
    super(kvargs)
  }

  show() {
    super.show()
    this.top = []
    for (let idx = 0; idx < 5; idx++) {
      const hLayout = Obj.createElement({ parent: this.element, classList: ["HLayout"], children: [
        Obj.createElement({ classList: ["SMonitor-TopProcess-Pid"] }),
        Obj.createElement({ classList: ["SMonitor-TopProcess-Cmd"] }),
        Obj.createElement({ classList: ["SMonitor-TopProcess-Perc"] })]
      })
      this.top.push(hLayout)
    }
  }

  update(metric) {
    for (let idx = 0; idx < 5; idx++) {
      this.top[idx].children[0].append(metric[idx].pid)
      this.top[idx].children[1].append(metric[idx].cmd)
      this.top[idx].children[2].append(`${metric[idx].perc} %`)
    }
  }
}

//******************************************************************************
export class Application extends App {
  static delay = 2000

  constructor(kvargs) {
    super(kvargs)
    app = this
    this.classList = ["SMonitor"]
    this.metrics = []
  }

  async get(time = 0) {
    try {
      const rsp = await fetch(`http://localhost:5000/${time}`)
      this.metrics = await rsp.json()
      console.log(this.metrics)
      return true
    }
    catch(err) {
      return false }
  }

  async show() {
    super.show()
    await wait(this, this.get, [], 1000, () => {
      if (!this.errorElement) {
        this.errorElement = Obj.createElement({ parent: this.element,
          classList: Obj.combine(this.classList, "-Error"),
          children: "Error: agent not runned." })
      }
    })
    if (this.errorElement) {
      this.errorElement.remove() }
    this.hostname = new Obj({ })
    this.uptime = new Obj({ })
    this.cpu = {}
    this.cpu.cpu = new ProgressBar({ parent: this.element })
    this.cpu.cpu.show()
    let hLayout = Obj.createElement({parent: this.element, classList: ["HLayout"] })
    this.cpu.cpus = []
    for (let idx = 0; idx < this.metrics.cpu.cpus.length; idx++) {
      const elm = new ProgressBar({ parent: hLayout, vertical: true })
      elm.show()
      this.cpu.cpus.push(elm)
    }
    this.cpu.top = new TopProcess({ parent: this.element })
    this.cpu.top.show()
    this.mem = new ProgressBar({ parent: this.element })
    this.mem.show()
    hLayout = Obj.createElement({ parent: this.element, classList: ["HLayout"] })
    this.mem_ = {}
    this.mem_.gauge = new Gauge({ parent: hLayout })
    this.mem_.gauge.show()
    this.mem_.gauge.text1 = "RAM"
    this.swap = new Gauge({ parent: hLayout })
    this.swap.show()
    this.swap.text1 = "SWAP"
    this.mem_.top = new TopProcess({ parent: this.element })
    this.mem_.top.show()
    this.filesystems = []
    for (let idx = 0; idx < this.metrics.filesystems.length; idx++) {
      const elm = new ProgressBar({ parent: this.element })
      elm.show()
      this.filesystems.push(elm)
    }
    hLayout = Obj.createElement({ parent: this.element, classList: ["HLayout"] })
    this.filesystems_ = []
    for (let idx = 0; idx < this.metrics.filesystems.length; idx++) {
      const elm = new Gauge({ parent: hLayout })
      elm.show()
      elm.text1 = this.metrics.filesystems[idx].name
      this.filesystems_.push(elm)
    }

    const form = new Form({ parent: this.element,
      fields: [
        ["Hostname:", this.hostname],
        ["Uptime:", this.uptime],
      ]
    })
    form.show()
    setInterval(() => this.update(), Application.delay)
  }

  async update() {
    if (!await this.get(this.metrics[this.metrics.length - 1]?.time || 0)) {
      return }
    const prevMetric = this.metrics //[this.metrics.length - 2]
    const lastMetric = this.metrics //[this.metrics.length - 1]
    this.hostname.element.append(lastMetric.hostname)
    this.uptime.element.append(units.uptime(lastMetric.uptime))
    this.cpu.cpu.value = lastMetric.cpu.cpu
    this.cpu.cpu.text = `CPU Used: ${lastMetric.cpu.cpu.toFixed(0)}%`
    for (let idx = 0, len = this.cpu.cpus.length; idx < len; idx++) {
      this.cpu.cpus[idx].value = lastMetric.cpu.cpus[idx]
      this.cpu.cpus[idx].text = lastMetric.cpu.cpus[idx].toFixed(0)
    }
    this.cpu.top.update(lastMetric.cpu.top)

    const memTotal = lastMetric.memory.total
    const memUsed = memTotal - lastMetric.memory.avail
    const memUsedPerc = 100 * memUsed / memTotal
    const memTotalBytes = units.bytes(memTotal)
    const memUsedBytes = units.bytes(memUsed)
    this.mem.value = memUsedPerc
    this.mem.text = `RAM: ${memUsedPerc.toFixed(0)}% (${memUsedBytes.value.toFixed(2)} ${memUsedBytes.unit} / ${memTotalBytes.value.toFixed(2)} ${memTotalBytes.unit})`
    this.mem_.value = memUsedPerc
    this.mem_.text2 = `${memUsedBytes.value.toFixed(2)} ${memUsedBytes.unit} of`
    this.mem_.text3 = `${memTotalBytes.value.toFixed(2)} ${memTotalBytes.unit}`
    this.mem_.top.update(lastMetric.memory.top)

    const swapTotal = lastMetric.swap.total
    const swapUsed = swapTotal - lastMetric.swap.free
    const swapUsedPerc = 100 * swapUsed / swapTotal
    const swapTotalBytes = units.bytes(swapTotal)
    const swapUsedBytes = units.bytes(swapUsed)
    this.swap.value = Math.random() * 100 // swapUsedPerc
    this.swap.text2 = `${swapUsedBytes.value.toFixed(2)} ${swapUsedBytes.unit} of`
    this.swap.text3 = `${swapTotalBytes.value.toFixed(2)} ${swapTotalBytes.unit}`

    for (let idx = 0, len = this.filesystems.length; idx < len; idx++) {
      const fsTotal = lastMetric.filesystems[idx].total
      const fsUsed = fsTotal - lastMetric.filesystems[idx].avail
      const fsUsedPerc = 100 * fsUsed / fsTotal
      const fsTotalBytes = units.bytes(fsTotal)
      const fsUsedBytes = units.bytes(fsUsed)
      this.filesystems[idx].value = fsUsedPerc
      this.filesystems[idx].text = `${lastMetric.filesystems[idx].name}: ${fsUsedPerc.toFixed(0)}% (${fsUsedBytes.value.toFixed(2)}${fsUsedBytes.unit} / ${fsTotalBytes.value.toFixed(2)}${fsTotalBytes.unit})`
      this.filesystems_[idx].value = fsUsedPerc
    }
  }

  hide() {
    super.hide()
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  new Application({ parent: document.body })
  await app.show()
})
