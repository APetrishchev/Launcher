from lib.aobject import AObject

class Install(AObject):
	def __init__(self):
		self.results = []

	def createTables(self, class_):
		for item in class_.createTable():
			self.results.append(item)
