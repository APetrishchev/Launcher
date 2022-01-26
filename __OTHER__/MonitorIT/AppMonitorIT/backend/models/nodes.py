from lib.database import Db
from lib.aobject import exception
table = "nodes"

class Node(Db):
	fields = "id,name,os,osName,auth,agent,addresses,description"

	def createTable():
		msg = []
		@exception(table)
		def crtTbl():
			Db.createTable(table, (
				"`id` VARCHAR(48) NOT NULL UNIQUE",
				"`name` VARCHAR(48)",
				"`os` VARCHAR(12)",
				"`osName` VARCHAR(48)",
				"`auth` CHAR(6)",
				"`agent` VARCHAR(24)",
				"`addresses` VARCHAR(255)",
				"`description` VARCHAR(255) DEFAULT ''",
			))
		msg.append(crtTbl())
		return msg

	def getNodes(**kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Node.fields
		return {item["id"]: Node(**item) for item in Db().getAll(table, **kvargs)}

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		super().__init__()
		self.id = getArg("id", None)
		self.name = getArg("name", None)
		self.os = getArg("os", None)
		self.osName = getArg("osName", None)
		self.auth = getArg("auth", None)
		self.agent = getArg("agent", "")
		self.addresses = getArg("addresses", "")
		self.description = getArg("description", "")

	def setId(self, val):
		if self.id != val:
			self.id = val
			self.isChanged = True

	def setName(self, val):
		if self.name != val:
			self.name = val
			self.isChanged = True

	def setOSName(self, val):
		if self.osName != val:
			self.osName = val
			self.isChanged = True

	def setOS(self, val):
		if self.os != val:
			self.os = val
			self.isChanged = True

	def setAuth(self, val):
		if self.auth != val:
			self.auth = val
			self.isChanged = True

	def setAgent(self, val):
		if self.agent != val:
			self.agent = val
			self.isChanged = True

	def setDescription(self, val):
		if self.description != val:
			self.description = val
			self.isChanged = True

	def get(self, **kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Node.fields
		results = super().get(table, **kvargs)
		if results:
			self.__dict__.update(results)
		return self

	def addAddress(self, ip):
		if not ip in self.addresses.split(" "):
			self.addresses = f"{self.addresses} {ip}"
			self.isChanged = True

	def removeAddress(self, ip):
		addresses = self.addresses.split(" ")
		if ip in addresses:
			addresses.remove(ip)
			self.addresses = " ".join(addresses)
			self.isChanged = True

	def add(self):
		super().add(table, **self.__dict__)
		Db.commit()
		return self

	def update(self, where=None):
		super().update(
			table,
			where if where else f'id="{self.id}"',
			**self.__dict__
		)
		return self

	def delete(self):
		super().delete(table, f'id="{self.id}"')
