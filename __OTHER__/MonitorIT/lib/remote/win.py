import re
from subprocess import Popen, PIPE, STDOUT
from lib.remote.remote import Remote as Rmt

class Remote(Rmt):
	def __init__(self, **kvargs):
		self.host = kvargs["host"]
		self.user = kvargs["user"]
		self.passwd = kvargs["passwd"]

	def execute(self, cmd):
		cmdStr = f"/usr/bin/winexe -U {self.user}%{self.passwd}//{self.host}".split(" ") # --uninstall
		cmdStr.append(f'CMD.EXE /V:ON /S /C "{cmd} & ECHO !ERRORLEVEL!"')
		proc = Popen(cmdStr, stdout=PIPE, stderr=STDOUT)
		(stdout, stderr) = proc.communicate()
		self.command = cmd
		try:
			stdout = stdout.decode("utf-8")
		except UnicodeDecodeError, exc:
			stdout = stdout.decode("CP866")
		result = stdout.replace("\0", "").replace("\r", "").split('\n')
		if proc.returncode == 0: # winexe - no errors
			try:
				self.errCode = int(result[-2].strip())
				self.result = result[:-2]
			except ValueError, exc: # cmd - no errors
				self.errCode = None
				self.result = result
		else:
			self.errCode = -1
			self.result = result
		return self.result

	def exit(self):
		cmdStr = []
		cmdStr = f"/usr/bin/winexe --uninstall -U {self.user}%{self.passwd}//{self.host}".split(" ")
		cmdStr.append('CMD.EXE /C "ECHO Bye"')
		proc = Popen(cmdStr, stdout=PIPE, stderr=STDOUT)
		(stdout, stderr) = proc.communicate()

	def getXOS(self):
		"""возвращает разрядность OS"""
		self.execute("IF DEFINED ProgramFiles(x86) (ECHO 64) ELSE (ECHO 32)")
		return self.result[0].strip()

	def getHostname(self):
		"""возвращает hostname"""
		self.execute("ping -a -n 1 127.0.0.1")
		for row in self.result:
			result = re.match(r"(Pinging|Обмен пакетами с) ([^\s]*) ", row)
			if result:
				return result.group(2)
		return None

	def installService(self, srvName, binPath, dispName, start, descr):
		"""устанавливает сервис"""
		self.execute(f'SC create \"{srvName}\" binPath= \"{binPath}\" DisplayName= \"{dispName}\" start= {start}')
		self.execute(f'SC description \"{srvName}\" \"{descr}\"')

	def ctrlService(self, cmd, srvName):
		"""выполняет команды управления сервисами"""
		return self.execute(f'SC {cmd} \"{srvName}\"')

	def mkDir(self, dir_):
		"""создает директорию"""
		self.execute(f'MKDIR "{dir_}"')

	def delDir(self, dir_):
		"""удаляет директорию"""
		self.execute(f'RMDIR "{dir_}"')

	def delTree(self, dir_):
		"""удаляет директорию с потомками"""
		self.execute(f'RMDIR /q /s "{dir_}" || ECHO 2')

	def ftpDnldDir(self, ftpSrv, src, dst):
		"""загружает папку по ftp"""
		self.execute(f'CD \"{dst}\"&&>script.ftp ECHO cd \"{src}\"&&>>script.ftp ECHO binary&&>>script.ftp ECHO mget *.*&&>>script.ftp ECHO bye&&ftp -v -i -A -s:script.ftp {ftpSrv}&&DEL script.ftp')

	def isDiskExists(self, letter):
		"""проверяет существование диска"""
		self.execute(f"{letter}:\\")
		return self.errCode 

	def mntDisk(self, locDisk, rmtDisk):
		"""монтирует удаленный диск"""
		self.execute(f"NET USE {locDisk} \\\\{rmtDisk}")
