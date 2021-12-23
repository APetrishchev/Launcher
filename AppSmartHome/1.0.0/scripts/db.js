import { DB } from "../../../lib/scripts/db.js"

export class SmartHomeDB extends DB {
  constructor(version=1) {
    super("SmartHome", version)
  }

  async create(db, oldVersion, transaction) {
    if (oldVersion === 0) {
      db.createObjectStore("config")
      await transaction.done
    }
  }
}
