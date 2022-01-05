import { DB } from "../../../lib/db.js"

export class LauncherDB extends DB {
  constructor(version=1) {
    super("Launcher", version)
  }

  async create(db, oldVersion, transaction) {
    if (oldVersion === 0) {
      db.createObjectStore("user")
      await transaction.done
    }
  }
}
