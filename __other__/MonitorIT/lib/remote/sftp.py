import os
import paramiko
import stat

class SFTPClient(paramiko.SFTPClient):
	@staticmethod
	def getSFTPClient(user, passwd, host, port=22):
		transport = paramiko.Transport((host, port))
		transport.connect(username=user, password=passwd)
		sftp = SFTPClient.from_transport(transport)
		sftp.transport = transport
		return sftp

	def putDir(self, localDir, remoteDir):
		os.chdir(os.path.split(localDir)[0])
		for parent, dirs, files in os.walk(os.path.split(localDir)[1]):
			self.mkdir(os.path.join(remoteDir, parent))
			for fileName in files:
				remoteFile = os.path.join(remoteDir, parent, fileName)
				self.put(os.path.join(parent, fileName), remoteFile)

	def getDir(self, remoteDir, localDir):
		os.path.exists(localDir) or os.makedirs(localDir)
		dirItems = self.listdir_attr(remoteDir)
		for item in dirItems:
			remotePath = os.path.join(remoteDir, item.filename)
			localPath = os.path.join(localDir, item.filename)
			if stat.S_ISDIR(item.st_mode):
				getDir(remotePath, localPath)
			else:
				self.get(remotePath, localPath)

	def close(self):
		self.transport.close()
		super(SFTPClient, self).close()
