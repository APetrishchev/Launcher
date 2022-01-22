from lib.crypto import md5
from lib.database import Db
from AppLauncher.backend.sessions import Session
from AppLauncher.backend.users import User
from AppLauncher.backend.accounts import Account
from AppLauncher.install.install_model import Install as ModelsInstall

class Install(ModelsInstall):
	def run(self):
		self.createTables(Session)
		self.createTables(User)
		self.createTables(Account)
		usr = User(
			firstName = "Andrey",
			lastName = "Petrishchev",
			description = "Administrator",
			tags = "Admin",
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "admin",
			password = md5("12345"),
			tags = "master",
			description = "Administrators master account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "zbx_win",
			password = md5("54321"),
			tags = "Win",
			description = "Windows installer account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "zabbix_win",
			password = md5("54321"),
			tags = "Win",
			description = "Windows installer account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "zabbixkg_win",
			password = md5("54123"),
			tags = "Win",
			description = "Windows installer account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "zbx_installer",
			password = "In5tUsr#48",
			tags = "Nix",
			description = "Nix installer account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "zabbix_lin",
			password = md5("54321"),
			tags = "Nix",
			description = "Nix installer account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "zabbixkg_lin",
			password = md5("54123"),
			tags = "Nix",
			description = "Nix installer account"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "snmp_public",
			password = "public",
			tags = "SNMP",
			description = "SNMP"
		).add()
		print(acc)

		usr = User(
			firstName = "Viktor",
			lastName = "Maslov",
			description = "Network Administrator",
			tags = "Networks Addresses NetDevices"
		).add()
		acc = Account(
			ownerId = usr.id,
			login = "VMaslov",
			password = md5("12345"),
			tags = "master",
			description = "Network Administrator master account"
		).add()
		Db.commit()
		return self.results
