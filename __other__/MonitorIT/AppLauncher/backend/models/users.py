from lib.aobject import exception
from lib.database import Db
table = "users"

class User(Db):
	fields = "id,firstName,lastName,tags,description"

	def createTable():
		msg = []
		@exception(table)
		def crtTbl():
			Db.createTable(table, (
				"`id` INTEGER PRIMARY KEY UNIQUE",
				"`firstName` VARCHAR(48) NOT NULL",
				"`lastName` VARCHAR(48) NOT NULL",
				"`tags` VARCHAR(1024) NOT NULL",
				"`description` VARCHAR(255) DEFAULT ''",
			))
		msg.append(crtTbl())

		@exception("userGroups")
		def crtTbl():
			Db.createTable("userGroups", (
				"`id` INTEGER PRIMARY KEY UNIQUE",
				"`name` VARCHAR(48) NOT NULL",
				"`description` VARCHAR(255) DEFAULT ''",
			))
		msg.append(crtTbl())

		@exception("user_group")
		def crtTbl():
			Db.createTable("user_group", (
				"`userId` INTEGER NOT NULL",
				"`groupId` INTEGER NOT NULL",
			))
		msg.append(crtTbl())

		return msg

	def getUsers(**kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = User.fields
		return {item["id"]: User(**item) for item in Db().getAll(table, **kvargs)}

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		super().__init__()
		self.id = getArg("id", None)
		self.firstName = getArg("firstName", None)
		self.lastName = getArg("lastName", None)
		self.tags = getArg("tags", None)
		self.description = getArg("description", "")

	def get(self, **kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = User.fields
		results = super().get(table, **kvargs)
		if results:
			self.__dict__.update(results)
		return self

	def add(self):
		self.id = super().add(table, **self.__dict__)
		Db.commit()
		return self

	def update(self, where):
		super().update(table, where, **self.__dict__)
		Db.commit()
		return self

	def delete(self):
		super().delete(table, f'id="{self.id}"')
		Db.commit()
