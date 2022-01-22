	# def get(**kvargs):
	# 	with open(os.path.join(Config.dataDir, "networks.json"), "r") as file:
	# 		networks = json.load(file)
	# 	if "disabled" in kvargs:
	# 		results = {}
	# 		for name, net in networks.items():
	# 			if net["disabled"] == kvargs["disabled"]:
	# 				results[name] = net
	# 		return results
	# 	return networks






	# def get(self, **kvargs):
	# 	with open(os.path.join(Config.dataDir, "addresses.json"), "r") as file:
	# 		addresses = json.load(file)
	# 	if "disabled" in kvargs:
	# 		self.addresses = {}
	# 		for netId, net in addresses.items():
	# 			for ip, address in net.items():
	# 				if address.disabled == kvargs["disabled"]:
	# 					if not netId in results:
	# 						self.addresses[netId] = {}
	# 					self.addresses[netId][ip] = address
	# 	else:
	# 		self.addresses = addresses

	# def put(self, netId, ip, **kvargs):
	# 	def _set(attr, default):
	# 		if attr in kvargs:
	# 			self.addresses[netId][ip][attr] = kvargs[attr]
	# 		elif not default is None:
	# 			self.addresses[netId][ip][attr] = default

	# 	if not netId in self.addresses:
	# 		self.addresses[netId] = {}
	# 	if not ip in self.addresses[netId]:
	# 		self.addresses[netId][ip] = {}
	# 	_set("available", None)
	# 	_set("hostId", "")
	# 	_set("hostName", "")
	# 	_set("description", "")
	# 	_set("lastChangeTime", "")
	# 	_set("lastCheckTime", "")
	# 	_set("disabled", 0)

	# def delete(self):
	# 	pass

	# def commit(self):
	# 	for netId in sorted(self.addresses.keys()):
	# 		for ip in sorted(self.addresses[netId].keys()):
	# 			print(netId, ip, self.addresses[netId][ip])

	# def rollback(self):
	# 	pass
