import { DB } from "../../../../import/front/scripts/db.js"

//******************************************************************************
export class BinPosCode {
  constructor(date, toDate = null) {
    console.log(`\n>>> BinPosCode Period ${date} ${toDate}`)
    this.year = date.getYear()
    this.month = 0
    this.monthDay = 0
    this.weekDay = 0
    this.hour = 0
    this.minute = 0n

    let dateWeekDay = date.getDay() || 7
    if (toDate) {
      if (toDate.getYear() - date.getYear() > 2) {
        this.month = 0x0fff
        this.monthDay = 0x7fffffff
        this.weekDay = 0x7f
        this.hour = 0x00ffffff
        this.minute = 0x0fffffffffffffffn
      }
      else {
        let months = 0
        if (toDate.getMonth() < date.getMonth()) {
          months = 13 - date.getDate() + toDate.getDate()
          for (let num = date.getMonth(); num < 13; num++) {
            this.month |= Math.pow(2, (num - 1)) }
          for (let num = 1; num < toDate.getMonth() + 1; num++) {
            this.month |= Math.pow(2, (num - 1)) }
        }
        else {
          months = toDate.getMonth() - date.getMonth() + 1
          for (let num = date.getMonth(); num < toDate.getMonth() + 1; num++) {
            this.month |= Math.pow(2, (month - 1)) }
        }

        let days = 0
          if (months > 2 || months == 2 && toDate.getDate() >= date.getDate()) {
            days = 31
            this.monthDay = 0x7fffffff
          }
          else if (toDate.getDate() < date.getDate()) {
            days = 32 - date.getDate() + toDate.getDate()
            for (let num = date.getDate(); num < 32; num++) {
              this.monthDay |= Math.pow(2, (num - 1)) }
            for (let num = 1; num < toDate.getDate() + 1; num++) {
              this.monthDay |= Math.pow(2, (num - 1)) }
          }
          else {
            days = toDate.getDate() - date.getDate() + 1
            for (let num = date.getDate(); num < toDate.getDate() + 1; num++) {
              this.monthDay |= Math.pow(2, (num - 1)) }
          }

        let toDateWeekDay = toDate.getDay() || 7
        if (days > 6) {
          this.weekDay = 0x7f }
        else if (toDateWeekDay < dateWeekDay) {
          for (let num = dateWeekDay - 1; num < 7; num++) {
            this.weekDay |= Math.pow(2, num) }
          for (let num = 0; num < toDateWeekDay; num++) {
            this.weekDay |= Math.pow(2, num) }
        }
        else {
          for (let num = dateWeekDay - 1; num < toDateWeekDay; num++) {
            this.weekDay |= Math.pow(2, num) }
        }

        let hours = 0
        if (days > 2 || days == 2 && toDate.getHours() >= date.getHours()) {
          hours = 24
          this.hour = 0x00ffffff
        }
        else if (toDate.getHours() < date.getHours()) {
          hours = 24 - date.getHours() + toDate.getHours()
          for (let num = date.getHours(); num < 24; num++) {
            this.hour |= Math.pow(2, num) }
          for (let num = 0; num < toDate.getHours() + 1; num++) {
            this.hour |= Math.pow(2, num) }
        }
        else {
          hours = toDate.getHours()
          for (let num = date.getHours(); num < toDate.getHours() + 1; num++) {
            this.hour |= Math.pow(2, num) }
        }
      if (hours > 2 || hours == 2 && toDate.getMinutes() >= date.getMinutes()) {
        this.minute = 0x0fffffffffffffffn }
      else if (toDate.getMinutes() < date.getMinutes()) {
        for (let num = date.getMinutes(); num < 60; num++) {
          this.minute |= BigInt(Math.pow(2, num)) }
        for (let num = 0; num < toDate.getMinutes() + 1; num++) {
          this.minute |= BigInt(Math.pow(2, num)) }}
        else {
          for (let num = date.getMinutes(); num < toDate.getMinutes() + 1; num++) {
            this.minute |= BigInt(Math.pow(2, num)) }
        }
      }
    }
    else {
      this.month = Math.pow(2, (date.getMonth() - 1))
      this.monthDay = Math.pow(2, (date.getDate() - 1))
      this.weekDay = Math.pow(2, (dateWeekDay - 1))
      this.hour = Math.pow(2, date.getHours())
      this.minute = BigInt(Math.pow(2, date.getMinutes()))
      return this
    }
  }

  match(binPosCode) {
    if (binPosCode.months & Cron.monthsEnableMask && !binPosCode.months & Cron.monthsMask & this.month) {
      return false }
    if (binPosCode.monthDays & Cron.monthDaysEnableMask && !binPosCode.monthDays & Cron.monthDaysMask & this.monthDay) {
      return false }
    if (binPosCode.weekDays & Cron.weekDaysEnableMask) {
      if (binPosCode.weekDays & Cron.weekDaysSwithMask) {
        if (!binPosCode.weekDays & Cron.weekDaysMask & this.weekDay) {
          return false }
      }
      else if (!binPosCode.weekDays & Cron.weekDaysAnyMask & this.weekDay) {
        return false }
    }
    if (binPosCode.hours & Cron.hoursEnableMask && !binPosCode.hours & Cron.hoursMask & this.hour) {
      return false }
    if (BigInt(binPosCode.minutes) & Cron.minutesEnableMask
    && !(BigInt(binPosCode.minutes) & Cron.minutesMask & this.minute)) {
      return false }
    return true
  }

