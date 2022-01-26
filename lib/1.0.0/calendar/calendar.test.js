import { Calendar } from "./calendar.js"

test("Calendar", () => {
  expect(Calendar.getDaysInMonth(2022, 1)).toBe(31)

  expect.extend({
    toBe() {
      const expected = "Calendar MyCalendar"
      const cal = new Calendar({ classList: ["Calendar", "MyCalendar"] })
      if (cal.className === expected) {
        return {
          message: () => "Calendar",
          pass: true,
        }
      } else {
        return {
          message: () => `Expected: ${expected}\nReceived: ${cal.className}`,
          pass: false,
        }
      }
    }
  })

})
