# import os, json
# from sqlalchemy import Column, ForeignKey, Boolean, Integer, String
# from sqlalchemy.orm import relationship

# class Address(Base):
# 	__tablename__ = "addresses"
# 	ip = Column(String, primary_key=True, index=True)
# 	availabled = Column(Boolean)
# 	netId = Column(String)
# 	nodeId = Column(String, default="")
# 	lastChange = Column(String, default="")
# 	lastCheck = Column(String, default="")
# 	description = Column(String, default="")
# 	disables = Column(Boolean, default=False)

# 	# net = relationship("Networks", back_populates="networks")

from datetime import datetime
from lib.database import Db
from lib.aobject import exception
from AppMonitorIT.backend.config import config
table = "addresses"

class Address(Db):
	fields = "ip,availabled,connected,authorized,network,nodeId,nodeName,lastChange,description,disabled"

	def createTable():
		msg = []
		@exception(table)
		def crtTbl():
			Db.createTable(table, (
				"`ip` CHAR(15) PRIMARY KEY UNIQUE",
				"`availabled` INTEGER",
				"`connected` VARCHAR(24)",
				"`authorized` VARCHAR(24)",
				"`network` CHAR(18) NOT NULL",
				"`nodeId` VARCHAR(48) DEFAULT ''",
				"`nodeName` VARCHAR(48) DEFAULT ''",
				"`lastChange` CHAR(19)",
				"`disabled` INTEGER DEFAULT 0",
				"`description` VARCHAR(255) DEFAULT ''"
			))
		msg.append(crtTbl())
		return msg

	def getAddresses(**kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Address.fields
		return {item["ip"]: Address(**item) for item in Db().getAll(table, **kvargs)}

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		super().__init__()
		self.ip = getArg("ip", None)
		self.availabled = getArg("availabled", None)
		self.connected = getArg("connected", None)
		self.authorized = getArg("authorized", None)
		self.network = getArg("network", None)
		self.nodeId = getArg("nodeId", None)
		self.nodeName = getArg("nodeName", "")
		self.lastChange = getArg("lastChange", None)
		self.disabled = getArg("disabled", 0)
		self.description = getArg("description", "")

	def setAvailabled(self, val):
		if self.availabled != val:
			self.availabled = val
			self.lastChange = f"{{:{config.datetimeFormat}}}".format(datetime.now())
			self.isChanged = True

	def setConnected(self, val):
		if self.connected != val:
			self.connected = val
			self.isChanged = True

	def setAuthorized(self, val):
		if self.authorized != val:
			self.authorized = val
			self.isChanged = True

	def setNodeId(self, val):
		if self.nodeId != val:
			self.nodeId = val
			self.isChanged = True

	def setNodeName(self, val):
		if self.nodeName != val:
			self.nodeName = val
			self.isChanged = True

	def get(self, **kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Address.fields
		results = super().get(table, **kvargs)
		if results:
			self.__dict__.update(results)
		return self

	# def get(**kvargs):
	# 	where = []
	# 	if "network" in kvargs:
	# 		where.append(f"network=\"{kvargs['network']}\"")
	# 	if "nodeId" in kvargs:
	# 		where.append(f"nodeId=\"{kvargs['nodeId']}\"")
	# 	if "disabled" in kvargs:
	# 		where.append(f"disabled={kvargs['disabled']}")
	# 	# addresses = Db.get(
	# 	# 	table,
	# 	# 	"ip,availabled,connected,authorized,network,nodeId,lastChange,description,disabled" if not "fields" in kvargs else kvargs["fields"],
	# 	# 	" AND ".join(where)
	# 	# )
	# 	# results = {}
	# 	# results_ = {}
	# 	# for item in addresses:
	# 	# 	results[item["ip"]] = item
	# 	# 	results_[item["ip"]] = Address(**item)
	# 	# return results

	def add(self):
		self.lastChange = f"{{:{config.datetimeFormat}}}".format(datetime.now())
		super().add(table, **self.__dict__)
		Db.commit()
		return self

	def update(self, where=None):
		super().update(
			table,
			where if where else f'ip="{self.ip}"',
			**self.__dict__
		)
		Db.commit()
		return self

	def delete(self):
		super().delete(table, f'ip="{self.ip}"')
