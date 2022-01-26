from datetime import datetime
from lib.aobject import exception
from lib.database import Db
from AppLauncher.backend.config import config
table = "sessions"

class Session(Db):
	fields = "id,created,userId"

	def createTable():
		msg = []
		@exception(table)
		def crtTbl():
			Db.createTable(table, (
				"`id` CHAR(36) NOT NULL UNIQUE",
				"`created` CHAR(19) NOT NULL",
				"`userId` INTEGER"
			))
		msg.append(crtTbl())
		return msg

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		super().__init__()
		self.id = getArg("id", None)
		self.userId = getArg("userId", None)
		self.created = getArg("created", None)

	def get(self, **kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Session.fields
		results = super().get(table, **kvargs)
		if results:
			self.__dict__.update(results)
		return self

	def add(self):
		kvargs = self.__dict__
		kvargs["created"] = f"{{:{config.datetimeFormat}}}".format(datetime.now())
		super().add(table, **kvargs)
		Db.commit()
		return self

	def update(self, where):
		kvargs = self.__dict__
		super().update(table, where, **kvargs)
		Db.commit()
		return self

	def delete(self):
		super().delete(table, f'id="{self.id}"')
		Db.commit()
