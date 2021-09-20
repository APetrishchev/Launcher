//******************************************************************************
export class TalkClock {
  constructor(kvargs = {}) {
    this.path = kvargs.path
    this.preSound = kvargs.preSound || null
    this.volume = kvargs.volume || 0.5
  }

  play(now) {
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const playList = []
    if (this.preSound) {
      playList.push(this.preSound)
    }
    if (hours < 20) {
      playList.push(`${this.path}${hours}.wav`)
    }
    else {
      playList.push(`${this.path}20.wav`)
    }
    if (hours > 20) {
      playList.push(`${this.path}${hours % 20}.wav`)
    }
    playList.push(`${this.path}oclock.wav`)
    let tensOfMinutes
    if (minutes > 0) {
      if (minutes < 20) {
        playList.push(`${this.path}${minutes}.wav`)
      }
      else {
        tensOfMinutes = Math.floor(minutes / 10) * 10
        playList.push(`${this.path}${tensOfMinutes}.wav`)
      }
      const unitsOfMinutes = minutes % tensOfMinutes
      if (unitsOfMinutes > 0) {
        playList.push(`${this.path}${unitsOfMinutes}.wav`)
      }
      playList.push(`${this.path}minutes.wav`)
    }
    let idx = 0
    const audioElement = new Audio(playList[idx])
    audioElement.volume = this.volume
    audioElement.addEventListener("canplaythrough", evn => audioElement.play())
    audioElement.addEventListener("ended", evn => {
      if (++idx < playList.length) {
        audioElement.src = playList[idx]
      }
    })
  }
}
