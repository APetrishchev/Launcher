import { Obj } from "../../../lib/1.0.0/Obj.js"
import { App } from "../../../lib/1.0.0/App.js"
import { wait, units } from "../../../lib/1.0.0/etc/etc.js"
import { Form } from "../../../lib/1.0.0/form/Form.js"
import { Table } from "../../../lib/1.0.0/table/Table.js"
import { ProgressBar } from "../../../lib/1.0.0/progressbar/ProgressBar.js"
import { Gauge } from "../../../lib/1.0.0/gauge/Gauge.js"

const refreshInterval = 15000

// async function api(network) {
function api(network) {
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
// 			this.tabs["Addresses"].rows = await api(this.network)
// 		}
		this.tabs["Addresses"].update = () => {
			if (this.tabs["Addresses"].rows === null) {
				this.tabs["Addresses"].rows = api(this.network)
				this.clearData(this.tabs["Addresses"])
			}
		}
// 		window.setInterval(() => {console.log(this), this.tabs.tab.show()}, refreshInterval)
	}
}


export class Application extends App {
	static async getInstance() {
		const instance = new Application()
		await instance.show()
	}

	constructor(kvargs) {
		super(kvargs)
		this.classList = ["MonitorIT"]
	}

	async show() {
		// super.show()
		const tableMonitorIT = new Table({
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
				}
			]
		})

		tableMonitorIT.tabs["Networks"].update = () => {
			tableMonitorIT.tabs["Networks"].rows = [
				{
					name: "172.28.141.0/24",
					network: "172.28.141.0/24",
					gateway: "172.28.141.249",
					disabled: 0,
					description: "",
					spoiler: new TableAddresses({ network: "172.28.141.0/24" })
				},
				{
					name: "172.28.138.0/24",
					network: "172.28.138.0/24",
					gateway: "172.28.138.249",
					disabled: 0,
					description: "",
					spoiler: new TableAddresses({ network: "172.28.138.0/24" })
				},
				{
					name: "172.28.179.0/24",
					network: "172.28.179.0/24",
					gateway: "172.28.179.249",
					disabled: 0,
					description: "",
					spoiler: new TableAddresses({ network: "172.28.179.0/24" })
				}
			]
		}
		tableMonitorIT.show()
		tableMonitorIT.toggle("Networks")
}

	async update() {
	}

	hide() {
		super.hide()
	}
}


window.addEventListener("load", async () => {
	await Application.getInstance()
})
