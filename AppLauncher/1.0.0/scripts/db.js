import { DB } from "../../../import/scripts/db.js"

export class LaucherDB extends DB {
  constructor(version=1) {
    super("Laucher", version)
  }

  async create(db, oldVersion, transaction) {
    if (oldVersion === 0) {
      db.createObjectStore("user")
      await transaction.done
    }
  }
}
