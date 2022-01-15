import { idb } from "./idb.js"


export class DB {
  constructor(name, version=1) {
    this.name = name
    this.version = version
  }

  async open() {
    const instance = this
    return await idb.openDB(this.name, this.version, {
      upgrade(db, oldVersion, newVersion, transaction) {
        instance.create(db, oldVersion, transaction)
      },
      blocked() {
        // …
      },
      blocking() {
        // …
      },
      terminated() {
        // …
      }
    })
  }

  async put(storeName, data, key) {
    const connection = await this.open()
    const tx = connection.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    for (const [_, obj] of Object.entries(data)) {
      store.put(obj, key) }
    await tx.done
    connection.close()
    return this
  }

  async get(storeName, idx, val) {
    const connection = await this.open()
    const store = connection.transaction(storeName).objectStore(storeName)
    if (idx) {
      return await store.index(idx).getAll(val)}
    return await store.getAll()
  }

  async add(storeName, obj, key) {
    const connection = await this.open()
    const tx = connection.transaction(storeName, "readwrite")
    try {
      await tx.objectStore(storeName).add(obj, key)
      return null
    }
    catch (err) {
      if (err.name == 'ConstraintError') {
        return err }
      else {
        throw err }
    }
    connection.close()
  }

  async clear(storeName) {
    const connection = await this.open()
    const tx = connection.transaction(storeName, "readwrite")
    await tx.objectStore(storeName).clear()
    connection.close()
  }

}
