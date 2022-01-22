from importlib import import_module
from lib.aobject import AObject

class API(AObject):
	def exec(session, query):
		if query.objName == "Network":
			mod = import_module(f"App{query.appName}.backend.networks")
			if query.methodName == "getNetworks":
				return mod.Network.getNetworks()
			elif query.methodName == "get":
				return mod.Network().get()
			elif query.methodName == "put":
				return mod.Network().put()

		elif query.objName == "Address":
			mod = import_module(f"App{query.appName}.backend.addresses")
			if query.methodName == "getAddresses":
				return mod.Address.getAddresses()
			elif query.methodName == "get":
				return mod.Address().get("")

		elif query.objName == "Node":
			mod = import_module(f"App{query.appName}.backend.nodes")
			if query.methodName == "getNodes":
				return mod.Node.getNodes()
			elif query.methodName == "get":
				return mod.Node().get("")
