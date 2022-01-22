import { Error } from "./error.js"


export async function api(data) {
	let res
	try {
		console.log(">>> api:", data)
		data.params = data.params || {}
		const resp = await fetch(`${data.host || ""}/api`, {
			method: "POST",
			mode: "cors",
			credentials: "include",
			headers: {"Content-Type": "application/json;charset=utf-8"},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			cache: "no-store",
			body: JSON.stringify(data)
		})
		console.group("<<< api:", data)
		res = await resp.json()
		if (res.error.code !== Error.NoError.code) {
			console.log("error:", res.error.msg)
		} else {
			console.log("results:", res.results)
		}
	} catch (err) {
		console.error("response:", err)
		res = {error: "", results: null}
	}
	console.groupEnd()
	return res
}
