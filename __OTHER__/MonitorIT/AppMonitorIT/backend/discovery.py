import os
import platform
from time import sleep
from datetime import datetime, timedelta
from multiprocessing import Pool
from ipaddress import IPv4Network
from itertools import repeat
from random import randrange
from lib.service import Service
from lib.database import Db
from AppLauncher.backend.events import Events
from AppMonitorIT.backend.config import config
from AppMonitorIT.backend.networks import Network
from AppMonitorIT.backend.addresses import Address
from AppMonitorIT.backend.nodes import Node
from AppMonitorIT.backend.connectors import Connectors

class Discovery(Service):
	def __init__(self):
		super().__init__(config.discovery.pidFilePath, None)

	def ping(self, netId, ip):
		return (netId, str(ip), 1 if os.popen(f"fping -c1 {ip} >/dev/null 2>&1; echo $?").read().strip() == "0" else 0)

	def getNode(self, address):
		connector = Connectors().try_(address)
		if connector and connector.connection:
			connector.connection.getInfo()
			node = Node().get(where=f'id="{address.nodeId}"')
			node.setName(connector.hostName)
			node.setOS(connector.os)
			node.setOSName(connector.osName)
			node.setAuth(address.authorized)
			node.setAgent(connector.agent)
			node.addAddress(address.ip)
			if node.id is None:
				node.id = connector.nodeId
				node.add()
			else:
				node.update(where=f'id="{node.id}"')
			print(node)
			address.setNodeId(node.id)
			address.setNodeName(node.name)
			connector.close()

	def loop(self):
		sleep(10)
		while True:
			Events.onStart()
			for network in Network.getNetworks(where="disabled=0").values():
				addresses = Address.getAddresses(where=f'network="{network.network}"')
				with Pool(processes=config.discovery.numProc) as pool:
					for netId, ip, availabled in pool.starmap_async(self.ping, zip(repeat(network.network), IPv4Network(network.network).hosts())).get():
						if ip in addresses:
							address = addresses[ip]
							if address.disabled == 0:
								address.setAvailabled(availabled)
								if availabled == 1:
									if address.isChanged:
										print("log>", f'Address "{ip}" availabled')
									# if address.nodeId is None:
									self.getNode(address)
								else:
									if datetime.fromisoformat(address.lastChange) + timedelta(days=config.discovery.notAvailDeleteDelay) > datetime.now():
										node = Node().get(where='id="%{address.nodeId}%"')
										if node.id:
											if ip == node.addresses:
												node.delete()
												print("log>", f'Node "{node.id} ({node.name})" not availabled more then {config.discovery.notAvailDeleteDelay} days. Node deleted')
											else:
												node.removeAddress(ip)
												node.update()
										address.delete()
										print("log>", f'Address "{ip}" not availabled more then {config.discovery.notAvailDeleteDelay} days. Address deleted')
									elif address.isChanged:
										print("log>", f'Address "{ip}" not availabled')
							address.update()
							if address.isChanged:
								print(address)
						elif availabled == 1:
							address = Address(
								network = netId,
								ip = ip,
								availabled = 1
							)
							self.getNode(address)
							address.add()
							print("log>", f'Address "{ip}" availabled')
							print("add", address)
			Db.commit()
			Events.onStop
			sleep(config.discovery.period * 3600)
