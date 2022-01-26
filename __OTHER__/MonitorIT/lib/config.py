import os
from pathlib import Path
from lib.aobject import AObject

class Config(AObject):
	def __init__(self):
		self.datetimeFormat = "%Y-%m-%d %H:%M:%S"
		self.workDirPath = Path(__file__).parent.parent.absolute()
		self.dataDirPath = os.path.join(self.workDirPath, "data")
		self.databaseDirPath = os.path.join(self.workDirPath, "database")
		self.logDirPath = os.path.join(self.workDirPath, "log")
		self.pidDirPath = os.path.join(self.workDirPath, "run")
		self.tmpDirPath = os.path.join(self.workDirPath, "tmp")
		self.confDirPath = os.path.join(self.workDirPath, "AppLauncher", "config")
		self.httpDirPath = os.path.join(self.workDirPath, "AppLauncher", "frontend")
		self.stylesDirPath = os.path.join(self.httpDirPath, "styles")
		self.scriptsDirPath = os.path.join(self.httpDirPath, "scripts")
		self.picturesDirPath = os.path.join(self.httpDirPath, "pictures")

config = Config()
