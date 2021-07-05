import { DB } from "../../../../Application/1.0.0/front/scripts/db.js"

//******************************************************************************
export class LaucherDB extends DB {
  static cron_columns = [
    "disabled", "type", "name", "descr",
    "start", "months", "monthDays", "weekDays",
    "hours", "minutes", "stop",
    "next", "last", "state",
    "action", "cmdParams", "timeout"
  ]

  constructor() {
    super("Laucher", 1)
  }

  async create(db, oldVersion, transaction) {
    if (oldVersion === 0) {
      let store = db.createObjectStore("applications", { keyPath: "name" })
      store.createIndex("groups", "groups")

      store = db.createObjectStore("cron", { keyPath: "id" })
      store.createIndex("type", "type")
      store.createIndex("disabled", "disabled")
      store.createIndex("type, disabled", ["type", "disabled"])
      await transaction.done
    }
  }

  async init(app) {
    await super.init("applications", [
      { name: "obj1", groups: ["group1", "group2"] },
      { name: "obj2", groups: ["group2", "group3"] }
    ])
    await super.init("cron", app.ini.Laucher.Cron)
    return this
  }
}
