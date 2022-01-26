const http = require("http")
const os = require("os")

const delay = 1000
const length = 100
const metrics = []
const host = 'localhost'
const port = 5000


function add() {
  const metric = {}
  metric.time = Math.round(+new Date() / 1000)
  metric.hostname = os.hostname()
  metric.uptime = os.uptime()
  metric.cpus = os.cpus()
  metric.memory = {
    total: os.totalmem(),
    free: os.freemem()
  }
  if (metrics.length === length) {
    metrics.shift() }
  metrics.push(metric)
}


function get(req, res) {
  const time = +req.url.slice(1)
  if (isNaN(time)) {
    res.writeHead(404)
    res.end()
    return
  }
  console.log(time)
  let idx = metrics.indexOf(+req.url.slice(1))
  if (idx < 0) { idx = 0 }
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.writeHead(200)


  const lastMetric = metrics[metrics.length - 1]
  const cpus = []
  if (metrics.length < 2) {
    for (let idx = 0; idx < lastCPUs.length; idx++) {
      cpus.push(0) }
  }
  else {
    const prevMetric = metrics[metrics.length - 2]
    const deltaTime = lastMetric.time - prevMetric.time
    const lastCPUs = os.cpus()
    for (let idx = 0; idx < lastCPUs.length; idx++) {
      const cpuUsed = lastCPUs[idx].times.user + lastCPUs[idx].times.nice +
        lastCPUs[idx].times.sys + lastCPUs[idx].times.irq
      const cpuUsedPerc = 100 * cpuUsed / (cpuUsed + lastCPUs[idx].times.idle)
      cpus.push(cpuUsedPerc)
      console.log(idx, cpuUsedPerc)
    }
  }

  res.end(JSON.stringify(metrics.slice(idx)))
}

const server = http.createServer(get)
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
})
add()
setInterval(add, delay)
