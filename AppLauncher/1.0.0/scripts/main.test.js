import { Application } from "./main.js"

test("AppLauncher", () => {
  expect.extend({
    async toBe() {
      const expected = "Launcher"
      const obj = await Application.getInstance({ classList: ["Launcher"] })
      if (obj.className === expected) {
        return {
          message: () => "",
          pass: true,
        }
      } else {
        return {
          message: () => `Expected: ${expected}\nReceived: ${obj.className}`,
          pass: false,
        }
      }
    }
  })
})
