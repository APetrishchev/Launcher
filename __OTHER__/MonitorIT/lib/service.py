import os, sys, signal

class Service:
	def __init__(self, pidFilePath, logger):
		self.pidFilePath = pidFilePath
		self.logger = logger

	def start(self):
		errMsg = "Service starting ... "
		errCode = 0
		if not os.path.exists(self.pidFilePath):
			pid = os.fork()
			if pid > 0:
				with open(self.pidFilePath, "w") as pidFile:
					pidFile.write(str(pid))
			elif pid == 0:
				if self.logger:
					self.logger.info(f"Started\n{'='*80}")
				os.close(0) # stdin
				# os.close(1) # stdout
				# os.close(2) # stderr
				os.chdir("/")
				return self.run()
			if errCode == 0:
				errMsg += "Ok"
		else:
			errMsg += f'''Pid file "{self.pidFilePath}" is exists. Service already running?'''
		return errMsg, errCode

	def stop(self):
		errMsg = "Service stopping ... "
		errCode = 0
		if os.path.exists(self.pidFilePath):
			try:
				with open(self.pidFilePath) as pidFile:
					pid = pidFile.read()
					os.kill(int(pid), signal.SIGKILL)
			except ProcessLookupError:
				errMsg += f"No such process ({pid})"
				errCode = 1
			os.remove(self.pidFilePath)
			if self.logger:
				self.logger.info(f"Stopped")
			if errCode == 0:
				errMsg += "Ok"
		else:
			errMsg += f'''Pid file "{self.pidFilePath}" not exists. Service not running?'''
		return errMsg, errCode

	def run(self):
		try:
			self.loop()
			return "Ok", 0
		except Exception as err:
			raise err
			return err, 1
