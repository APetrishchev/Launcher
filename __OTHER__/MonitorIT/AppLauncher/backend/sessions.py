import uuid
from lib.aobject import Error
from AppLauncher.backend.accounts import Account
from AppLauncher.backend.models.sessions import Session as ModelsSession

class Session(ModelsSession):
	def check(self, sid):
		if sid:
			self.get(where=f'id="{sid}"')
		if self.id is None:
			self.id = str(uuid.uuid4())
			self.userId = None
			self.add()
		return self

	def auth(self, login, password):
		if login and password:
			acc = Account().get(where=f'LOWER(login)="{login.lower()}" AND password="{password}" AND tags LIKE "%master%"')
			if acc.id is None or self.userId and self.userId != acc.ownerId:
				return Error.InvalidUser
		else:
			return Error.MissedUser
		self.userId = acc.ownerId
		self.isChanged = True
		self.update(f'id="{self.id}"')
		return Error.NoError
