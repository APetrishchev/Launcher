import sys
import re
import pexpect
from pexpect.pxssh import pxssh, ExceptionPxssh
from lib.aobject import AObject, Error, ExceptionApp
from lib.remote.remote import Remote as Rmt

timeout = 5

class Remote(pxssh, Rmt):
	def dbg(self):
		print("Before(raw):", self.before)
		print("After(raw):", self.after)
		print()

	def __init__(self, **kvargs):
		def getArg(argName, default):
			return default if not argName in kvargs else kvargs[argName]
		try:
			self.connector = kvargs["connector"]
			self.sudo = getArg("sudo", False)
			super().__init__(
				logfile = sys.stdout.buffer if not "log" in kvargs else open(kvargs["log"], "w"),
				encoding = "utf-8",
				echo = False,
				timeout = timeout
			)
			self.login(
				kvargs["host"],
				kvargs["user"],
				kvargs["passwd"],
				port = getArg("port", 22),
				auto_prompt_reset = False,
				sync_original_prompt = False
			)
			# self.sendline("")
			# self.try_read_prompt(1.0)
			# self.sendline("")
			# first = self.try_read_prompt(1.0)
			# self.sendline("")
			# second = self.try_read_prompt(1.0)
			# if first == second:
			# 	self.PROMPT = first
			# else:
			self.PROMPT = "\[.*\][\#\$] "
			self.sendline("export LANG=en_US.UTF-8")
			self.prompt()
			self.sendline("export LANGUAGE=en_US.UTF-8")
			self.prompt()
			if self.sudo:
				self.sendline("sudo -s")
				idx = self.expect([(f'\[sudo\] password for {kvargs["user"]}: '), self.PROMPT], timeout=timeout)
				if idx == 0:
					self.sendline(kvargs["passwd"])
					idx = self.expect([".*is not in the sudoers file.*", self.PROMPT], timeout=timeout)
					if idx == 0:
						raise ExceptionApp(Error.PrivilegeError, kvargs["user"])
			self.connector.connection = self
		except ExceptionApp as exc:
			if exc.errCode == Error.PrivilegeError.code:
				raise ExceptionApp(Error.ConnError)
			raise
		except pexpect.exceptions.TIMEOUT as exc:
			raise ExceptionApp(Error.ConnError)
		except ExceptionPxssh as exc:
			if exc.value == "Could not establish connection to host":
				raise ExceptionApp(Error.ConnError)
			elif exc.value == "password refused":
				raise ExceptionApp(Error.AuthError)
			print("Exception:", exc.value)
			raise
		except Exception:
			raise

	def execute(self, cmd):
		# self.command = cmd
		self.sendline(f"{cmd}; echo $?;")
		if not self.prompt():
			self.sendcontrol("c")
			self.prompt()
			return None, None
		else:
			results = self.before.replace("\r", "").split("\n")
			try:
				return int(results[-2].strip()), results[0:-2]
			except ValueError as exc:
				return None, None

	def exit(self):
		if self.sudo:
			self.execute("exit")
		self.logout()

	# def chgPasswd(self, usr, passwd):
	# 	"""добавляет пароль пользователя"""
	# 	self.command = f"passwd {usr}"
	# 	self.sendline(self.command)
	# 	try:
	# 		self.expect(["New password:", "Enter new UNIX password", "Enter new password:"], timeout=timeout)
	# 		self.sendline(passwd)
	# 		self.expect(["Retype new password:", "Retype new UNIX password:", "Re-type new password:"], timeout=timeout) # 0:CentOS, 1:Ubuntu
	# 		self.sendline(passwd)
	# 		self.expect(["passwd: all authentication tokens updated successfully", "passwd: password updated successfully"], timeout=2) # 0:CentOS, 1:Ubuntu
	# 		self.prompt()
	# 		return 0
	# 	except TIMEOUT:
	# 		self.results = self.before.decode("utf-8").replace("\r", "").split("\n")
	# 		self.sendcontrol("c")
	# 		self.prompt()
	# 	return -1

	def getInfo(self):
		retCode, results = self.execute("hostid; uname -a; getconf LONG_BIT; systemctl --version")
		if retCode == 0:
			self.connector.nodeId = results[0]
			params = results[1].split(" ")
			self.connector.os = params[0].strip().lower()
			self.connector.hostName = params[1].strip()
			self.connector.kernel = re.match(r"(.*)-", params[2]).group(1)
			self.connector.x = results[2]
			self.connector.systemd = None if re.match(r".* command not found", results[3]) else results[3]

		retCode, results = self.execute("cat /etc/os-release")
		osName = ["", ""]
		if retCode == 0:
			for item in results:
				arr = item.split("=")
				if arr[0] == "ID":
					osName[0] = arr[1]
				elif arr[0] == "VERSION_ID":
					osName[1] = arr[1]
		self.connector.osName = " ".join(osName)

		from AppMonitorIT.backend.config import config
		retCode, results = self.execute(f"{config.agent.daemon} -V")
		if retCode == 0:
			self.connector.agent = " ".join(re.match(config.agent.verRegEx, "\n".join(results)).groups())

	def systemdReload(self):
		"""выполняет перезагрузку systemd"""
		retCode = None
		if self.connector.systemd:
			retCode, _ = self.execute("sudo /bin/systemctl daemon-reload")
		return retCode

	def ctrlService(self, cmd, srv):
		"""выполняет команды управления сервисами"""
		if self.connector.systemd:
			retCode, _ = self.execute(f"sudo /bin/systemctl {cmd} {srv}.service")
		else:
			retCode, _ = self.execute(f"sudo /etc/init.d/{srv} {cmd}")
		return retCode

	def addUsergroup(self, group):
		"""добавляет пользовательскую группу"""
		retCode, _ = self.execute(f"groupadd {group}")
		return retCode

	def addUser(self, usr, **kvargs):
		"""добавляет пользователя"""
		params = []
		if "home" in kvargs:
			params.append(f'-d{kvargs["home"]}')
		if "shell" in kvargs:
			params.append(f'-s{kvargs["shell"]}')
		if "group" in kvargs:
			params.append(f'-g{kvargs["group"]}')
		retCode, _ = self.execute(f'"useradd -m {" ".join(params)} {usr}')
		return retCode

	def chgUser(self, usr, **kvargs):
		"""изменяет данные пользователя"""
		params = []
		if "home" in kvargs:
			params.append(f'-d{kvargs["home"]}')
		if "shell" in kvargs:
			params.append(f'-s{kvargs["shell"]}')
		retCode, _ = self.execute(f'usermod -m {" ".join(params)} {usr}')
		return retCode

	def chgOwner(self, usr, grp, obj, r=False):
		"""устанавливает владельца для файла или директории"""
		retCode, _ = self.execute(f'chown{" -R" if r else ""} {usr}:{grp} {obj}')
		return retCode

	def chgMode(self, perm, obj, r=False):
		"""устанавливает разрешения для файла или директории"""
		retCode, _ = self.execute(f'chmod{" -R" if r else ""} {perm} {obj}')
		return retCode

	def mkDir(self, dir_, **kwargs):
		"""создает директорию"""
		params = []
		params.append(f'[[ ! -f "{dir_}" ]] && mkdir -p {dir_}')
		if "mode" in kwargs:
			params.append(f' && chmod {kwargs["mode"]} {dir_}')
		if "owner" in kwargs:
			params.append(f' && chown {kwargs["owner"][0]}:{kwargs["owner"][1]} {dir_}')
		retCode, _ = self.execute("".join(params))
		return retCode

	def movDir(self, src, dst):
		"""перемещает директорию"""
		retCode, _ = self.execute(f"mv {src} {dst}")
		return retCode

	def delTree(self, dir_):
		"""удаляет директорию"""
		retCode, _ = self.execute(f"rm -rf {dir_}")
		return retCode

	def delDir(self, dir_):
		"""удаляет директорию"""
		self.execute(f"rmdir {dir_}")
		return retCode

	def movFile(self, src, dst):
		"""перемещает файл"""
		retCode, _ = self.execute(f"mv -f {src} {dst}")
		return retCode

	def delFile(self, file_):
		"""удаляет файл"""
		retCode, _ = self.execute(f"rm -f {file_}")
		return retCode

	def reLink(self, src, lnk):
		"""пересоздает линк"""
		retCode, _ = self.execute(f"rm -f {lnk}; ln -s {src} {lnk}")
		return retCode
