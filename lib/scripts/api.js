export async function api(data) {
console.log("+++ api +++", data)
  data.params = data.params || {}
  const res = await fetch("/api", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {"Content-Type": "application/json"},
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data)
  })
  return await res.json()
}
