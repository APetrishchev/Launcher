import os
from pathlib import Path
from lib.aobject import AObject
from AppLauncher.backend.config import Config as Cfg

class Config(Cfg):
	def __init__(self):
		super().__init__()
		self.discovery = AObject()
		self.discovery.pidFilePath = os.path.join(self.pidDirPath, "discovery.pid")
		self.discovery.numProc = 25
		self.discovery.period = 0.1 # hours
		self.discovery.accouns = ""
		self.discovery.sshPorts = (22,)
		self.discovery.snmpPorts = (161,)
		self.discovery.rdpPorts = (339,)
		self.discovery.httpPorts = (80, 443)
		self.discovery.notAvailDeleteDelay = 7 # days

		self.agent = AObject()
		self.agent.agentsDirPath = os.path.join(self.dataDirPath, "zabbix", "agents")
		self.agent.name = "zabbix"
		self.agent.daemon = "zabbix_agentd"
		self.agent.verRegEx = r"zabbix_agentd \(daemon\) \((Zabbix)\) (.+)"
		self.agent.service = "zabbix-agent"
		self.agent.servers = ("172.28.138.148", "172.28.138.180")
		self.agent.port = 10050

config = Config()
