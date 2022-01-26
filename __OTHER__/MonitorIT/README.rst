Networks:
	Name, Network, Gateway, Description, Disabled

Addresses:
	Address, Availabled, Connected, Authorized, NodeId, Description, LastChange, Disabled

Networks.foreach(network WHERE network.disabled=0):
	network.foreach(ip):
		if ip.address in Addresses:
			if ip.address.disabled == 0:
				node = Node().get(WHERE='IPs="%{ip.address}%"')
				avail = ping(ip.address)
				if avail == 1 and ip.address.availabled == 0:
						UPDATE Addresses (Availabled=avail, LastChange=Now) WHERE Address=ip.address
						...
				elif avail == 0:
					if ip.address.availabled == 1:
						UPDATE Addresses (Availabled=avail, LastChange=Now) WHERE Address=ip.address
					else:
						if 
						if ip.lastChange + Config.discoveryNotAvailDeleteDelay < Now:
							DELETE FROM Addresses WHERE Address=ip.address

		elif ping(ip.address) == 1:
			Connect(ip)
			if ip.connected == Error.noError and ip.authorized == Error.noError:
				ip.getInfo()
				if ip.info:
					node = Node().get(where='id="%{ip.nodeId}%"')
					if node.id is None:
						node.id = ip.nodeId
						node.name = ip.info.hostName
						node.addresses = ip.address
						node.add()
					elif ip.address in node.addresses.split(" "):
						node.addresses += " {ip.address}"
						node.update(where='id="%{ip.nodeId}%"')
				ip.add()
