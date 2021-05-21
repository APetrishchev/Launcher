import { DB } from "./db.js"
import { tokens } from "../../../ini.js"

//******************************************************************************
class BinPosCode {
  static doc = `
new BinPosCode(date1:Date, date2:Date = null) - создает объект со свойствами
  months, monthDays, weekDays, hours, minutes в бинарно-позиционном коде

Methods:
  match(binPosCode) - возврвщает true если binPosCode совпадает с объектом класса, иначе false
  posBinCode(binPosCode, lenght, pos = 0) - возврвщает массив номеров позиций bit равных 1
`

  static monthsEnableMask = 0x8000
  static allMonths = 0x0fff

  static monthDaysEnableMask = 0x80000000
  static allMonthDays = 0x7fffffff

  static weekDaysEnableMask = 0x080000000000
  static weekDaysSwithMask = 0x000000000080
  static allShortWeekDays = 0x00000000007f
  static allLongWeekDays = 0x000fffffff00

  static hoursEnableMask = 0x80000000
  static allHours = 0x00ffffff

  static minutesEnableMask = 0x8000000000000000n
  static allMinutes = 0x0fffffffffffffffn

  static posBinCode(binPosCode, lenght, pos = 0) {
    let result = []
    let one = (typeof binPosCode === "bigint") ? 1n : 1
    while (pos < lenght) {
      if (binPosCode & one) {
        result.push(pos)
      }
      binPosCode >>= one
      pos++
    }
    return result
  }

  constructor(date1, date2 = null) {
    this.year = date1.getFullYear()
    this.months = 0
    this.monthDays = 0
    this.weekDays = 0
    this.hours = 0
    this.minutes = 0n

    let dateWeekDay = date1.getDay() || 7
    if (date2) {
      let years = date2.getFullYear() - this.year
      if (years > 1 || years > 0 && date1.getMonth() <= date2.getMonth()) {
        this.months = BinPosCode.allMonths
        this.monthDays = BinPosCode.allMonthDays
        this.weekDays = 0x7f
        this.hours = BinPosCode.allHours
        this.minutes = BinPosCode.allMinutes
        return
      }
      else {
        let months = 0
        if (date1.getMonth() > date2.getMonth()) {
          months = 12 - date1.getMonth() + date2.getMonth()
          for (let num = date1.getMonth() + 1; num < 13; num++) {
            this.months |= 2 ** (num - 1) }
          for (let num = 1; num <= date2.getMonth() + 1; num++) {
            this.months |= 2 ** (num - 1) }
        }
        else {
          months = date2.getMonth() - date1.getMonth()
          for (let num = date1.getMonth() + 1; num <= date2.getMonth() + 1; num++) {
            this.months |= 2 ** (num - 1) }
        }

        let days = 0
        if (months > 1 || months > 0 && date1.getDate() <= date2.getDate()) {
            this.monthDays = BinPosCode.allMonthDays
            this.weekDays = 0x7f
            this.hours = BinPosCode.allHours
            this.minutes = BinPosCode.allMinutes
            return
          }
          else if (date1.getDate() > date2.getDate()) {
days = 31 - date1.getDate() + date2.getDate()
            for (let num = date1.getDate(); num < 32; num++) {
              this.monthDays |= 2 ** (num - 1) }
            for (let num = 1; num < date2.getDate() + 1; num++) {
              this.monthDays |= 2 ** (num - 1) }
          }
          else {
            days = date2.getDate() - date1.getDate()
            for (let num = date1.getDate(); num < date2.getDate() + 1; num++) {
              this.monthDays |= 2 ** (num - 1) }
          }

        let toDateWeekDay = date2.getDay() || 7
        if (days > 6) {
          this.weekDays = 0x7f }
        else if (toDateWeekDay < dateWeekDay) {
          for (let num = dateWeekDay - 1; num < 7; num++) {
            this.weekDays |= 2 ** num }
          for (let num = 0; num < toDateWeekDay; num++) {
            this.weekDays |= 2 ** num }
        }
        else {
          for (let num = dateWeekDay - 1; num < toDateWeekDay; num++) {
            this.weekDays |= 2 ** num }
        }

// console.log("days:", days)
        let hours = 0
        if (days > 1 || days > 0 && date1.getHours() <= date2.getHours()) {
// console.log("<<< 1")
          this.hours = BinPosCode.allHours
          this.minutes = BinPosCode.allMinutes
          return
        }
        else if (date1.getHours() > date2.getHours()) {
// console.log("<<< 2")
          hours = 23 - date1.getHours() + date2.getHours()
          for (let num = date1.getHours(); num < 24; num++) {
            this.hours |= 2 ** num }
          for (let num = 0; num < date2.getHours() + 1; num++) {
            this.hours |= 2 ** num }
        }
        else {
// console.log("<<< 3")
          hours = date2.getHours() - date1.getHours()
          for (let num = date1.getHours(); num < date2.getHours() + 1; num++) {
            this.hours |= 2 ** num }
        }

// console.log("hours:", hours)

        if (hours > 1 || hours > 0 && date1.getMinutes() <= date2.getMinutes()) {
          this.minutes = BinPosCode.allMinutes }
        else if (date1.getMinutes() > date2.getMinutes()) {
          for (let num = date1.getMinutes(); num < 60; num++) {
            this.minutes |= BigInt(2 ** num) }
          for (let num = 0; num < date2.getMinutes() + 1; num++) {
            this.minutes |= BigInt(2 ** num) }
        }
        else {
          for (let num = date1.getMinutes(); num < date2.getMinutes() + 1; num++) {
            this.minutes |= BigInt(2 ** num) }
        }
      }
    }
    else {
      this.months = 2 ** (date1.getMonth())
      this.monthDays = 2 ** (date1.getDate() - 1)
      this.weekDays = 2 ** (dateWeekDay - 1)
      this.hours = 2 ** date1.getHours()
      this.minutes = BigInt(2 ** date1.getMinutes())
    }
  }

