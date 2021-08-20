import { DB } from "./db.js"

export class CronDB extends DB {
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
      // const store = db.createObjectStore("applications", { keyPath: "name" })
      // store.createIndex("groups", "groups")

      store = db.createObjectStore("cron", { keyPath: "id" })
      store.createIndex("type", "type")
      store.createIndex("disabled", "disabled")
      store.createIndex("type, disabled", ["type", "disabled"])
      await transaction.done
    }
  }

  async init(data) {
    // await super.init("applications", [
    //   { name: "obj1", groups: ["group1", "group2"] },
    //   { name: "obj2", groups: ["group2", "group3"] }
    // ])
    await super.init("cron", data)
    return this
  }
}

export class ApplicationDB extends DB {
  static cron_columns = [
    "Id", "Name", "Description", "Lang",
    "Picture", "Style", "URL"
  ]

  constructor() {
    super("Laucher", 1)
  }

  async create(db, oldVersion, transaction) {
    if (oldVersion === 0) {
      const store = db.createObjectStore("applications", { keyPath: "Name" })
      await transaction.done
    }
  }

  async init(data) {
    await super.init("applications", data)
    return this
  }
}
