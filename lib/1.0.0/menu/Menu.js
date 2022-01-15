import { Obj } from "../Obj.js"


export class Item extends Obj {
  constructor(menu, kvargs = {}) {
    kvargs.id = kvargs.id || kvargs.name
    kvargs.classList = kvargs.classList || ["Item"]
    super(kvargs)
    this.name = kvargs.name
    menu.add(this, kvargs.index)
    this.events.push({ mouseenter: evn => menu.hide(menu.level + 1) })
    if (kvargs.subMenu) {
      this.events.push({ mouseenter: function(evn) { kvargs.subMenu.show() }})
      kvargs.subMenu.level = menu.level + 1
      kvargs.subMenu.displayed = menu.displayed
    }
  }
}


export class Menu extends Obj {
  constructor(kvargs = {}) {
    super({
      id: kvargs.id || kvargs.name,
      parent: kvargs.parent || document.body,
      classList: Obj.classList("Menu", kvargs.classList)
    })
    this.level = 0
    this.displayed = [this]
    this.items = []
  }

  add(item, idx) {
    this[item.id] = item
    if (idx) {
      this.items.splice(idx, 0, item)
    } else {
      this.items.push(item) }
    return item
  }

  del(item) {
    if (this.isDisplayed) {
      item.remove() }
    delete this[item.id]
    this.items.splice(this.items.indexOf(item), 1)
  }

  show() {
    this.hide(this.level)
    this.displayed[this.level] = this
    super.show()
    for (const item of this.items) {
      item.parent = this.element
      item.show()
    }
  }

  hide(level) {
    if (level !== undefined) {
      for (let idx = this.displayed.length - 1; idx >= level; idx--) {
        for (const item of this.displayed[idx].items) {
          item.hide() }
        this.displayed[idx].remove()
      }
      this.displayed.splice(level, 255)
    } else {
      super.hide() }
  }
}
