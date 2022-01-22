from datetime import datetime
from lib.crypto import AES, RSA
from lib.aobject import exception
from lib.database import Db
from AppLauncher.backend.config import config
table = "accounts"

class Account(Db):
	fields = "id,ownerId,login,password,lastChange,expired,publicKey,secretKey,tags,description"

	def createTable():
		msg = []
		@exception(table)
		def crtTbl():
			Db.createTable(table, (
				"`id` INTEGER PRIMARY KEY UNIQUE",
				"`ownerId` INTEGER NOT NULL",
				"`login` VARCHAR(24) NOT NULL",
				"`password` VARCHAR(64) NOT NULL",
				"`tags` VARCHAR(1024) NOT NULL",
				"`lastChange` CHAR(19) NOT NULL",
				"`expired` CHAR(19)",
				"`publicKey` VARCHAR(1548) NOT NULL",
				"`secretKey` VARCHAR(3048) NOT NULL",
				"`description` VARCHAR(255) DEFAULT ''"
			))
		msg.append(crtTbl())

		@exception("accountGroups")
		def crtTbl():
			Db.createTable("accountGroups", (
				"`id` INTEGER PRIMARY KEY UNIQUE",
				"`ownerId` INTEGER NOT NULL",
				"`name` VARCHAR(48) NOT NULL",
				"`description` VARCHAR(255) DEFAULT ''",
			))
		msg.append(crtTbl())

		@exception("account_group")
		def crtTbl():
			Db.createTable("account_group", (
				"`accountId` INTEGER NOT NULL",
				"`groupId` INTEGER NOT NULL",
			))
		msg.append(crtTbl())

		return msg

	def getAccounts(**kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Account.fields
		return {item["id"]: Account(**item) for item in Db().getAll(table, **kvargs)}

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		super().__init__()
		self.id = getArg("id", None)
		self.ownerId = getArg("ownerId", None)
		self.login = getArg("login", None)
		self.password = getArg("password", None)
		self.tags = getArg("tags", None)
		self.lastChange = getArg("lastChange", None)
		self.expired = getArg("expired", None)
		self.publicKey = getArg("publicKey", None)
		self.secretKey = getArg("secretKey", None)
		self.description = getArg("description", "")

	def get(self, **kvargs):
		if not "fields" in kvargs:
			kvargs["fields"] = Account.fields
		results = super().get(table, **kvargs)
		if results:
			self.__dict__.update(results)
		return self

	def add(self):
		masterPassword = "rf3rgwerg"
		kvargs = self.__dict__
		if kvargs["publicKey"] is None:
			kvargs["publicKey"], kvargs["secretKey"] = RSA.generate(masterPassword)
		kvargs["lastChange"] = f"{{:{config.datetimeFormat}}}".format(datetime.now())
		self.id = super().add(table, **kvargs)
		Db.commit()
		return self

	def update(self, where):
		kvargs = self.__dict__
		# kvargs["lastChange"] = f"{{:{config.datetimeFormat}}}".format(datetime.now())
		super().update(table, where, **kvargs)
		Db.commit()
		return self

	def delete(self):
		super().delete(table, f'id="{self.id}"')
		Db.commit()


# password = "nooneknows"

# aes = AES(password)
# enc = md5("my_windows_password")
# print(enc)
# enc = md5("my_windows_password")
# print(enc)
# enc = md5("my_windows_password")
# print(enc)

# publicKey, secretKey = RSA.generate(password)
# encrypted = RSA.encrypt("blah blah Python blah blah", publicKey)
# # print(encrypted)
# print(RSA.decrypt(encrypted, secretKey, password))
