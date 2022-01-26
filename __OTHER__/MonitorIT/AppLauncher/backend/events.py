from lib.database import Db
from AppLauncher.backend.config import config

class Events:
	def onStart():
		Db.connect(config)

	def onStop():
		Db.close()
