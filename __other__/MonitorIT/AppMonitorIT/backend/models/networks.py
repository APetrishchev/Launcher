# import os, json
# from sqlalchemy import Column, ForeignKey, Boolean, Integer, String
# from sqlalchemy.orm import relationship

# class Network(Base):
# 	__tablename__ = "networks"
# 	id = Column(String, primary_key=True, index=True)
# 	network = Column(String)
# 	gateway = Column(String)
# 	disables = Column(Boolean, default=False)
# 	description = Column(String, default="")

from lib.database import Db
from lib.aobject import exception
table = "networks"

class Network(Db):
	fields = "name,network,gateway,description,disabled"

	def createTable():
		msg = []
		@exception(table)
		def crtTbl():
			Db.createTable(table, (
				"`network` CHAR(18) PRIMARY KEY UNIQUE",
				"`gateway` CHAR(15) NOT NULL",
				"`name` VARCHAR(48) NOT NULL",
				"`disabled` INTEGER DEFAULT 0",
				"`description` VARCHAR(255) DEFAULT ''",
			))
		msg.append(crtTbl())
		return msg

	def getNetworks(**kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Network.fields
		return {item["network"]: Network(**item) for item in Db().getAll(table, **kvargs)}

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		super().__init__()
		self.network = getArg("network", None)
		self.gateway = getArg("gateway", None)
		self.name = getArg("name", None)
		self.disabled = getArg("disabled", 0)
		self.description = getArg("description", "")

	def get(self, **kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Network.fields
		results = super().get(table, **kvargs)
		if results:
			self.__dict__.update(results)
		return self

	def add(self):
		self.id = super().add(table, **self.__dict__)
		Db.commit()
		return self

	def update(self, where=None):
		super().update(
			table,
			where if where else f'network="{self.network}"',
			**self.__dict__
		)
		return self

	def delete(self):
		super().delete(table, f'network="{self.network}"')
