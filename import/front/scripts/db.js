//******************************************************************************
export class DB {
  async connect(dbName, version) {
    this.connection = await idb.openDb(dbName, version, db => this.create(db))
    return this.connection
  }

  async get(storeName, idx, val) {
    let store = this.connection.transaction(storeName).objectStore(storeName)
    if (idx) {
      return await store.index(idx).getAll(val)}
    return await store.getAll()
  }

  async add(storeName, obj) {
    let tx = this.connection.transaction(storeName, "readwrite")
    try {
      await tx.objectStore(storeName).add(obj)
      return null
    }
    catch (err) {
      if (err.name == 'ConstraintError') {
        return err
      }
      else {
        throw err
      }
    }
  }

  async clear(storeName) {
    let tx = this.connection.transaction(storeName, "readwrite")
    await tx.objectStore(storeName).clear()
  }
}
