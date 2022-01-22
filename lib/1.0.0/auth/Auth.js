import { Obj } from "../Obj.js"
import { delay } from "../etc/etc.js"
import { fade } from "../fade/Fade.js"

export async function auth(kvargs = {}) {
	// fade()
	const element = Obj.createElement({
		parent: document.body,
		classList: ["Auth"]
	})
	const titleElement = Obj.createElement({
		parent: element,
		classList: ["Auth-Title"],
		children: "Авторизация"
	})
	const formElement = Obj.createElement({
		parent: element,
		classList: ["Auth-Form"],
	})
	const loginElement = Obj.createElement({
		tagName: "input",
		parent: formElement,
		classList: ["Auth-Input"], // {{ error }}
		type: "text",
		name: "login",
		placeholder: "User name",
		autofocus: "autofocus"
	})
	if (kvargs.userName) {
		loginElement.value = kvargs.userName
		loginElement.disabled = true
	}
	const passwdElement = Obj.createElement({
		tagName: "input",
		parent: formElement,
		classList: ["Auth-Input"], // {{ error }}
		type: "password",
		name: "passwd",
		placeholder: "Password"
	})

	let clicked = false
	const submitElement = Obj.createElement({
		tagName: "input",
		parent: formElement,
		classList: ["Button", "Auth-Button"], // {{ error }}
		type: "submit",
		value: "Отправить",
		disabled: true,
		events: {"click": evn => {
			evn.preventDefault()
			clicked = true
		}}
	})
	submitElement.disabled = false
	// const element = Obj.createElement({
	// 	parent: document.body,
	// 	classList: ["HLayout"],
	// })
	// const passwdElement = Obj.createElement({
	// 	id: "Password",
	// 	parent: element,
	// 	tagName: "input",
	// 	type: "password",
	// 	classList: ["Password"],
	// 	placeholder: "Input your master password",
	// })
	// let clicked = false
	// const buttonOk = Button.Ok({
	// 	parent: element,
	// 	disabled: true,
	// 	classList: ["Form-Auth-ButtonOk"],
	// 	events: {"click": async evn => {clicked = true}}
	// })
	// buttonOk.disabled = false
	// buttonOk.show()
	const errorElement = Obj.createElement({
		id: "Error",
		parent: element,
		classList: ["Error"]
	})
	while (!clicked) {
		await delay(300) }
	element.remove()
	// fade(false)
	return passwdElement.value
}
