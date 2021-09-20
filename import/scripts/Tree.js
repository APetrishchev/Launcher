import { Obj } from "./Obj.js"

//******************************************************************************
export class Item extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Item", kvargs.classList)
    super(kvargs)
  }
}

//******************************************************************************
export class Tree extends Obj {
  constructor(kvargs = []) {
    kvargs.classList = Obj.classList("Tree", kvargs.classList)
    super(kvargs)
    this.level = kvargs.level || 0
    this.name = kvargs.name
    this.isCollapsed = kvargs.isCollapsed || true
    this.items = []
    if (kvargs.items) {
      for (const obj of kvargs.items) {
        this.addItem(obj) }
    }
  }

  show() {
    super.show()
    if (this.name) {
      this.toggleElement = Obj.createElement({
        classList: this.isCollapsed ? Obj.combine(this.classList, "-Header-Toggler") : Obj.combine(this.classList, "-Header-Toggler-Expanded"),
        events: [{"click": evn => this.toggle()}]
      })
      const nameElement = Obj.createElement({ classList: Obj.combine(this.classList, "-Header-Name"),
        children: this.name })
      this.header = new Obj({ parent: this.element, classList: Obj.combine(this.classList, "-Header"),
        children: [this.toggleElement, nameElement] })
      this.header.show()
    }
    else {
      this.isCollapsed = false }
    if (!this.isCollapsed) {
      this.expand() }
    return this.element
  }

  addTree(kvargs = []) {
    kvargs.level = this.level + 1
    kvargs.classList = Obj.classList("Tree-Item", kvargs.classList)
    const tree = new Tree(kvargs)
    this.items.push(tree)
    return tree
  }

  addItem(kvargs = []) {
    kvargs.classList = Obj.classList("Tree-Item", kvargs.classList)
    const item = new Item(kvargs)
    this.items.push(item)
    return item
  }

  expand() {
    for (const item of this.items) {
      item.parent = this.element
      item.show()
    }
    if (this.toggleElement) {
      this.toggleElement.className = Obj.combine(this.classList, "-Header-Toggler-Expanded").join(" ") }
    this.isCollapsed = false
  }

  collapse() {
    for (const item of this.items) {
      item.element.remove() }
    if (this.toggleElement) {
      this.toggleElement.className = Obj.combine(this.classList, "-Header-Toggler").join(" ") }
    this.isCollapsed = true
  }

  toggle(evn) {
    this.isCollapsed ? this.expand() : this.collapse()
  }
}
