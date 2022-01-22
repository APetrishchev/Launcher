import { Obj } from "../../../lib/1.0.0/Obj.js"
import { App } from "../../../lib/1.0.0/App.js"
import { delay, units } from "../../../lib/1.0.0/etc/etc.js"
import { fade } from "../../../lib/1.0.0/fade/Fade.js"
import { Form } from "../../../lib/1.0.0/form/Form.js"
import { Table } from "../../../lib/1.0.0/table/Table.js"
import { Button } from "../../../lib/1.0.0/button/Button.js"
import { auth } from "../../../lib/1.0.0/auth/Auth.js"
import { api as api_} from "../../../lib/1.0.0/api.js"
import { ProgressBar } from "../../../lib/1.0.0/progressbar/ProgressBar.js"
import { Gauge } from "../../../lib/1.0.0/gauge/Gauge.js"
import { Error } from "./error.js"

const refreshInterval = 15000
let backends = [
	{
		id: "SkyMobile",
		name: "SkyMobile",
		host: "https://172.28.138.180/monitor_it",
		username: "admin",
		password: "12345",
		description: "lkhlkhkk"
	}
]

// async function _api_(network) {
function _api_(network) {
	if (network === "172.28.138.0/24") {
		return [
			{
				ip: "172.28.138.125",
				name: "bi-srv001",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: "8778896798",
				disabled: 0,
				description: "Applications Server bi-srv001.nix.skymobile"
			},
			{
				ip: "172.28.138.128",
				name: "bi-srv002",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: "8778896798",
				disabled: 0,
				description: ""
			},
			{
				ip: "172.28.138.203",
				name: "bi-srv003",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: "8778896798",
				disabled: 0,
				description: ""
			},
			{
				ip: "172.28.138.198",
				name: "bi-srv004",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: "8778896798",
				disabled: 0,
				description: ""
			}
		]
	} else if (network === "172.28.141.0/24") {
		return [
			{
				ip: "172.28.141.145",
				name: "os-srv001",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: 555,
				disabled: 0,
				description: ""
			},
			{
				ip: "172.28.141.39",
				name: "os-srv002",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: 222,
				disabled: 0,
				description: ""
			},
			{
				ip: "172.28.141.44",
				name: "bi-tim001",
				availabled: 1,
				connected: "nix",
				authorized: "installer",
				lastChange: 444,
				disabled: 0,
				description: ""
			}
		]
	}
}


export class TableAddresses extends Table {
	constructor(kvargs) {
		super({
			id: "Addresses",
			behaviors: Table.RowAdd | Table.RowDelete,
			className: "Table",
			tabs: [{
				id: "Addresses",
				name: "Addresses",
				orderBy: ["Ip", 0],
				columns: [
					{id: "Ip", name: "IP", data: "ip", order: 1},
					{id: "Name", name: "Name", data: "name", order: 1},
					{id: "Avail", name: "Avail", data: "availabled", order: 1},
					{id: "Connected", name: "Connected", data: "connected", order: 1},
					{id: "Authorized", name: "Authorized", data: "authorized", order: 1},
					{id: "LastChange", name: "LastChange", data: "lastChange", order: 1},
					{id: "Disabled", name: "Disabled", data: "disabled", order: 1},
					{id: "Description", name: "Description", data: "description"}
				]
			}]
		})
		this.network = kvargs.network

// 		this.tabs["Addresses"].update = async () => {
// 			this.tabs["Addresses"].rows = await _api_(this.network)
// 		}
		this.tabs["Addresses"].update = () => {
			if (this.tabs["Addresses"].rows === null) {
				this.tabs["Addresses"].rows = _api_(this.network)
				this.clearData(this.tabs["Addresses"])
			}
		}
// 		window.setInterval(() => {console.log(this), this.tabs.tab.show()}, refreshInterval)
	}
}


export class Application extends App {
	static getInstance() {
		const instance = new Application()
		instance.show()
	}

	constructor(kvargs) {
		super(kvargs)
		this.classList = ["MonitorIT"]
	}

