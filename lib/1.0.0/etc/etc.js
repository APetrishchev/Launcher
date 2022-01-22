export function debug(arg, ...args) {
  const now = new Date()
  console.groupCollapsed(`*** [${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] ${arg} ********************`)
  console.log(...args)
  console.groupEnd()
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function wait(self, resolve, args, dly, reject, args1) {
  while (true) {
    if (await resolve.apply(self, args || [])) {
      break }
    else {
      if (reject && reject.apply(self, args1 || [])) {
        break }
      await delay(dly) }
  }
}

export function firstZero(num) { return (num < 10) ? `0${num}` : num }

export function capitalize(word) { return `${word[0].toUpperCase()}${word.slice(1)}` }

export const units = {
  uptime: (val) => {
    let result = ""
    if (val > 86400) {
      result += `${(val / 86400.0).toFixed(0)}d`
      val %= 86400.0
    }
    if (val > 3600) {
      if (result) { result += " " }
      result += `${(val / 3600.0).toFixed(0)}h`
      val %= 3600.0
    }
    if (val > 60) {
      if (result) { result += " " }
      result += `${(val / 60.0).toFixed(0)}m`
    }
    return result
  },

  bytes: (val) => {
    if (val > 1099511627776) {
      return { value: (val / 1099511627776.0), unit: 'TBytes' } }
    else if (val > 1073741824) {
      return { value: (val / 1073741824.0), unit: 'GBytes' } }
    else if (val > 1048576) {
      return { value: (val / 1048576.0), unit: 'MBytes' } }
    else if (val > 1024) {
      return { value: (val / 1024.0), unit: 'KBytes' } }
    else {
      return { value: val, unit: 'Bytes' } }
  },
}

export function roundRect(ctx, x, y, w, h, r, fill, stroke = true) {
  if (typeof r === "undefined") {
    r = 5}
  if (typeof r === "number") {
    r = { tl: r, tr: r, br: r, bl: r }}
  else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 }
    for (const side in defaultRadius) {
      r[side] = r[side] || defaultRadius[side]
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