  match(event) {
    if (event.months & BinPosCode.monthsEnableMask && !(event.months & BinPosCode.allMonths & this.months)) {
      return false }
    if (event.monthDays & BinPosCode.monthDaysEnableMask && !(event.monthDays & BinPosCode.allMonthDays & this.monthDays)) {
      return false }
    if (event.weekDays & BinPosCode.weekDaysEnableMask) {
      if (event.weekDays & BinPosCode.weekDaysSwithMask) {
        if (!(event.weekDays & BinPosCode.allLongWeekDays & this.weekDays)) {
          return false }
      }
      else if (!(event.weekDays & BinPosCode.allShortWeekDays & this.weekDays)) {
        return false }
    }
    if (event.hours & BinPosCode.hoursEnableMask && !(event.hours & BinPosCode.allHours & this.hours)) {
      return false }
    if (event.minutes & BinPosCode.minutesEnableMask
    && !(event.minutes & BinPosCode.allMinutes & this.minutes)) {
      return false }
    return true
  }

  expand(event) {
    let months = []
    if (event.months & BinPosCode.monthsEnableMask) {
      for (let num = 0; num < 13; num++) {
        if (event.months & 2 ** (num - 1)) {
          months.push(num) }
      }
    }
    else {
      months = BinPosCode.posBinCode(this.months, 13, 1) }
    let monthDays = []
    if (event.monthDays & BinPosCode.monthDaysEnableMask) {
      for (let num = 0; num < 32; num++) {
        if (event.monthDays & 2 ** (num - 1)) {
          monthDays.push(num) }
      }
    }
    else {
      monthDays = BinPosCode.posBinCode(this.monthDays, 32, 1) }
    let hours = []
    if (event.hours & BinPosCode.hoursEnableMask) {
      for (let num = 0; num < 24; num++) {
        if (event.hours & 2 ** num) {
          hours.push(num) }
      }
    }
    else {
      hours = BinPosCode.posBinCode(this.hours, 24) }
    let minutes = []
    if (event.minutes & BinPosCode.minutesEnableMask) {
      for (let num = 0; num < 60; num++) {
        if (event.minutes & BigInt(2 ** num)) {
          minutes.push(num) }
      }
    }
    else {
      minutes = BinPosCode.posBinCode(this.minutes, 60) }
    let events = []
    for (const month of months) {
      for (const day of monthDays) {
        for (const hour of hours) {
          for (const minute of minutes) {
            try {
              events.push(new Date(this.year, month, day, hour, minute)) }
            catch (err) {
              console.error(err) }
    }}}}
    return events
  }
}

//******************************************************************************
export class Cron {
  constructor(db) {
    this.db = db
  }

  async hasEvent(date1, date2, kvargs) {
    let result = await this.db.get("cron", kvargs.key, kvargs.val)
    let binPosCode = new BinPosCode(date1, date2)
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

  async getEvents(date, kvargs) {
    let events = {}
    // date =        new Date("2021-08-24T17:24:00")
    // kvargs.date = new Date("2021-08-24T17:34:00")
    let binPosCode = new BinPosCode(date, kvargs.date)
    console.groupCollapsed(`>>> BinPosCode:\n  date1: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`)
    if (kvargs.date) {
      console.log(`  date2: ${kvargs.date.getFullYear()}-${kvargs.date.getMonth() + 1}-${kvargs.date.getDate()} ${kvargs.date.getHours()}:${kvargs.date.getMinutes()}`) }
    console.log(`  months: x${binPosCode.months.toString(16)}`, BinPosCode.posBinCode(binPosCode.months, 13, 1))
    console.log(`  monthDays: x${binPosCode.monthDays.toString(16)}`, BinPosCode.posBinCode(binPosCode.monthDays, 32, 1))
    console.log(`  weekDays: x${binPosCode.weekDays.toString(16)}`)
    console.log(`  hours: x${binPosCode.hours.toString(16)}`, BinPosCode.posBinCode(binPosCode.hours, 24))
    console.log(`  minutes: x${binPosCode.minutes.toString(16)}`, BinPosCode.posBinCode(binPosCode.minutes, 60))

    let results = await this.db.get("cron", kvargs.key, kvargs.val)
    let idx = 0
    for (const event of results) {
      if (binPosCode.match(event)) {
        if (kvargs.expanded) {
          for (const time of binPosCode.expand(event)) {
            events[time] = {id: event.id, type: event.type,
            name: event.name, descr: event.descr, timeout: event.timeout,
            action: event.action, params: event.params}
          }
        }
        else {
          events[idx++] = { id: event.id, type: event.type,
            name: event.name, descr: event.descr, timeout: event.timeout,
            action: event.action, params: event.params }
        }
      }
    }
    console.groupEnd()
    return events
  }
}
