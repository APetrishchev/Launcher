import { Obj } from "../obj.js"


export class Container {
  constructor(kvargs = []) {
    this.items = []
    if (kvargs.items) {
      for (const obj of kvargs.items) {
        this.addItem(obj)
      }
    }
  }

  show() {
  }

	hide() {
	}

	addItem(kvargs) {
    this.items.push(kvargs)
    return item
  }

}