	async show() {
		await this.getBackend()
		this.tableMonitorIT = new Table({
			id: "MonitorIT",
			title: "IT-Мониторинг",
			parent: document.body,
			behaviors: Table.SaveButton|Table.CanselButton|Table.RowAdd|Table.RowDelete,
			className: "Table",
			tabs: [
				{
					id: "Networks",
					name: "Networks",
					orderBy: ["Name", 0],
					columns: [
						{id: "Name", name: "Name", data: "name", order: 1},
						{id: "Network", name: "Network", data: "network", order: 1},
						{id: "Gateway", name: "Gateway", data: "gateway"},
						{id: "Disabled", name: "Disabled", data: "disabled", order: 1},
						{id: "Description", name: "Description", data: "description"}
					]
				},
				{
					id: "Nodes",
					name: "Nodes",
					orderBy: ["Name", 0],
					columns: [
						{id: "Name", name: "Name", data: "name", order: 1},
						{id: "OS", name: "OS", data: "osName", order: 1},
						{id: "Auth", name: "Auth", data: "auth", order: 1},
						{id: "Agent", name: "Agent", data: "agent", order: 1},
						{id: "IPs", name: "IPs", data: "addresses"},
						{id: "Description", name: "Description", data: "description"}
					]
				},
				{
					id: "Alerts",
					name: "Alerts",
					orderBy: ["Time", 0],
					columns: [
						{id: "Time", name: "Time", data: "time", order: 1}
					]
				},
				{
					id: "Users",
					name: "Users",
					orderBy: ["NickName", 0],
					columns: [
						{id: "NickName", name: "NickName", data: "nickName", order: 1},
						{id: "Tags", name: "Tags", data: "tags", order: 1},
						{id: "Description", name: "Description", data: "description"},					]
				}
			]
		})

		this.tableMonitorIT.tabs["Networks"].update = async () => {
			const resp = await this.api({
				host: this.backend.host,
				appName: "MonitorIT",
				objName: "Network",
				methodName: "getNetworks"
			})
			if (resp.error.code === Error.NoError.code) {
				this.tableMonitorIT.tabs["Networks"].rows = []
				for (const row of resp.results) {
					row.spoiler = new TableAddresses({ network: row.network })
					this.tableMonitorIT.tabs["Networks"].rows.push(row)
				}
			}
			// [
			// 	{
			// 		name: "172.28.141.0/24",
			// 		network: "172.28.141.0/24",
			// 		gateway: "172.28.141.249",
			// 		disabled: 0,
			// 		description: "",
			// 		spoiler: new TableAddresses({ network: "172.28.141.0/24" })
			// 	},
			// 	{
			// 		name: "172.28.138.0/24",
			// 		network: "172.28.138.0/24",
			// 		gateway: "172.28.138.249",
			// 		disabled: 0,
			// 		description: "",
			// 		spoiler: new TableAddresses({ network: "172.28.138.0/24" })
			// 	},
			// 	{
			// 		name: "172.28.179.0/24",
			// 		network: "172.28.179.0/24",
			// 		gateway: "172.28.179.249",
			// 		disabled: 0,
			// 		description: "",
			// 		spoiler: new TableAddresses({ network: "172.28.179.0/24" })
			// 	}
			// ]
		}
		this.tableMonitorIT.show()
		this.tableMonitorIT.toggle("Networks")
	}

	async getBackend() {
		// const element = Obj.createElement({
		// 	id: "Backend",
		// 	parent: document.body,
		// 	classList: ["FormAuth"],
		// })
		Obj.createElement({
			parent: document.body,
			children: "Backends"
		})
		const elm = Obj.createElement({
			id: "Authorization",
			parent: document.body,
			classList: ["Auth-Backends"],
		})
		for (const backend of backends) {
			const btn = new Button({
				id: `ButtonBackEnd${backend.id}`,
				parent: elm,
				type: Button.Toggle,
				group: "BackendsGroup",
				classList: ["Auth-Backend", "HLayout"],
				children: [
					Obj.createElement({
						children: backend.name
					}),
					Obj.createElement({
						children: `Host: ${backend.host}`
					}),
					Obj.createElement({
						children: `UserName: ${backend.username}`
					}),
					Obj.createElement({
						children: backend.description
					})
				],
				events: {
					"click": evn => {
						this.backend = backend
					}
				}
			})
			btn.show()
		}
		new Button({
			id: "ButtonAddBackend",
			parent: elm,
			classList: ["Auth-Backend"],
			children: "+",
		}).show()
		while (!this.backend) {
			await delay(300) }
		// element.remove()
		Obj.clearElement(document.body)
	}

	async api(kvargs) {
		let res = await api_(kvargs)
		if (res.error.code === Error.NotAuth.code) {
			const passwd = await auth({userName: "Administrator"})
			res = await api_({
				host: this.backend.host,
				appName: "Launcher",
				objName: "Launcher",
				methodName: "auth",
				params: {
					login: this.backend.username,
					passwd: passwd // this.backend.password
				}
			})
			if (res.error.code === Error.NoError.code) {
				res = await api_(kvargs)
			}
		}
		return res
	}

	async update() {
	}

	hide() {
		super.hide()
	}
}


window.addEventListener("load", () => {
	Application.getInstance()
})