  posBinCode(binPosCode, lenght, pos = 0) {
    let result = []
    while (pos < lenght) {
      if (binPosCode & 0x1) {
        result.push(pos++) }
      binPosCode >>= 1
    }
    return result
  }

  getEvents(event) {
    let months = []
    if (event.months & Cron.monthsEnableMask) {
      for (let num = 0; num < 13; num++) {
        if (event.months & Math.pow(2, (num - 1))) {
          months.push(num) }
        else {
          months = this.posBinCode(this.month, 13, 1) }
      }}
    let monthDays = []
    if (event.monthDays & Cron.monthDaysEnableMask) {
      for (let num = 0; num < 32; num++) {
        if (event.monthDays & Math.pow(2, (num - 1))) {
          monthDays.push(num) }
        else {
          monthDays = this.posBinCode(this.monthDay, 32, 1) }
      }}
    let hours = []
    if (event.hours & Cron.hoursEnableMask) {
      for (let num = 0; num < 24; num++) {
        if (event.hours & Math.pow(2, num)) {
          hours.push(num) }
        else {
          hours = this.posBinCode(this.hour, 24) }
      }}
    let minutes = []
    if (event.minutes & Cron.minutesEnableMask) {
      for (let num = 0; num < 60; num++) {
        if (event.minutes & BigInt(Math.pow(2, minute))) {
          minutes.push(num) }
        else {
          minutes = this.posBinCode(this.minute, 60) }
      }}
    let events = []
    for (month of months) {
      for (day of monthDays) {
        for (hour of hours) {
          for (minute of minutes) {
            try {
              events.push(new Date(this.year, month, day, hour, minute)) }
            catch(err) {}
    }}}}
    return events
  }

}

//******************************************************************************
export class CronDB extends DB {
  async create(db) {
    let cron = db.createObjectStore("cron", { keyPath: "id" })
    cron.createIndex("type", "type")
    cron.createIndex("disabled", "disabled")
    cron.createIndex("type, disabled", ["type", "disabled"])
    this.newVersion = true
  }

  async init() {
    if (!this.newVersion) {
      return }
    let resp = await fetch("AppCalendarWidget/cron.json")
    if (resp.ok) {
      let json = await resp.json()
      let tx = this.connection.transaction("cron", "readwrite")
      let cron = tx.objectStore("cron")
      for (const obj of json) {
        cron.put(obj) }
      await tx.done
      return 0
    }
    else {
      return `HTTPError: ${resp.status}` }
  }

  static async connect(dbName, version) {
    let db = new CronDB()
    await db.connect(dbName, version)
    let err = await db.init()
    if (err) {
      console.log(err) }
    return db
  }

  async get(kvargs) {
    return await super.get("cron", kvargs.key, kvargs.val)
  }

  async add(obj) {
    return await super.add("cron", obj)
  }

  async clear() {
    await super.clear("cron")
  }
}

//******************************************************************************
export class Cron {
  static monthsEnableMask = 0x8000
  static monthsMask = 0x0fff

  static monthDaysEnableMask = 0x80000000
  static monthDaysMask = 0x7fffffff

  static weekDaysEnableMask = 0x080000000000
  static weekDaysSwithMask = 0x000000000080
  static weekDaysAnyMask = 0x00000000007f
  static weekDaysMask = 0x000fffffff00

  static hoursEnableMask = 0x80000000
  static hoursMask = 0x00ffffff

  static minutesEnableMask = 0x8000000000000000n
  static minutesMask = 0x0fffffffffffffffn

  static async hasEvent(date, toDate, kvargs) {
    let db = await CronDB.connect("CronDB", 1)
    let result = await db.get(kvargs)
    db.close()
    let binPosCode = new BinPosCode(date, toDate)
    let holidays = []
    let events = []
    for (const event of result) {
      if (binPosCode.match(event)) {
        if (event.type == "Holiday") {
          holidays.push(event) }
        else {
          events.push(event) }
      }
    }
    return [events, holidays]
  }

  static async getEvents(date, toDate, kvargs) {
    let db = await CronDB.connect("CronDB", 1)
    let result = await db.get(kvargs)
    // db.close()
    let binPosCode = new BinPosCode(date, toDate)
    let events = {}
    let idx = 0
    for (const event of result) {
      if (binPosCode.match(event)) {
        if (kvargs.expanded) {
          for (const time of binPosCode.getEvents(event)) {
            events[time] = {id: event.id, type: event.type,
            name: event.name, descr: event.descr, duration: event.duration,
            action: event.action, cmdParams: event.cmdParams}
          }}
        else {
          events[idx] = {id: event.id, type: event.type,
            name: event.name, descr: event.descr, duration: event.duration,
            action: event.action, cmdParams: event.cmdParams}
          idx++ }
      }
    }
    return events
  }
}
