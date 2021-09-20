import { DB } from "../../../import/scripts/db.js"

export class CronDB extends DB {
  constructor(version=1) {
    super("Cron", version)
  }

  async create(db, oldVersion, transaction) {
    if (oldVersion === 0) {
      db.createObjectStore("talkClock")
      const cronStore = db.createObjectStore("cronList", { keyPath: "id" })
      cronStore.createIndex("type", "type")
      cronStore.createIndex("disabled", "disabled")
      cronStore.createIndex("type, disabled", ["type", "disabled"])
      await transaction.done
    }
  }
}
