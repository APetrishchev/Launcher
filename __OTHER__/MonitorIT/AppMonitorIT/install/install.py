from lib.database import Db
from AppMonitorIT.backend.networks import Network
from AppMonitorIT.backend.addresses import Address
from AppMonitorIT.backend.nodes import Node
from AppLauncher.install.install_model import Install as ModelsInstall

class Install(ModelsInstall):
	def run(self):
		self.createTables(Network)
		Network(name="172.28.141.192/28", network="172.28.141.192/28", gateway="172.28.141.249").add()
		Network(name="172.28.138.128/25", network="172.28.138.128/25", gateway="172.28.138.249", disabled=1).add()
		Network(name="172.28.147.0/24", network="172.28.147.0/24", gateway="172.28.147.249", disabled=1).add()
		Network(name="10.16.197.64/26", network="10.16.197.64/26", gateway="10.16.197.249", disabled=1).add()
		Network(name="10.16.198.0/24", network="10.16.198.0/24", gateway="10.16.198.249", disabled=1).add()
		Db.commit()
		self.createTables(Address)
		self.createTables(Node)
		return self.results
