export function firstZero(num) { return (num < 10) ? `0${num}` : num }

export function capitalize(word) { return `${word[0].toUpperCase()}${word.slice(1)}` }

export function roundRect(ctx, x, y, w, h, r, fill, stroke = true) {
  if (typeof r === "undefined") {
    r = 5}
  if (typeof r === "number") {
    r = { tl: r, tr: r, br: r, bl: r }}
  else {
    let defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (let side in defaultRadius) {
      r[side] = r[side] || defaultRadius[side];
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
