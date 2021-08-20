function main(msg, media, vol, dly) {
  let layout = document.createElement("div")
  layout.className = "HLayout LayoutMessage"
  document.body.append(layout)
  let elm = document.createElement("div")
  elm.className = "Picture"
  layout.append(elm)
  elm = document.createElement("div")
  elm.className = "Message"
  elm.innerHTML = msg
  layout.append(elm)
  layout = document.createElement("div")
  layout.className = "HLayout LayoutButtons"
  document.body.append(layout)
  elm = document.createElement("button")
  elm.className = "Button"
  elm.innerHTML = "Stop"
  elm.addEventListener("click", evn => {
    window.opener.__stopRequest__ = true
  })
  layout.append(elm)
  elm.focus()
  elm = document.createElement("button")
  elm.className = "Button"
  elm.innerHTML = `Delay ${dly} min`
  elm.addEventListener("click", evn => {
    window.opener.__delayRequest__ = true
  })
  layout.append(elm)
  const audio = new Audio(media)
  const volume = vol
  if (!volume) {
    const gen = (function* () {
      for (let val = 0.1; val < 1; val += 0.005) {
        yield val
      }
    })()
    audio.volume = 0.1
    const timer = setInterval(() => {
      const volume = gen.next().value
      if (volume) {
        audio.volume = volume
      }
      else {
        clearInterval(timer)
      }
    }, 300)
  }
  else {
    audio.volume = volume
  }
  audio.addEventListener("canplaythrough", audio.play)
  audio.addEventListener("ended", evn => {
    audio.currentTime = 0
    audio.play()
  })
}
