import { Obj } from "../obj.js"

export class Spoiler extends Obj {
	constructor(kvargs) {
		super(kvargs)
		this.events = { "click": evn => this.#toggle() }
	}

	#toggle() {
		if (this.expanded) {
			this.expanded = false
			this.element.setAttribute("expanded", "false")
	//     expandedSpoiler.nextSibling.nextSibling.style.display = "none"
		} else {
			this.expanded = true
			this.element.setAttribute("expanded", "true")
		}
		this.toggle()
	}
		//   if (spoiler !== expandedSpoiler) {
//     spoiler.setAttribute("expanded", "true")
//     spoiler.nextSibling.nextSibling.style.display = "flex"
//     expandedSpoiler = spoiler
//   } else {
//     expandedSpoiler = null
//   }
// }
}
