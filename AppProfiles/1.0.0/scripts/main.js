import { debug } from "../../../import/scripts/etc.js"
import { DB } from "../../../import/scripts/db.js"
import { App } from "../../../import/scripts/App.js"
import { Obj } from "../../../import/scripts/Obj.js"
import { md5 } from "../../../import/scripts/md5.js"
import { api } from "../../../import/scripts/api.js"
import { Label } from "../../../import/scripts/Label.js"
import { Form } from "../../../import/scripts/Form.js"
import { Tabs } from "../../../import/scripts/Tabs.js"
import { Button } from "../../../import/scripts/Button.js"

const Password = {
  minLength: 8,
  permissible: "a-zA-Z0-9!@#$%^&*()-_=+[]{}<>",
  necessarily: {
    uppercase: 2,
    digits: 2,
    special: 2
  },
  validation: new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})")
}

//******************************************************************************
class Application extends App {
  static async getInstance(kvargs) {
    const instance = new Application(kvargs)
    try {
      instance.data = await instance.getData()
    } catch(err) {
      console.error(err) }
    instance.show()
  }

  async getData() {
    const db = new DB("Laucher", 1)
    const data = (await db.get("user"))[0]
    data.profile = data.profiles[data.profile]
    debug("Profile", data)
    return data
  }

  show() {
    super.show()
    if (this.data.profile.name === "Anonimous") {
      const tabs = new Tabs({ parent: this.element })
      tabs.addTab("Autorization", parent => {
        const form = new Form({ parent: parent })
        form.addField({ id: "login", label: "Login:", field: Obj.createElement({ tagName: "input", type: "text" }) })
        let field = form.addField({ id: "password", label: "Password:",
          field: Obj.createElement({ tagName: "input", type: "password",
            tips: `Длина: ${Password.minLength} или более символов<br>Допустимые символы: ${Password.permissible}<ul>Обязательно:<li>${Password.necessarily.uppercase} символа в верхнем регистре<li>${Password.necessarily.digits} цифры<li>${Password.necessarily.special} спецсимвола</ul>`
          })
        })
        field.setAttribute("required", "required")
        field.setAttribute("pattern", Password.validation)
        form.addButton("Ok", Button.Ok({ events: {"click": async evn => {
          let res = await api({ cmd: "auth", login: form.login.value, password: md5(form.password.value) })
console.log(res)
        }} }))
        form.show()
field.classList.add("Password")
console.log(field)
      })
      tabs.addTab("Registration", parent => {
        const form = new Form({ parent: parent })
        form.addField({ id: "login", label: "Login:", field: Obj.createElement({ tagName: "input", type: "text" }) })
        const tips = `<b>Длина:</b> ${Password.minLength} или более символов<br><b>Допустимые символы:</b> ${Password.permissible}<ul><b>Обязательно:</b><li>${Password.necessarily.uppercase} символа в верхнем регистре<li>${Password.necessarily.digits} цифры<li>${Password.necessarily.special} спецсимвола</ul>`
        let field = form.addField({ id: "password", label: "Password:",
          field: Obj.createElement({ tagName: "input", type: "password", tips: tips })
        })
        field.setAttribute("pattern", Password.validation)
        field = form.addField({ id: "repeatPassword", label: "Repeat:",
          field: Obj.createElement({ tagName: "input", type: "password", tips: tips })
        })
        field.setAttribute("pattern", Password.validation)
        form.show()
      })
      tabs.show()
      tabs.toggle("Autorization")
    }

    const form = new Form({ parent: this.element })
    form.addField({ id: "user", label: "User:", field: Obj.createElement({ children: this.data.user.login }) })
    form.addField({ id: "passwd", label: "Change password:", field: Obj.createElement({
      tagName: "input", type: "password", children: this.data.user.login })
    })
    form.show()

    const tabs = new Tabs({ parent: this.element })
    for (const [_, profile] of Object.entries(this.data.profiles)) {
      tabs.addTab(profile.name, parent => {
        const layout = Obj.createElement({ parent: parent, classList: ["HLayout", "Profile-HLayout"] })
        const picElement = Obj.createElement({ tagName: "img", parent: layout, classList: ["Avatar"],
          tips: "Change Avatar", events: {"click": evn => console.log("Change Avatar")} })
        picElement.src = profile.picture
        const form = new Form({ parent: layout })
        form.addField({ id: "ownerId", label:"ownerId", label: "Profile OwnerId:", field: Obj.createElement({ children: profile.ownerId }) })
        form.addField({ id: "profileName", label:"Profile Name:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.name }) })
        form.addField({ id: "firstName:", label:"FirstName:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.firstName }) })
        form.addField({ id: "lastName:", label:"LastName:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.lastName }) })
        form.addField({ id: "birthday:", label:"Birthday:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.birthday }) })
        form.addField({ id: "gender:", label:"Gender:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.gender }) })
        form.addField({ id: "countries:", label:"Countries:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.countries }) })
        form.addField({ id: "langs:", label:"Langs:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.langs }) })
        form.addField({ id: "shortDescr:", label:"ShortDescr:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.shortDescr }) })
        form.addField({ id: "description:", label:"Description:", field: Obj.createElement({ tagName: "input", type: "text", value: profile.description }) })
        form.show()
      })
    }
    tabs.show()
    tabs.toggle(0)
  }

  hide() {
    super.hide()
  }
}

//******************************************************************************
window.addEventListener("load", async () => {
  Application.getInstance({ parent: document.body, classList: ["Profiles"] })
})
