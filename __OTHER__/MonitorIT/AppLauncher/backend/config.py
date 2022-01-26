import os
from pathlib import Path
from lib.config import Config as Cfg

class Config(Cfg):
	def __init__(self):
		super().__init__()
		self.httpHost = "0.0.0.0"
		self.httpPort = 8001
		self.httpDebug = True
		self.httpReload = True
		self.httpWorkers = 3

		self.dbEngine = "sqlite"
		self.dbHost = ""
		self.dbPort = ""
		self.dbUser = ""
		self.dbPasswd = ""
		self.dbName = os.path.join(self.databaseDirPath, "launcher.db")

config = Config()
