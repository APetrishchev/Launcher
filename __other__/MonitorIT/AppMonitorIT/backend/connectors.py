from lib.aobject import Error, ExceptionApp
from AppLauncher.backend.accounts import Account
from AppMonitorIT.backend.addresses import Address
# from enum import IntEnum
userId = 1

class Connectors(object):
	error = "Error"

	def try_(self, address):
		self.address = address
		print(f"\n{self.address.ip} {self.address.connected} {self.address.authorized}")
		for connector in self.connectorsGenerator():
			for account in self.accountsGenerator(connector.name):
				try:
					connector.connect(self.address.ip, account)
					self.address.setConnected(connector.name)
					self.address.setAuthorized(account.login)
					return connector
				except ExceptionApp as exc:
					if exc.errCode == Error.ConnError.code:
						break
					if exc.errCode == Error.AuthError.code:
						continue
					raise exc
				except:
					raise
			else:
				self.address.setAuthorized(Connectors.error)
		else:
			self.address.setConnected(Connectors.error)
			self.address.setAuthorized(Connectors.error)
		return None

	def connectorsGenerator(self):
		connectors_ = {item().name: item for item in connectors}
		if self.address.connected and self.address.connected in connectors_:
			yield connectors_[self.address.connected]()
		for name, Connector in connectors_.items():
			if name == self.address.connected:
				continue
			yield Connector()

	def accountsGenerator(self, name):
		accounts = {item.login: item for item in Account.getAccounts(where=f'ownerId="{userId}" AND tags LIKE "%{name}%"').values()}
		if self.address.authorized in accounts:
			yield accounts[self.address.authorized]
		for login, account in accounts.items():
			if login != self.address.authorized:
				yield account

class Connector(object):
	@property
	def name(self):
		return self.__class__.__name__

class Win(Connector):
	def connect(self, ip, account):
		# return connect(ip)...
		# if account.login == "zabbixkg_win":
		# raise ExceptionApp(Error.AuthError)
		raise ExceptionApp(Error.ConnError)

class Nix(Connector):
	def connect(self, ip, account):
		if ip in ("172.28.141.199", "172.28.141.200"):
			from pexpect.pxssh import ExceptionPxssh
			from lib.remote.nix import Remote
			# try:
			Remote(
				connector = self,
				host = ip,
				user = account.login,
				passwd = account.password,
				sudo = True,
				log = "/usr/lib/zabbix/externalscripts/Launcher/log/pxssh.log"
			)
			return self.connection
		raise ExceptionApp(Error.ConnError)

	def close(self):
		self.connection.exit()

class SNMP(Connector):
	def connect(self, ip, account):
		# return connect(ip)...
		raise ExceptionApp(Error.ConnError)

connectors = (Nix, Win, SNMP)
