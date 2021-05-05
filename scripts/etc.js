export function firstZero(num) { return (num < 10) ? `0${num}` : num }

export function clearElement(elm) {
  while (elm.firstChild) {
    elm.removeChild(elm.firstChild)}
}
