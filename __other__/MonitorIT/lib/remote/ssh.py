import time
import paramiko

class SSHClient(paramiko.SSHClient):
	def __init__(self, user, passwd, host, port=22):
		self.user = user
		self.passwd = passwd
		super().__init__()
		self.set_missing_host_key_policy(paramiko.AutoAddPolicy())
		self.connect(hostname=host, username=user, password=passwd, port=port)

	def __call__(self, command, delay=0.1):
		channel = self.invoke_shell(term="vt100", width=80, height=24)
		channel.send(f"{command}\n")
		time.sleep(delay)
		result = channel.recv(1024)
		return result.decode("utf-8")

	def execute(self, command):
		channel = self.get_transport().open_session()
		channel.get_pty()
		channel.exec_command(f"{command}\n")
		result = []
		while True:
			data = channel.recv(1024)
			if data == "" or data is None:
				break
			result.append(data)
		channel.close()
		return "".join(result).decode("utf-8")
