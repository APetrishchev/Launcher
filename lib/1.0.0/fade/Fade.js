export function fade(on=true) {
  if (on) {
    window.__fadeElement = document.createElement("div")
    window.__fadeElement.className = "fade"
    document.body.append(window.__fadeElement)
  } else {
    window.__fadeElement.remove()
    delete window.__fadeElement
  }
}
