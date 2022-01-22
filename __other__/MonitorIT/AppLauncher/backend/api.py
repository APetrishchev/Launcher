import json
from importlib import import_module
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import JSONResponse
from lib.crypto import md5
from lib.aobject import Error
from AppLauncher.backend.sessions import Session

class Params(BaseModel):
	login: Optional[str] = None
	passwd: Optional[str] = None

class Query(BaseModel):
	appName: str
	objName: str
	methodName: str
	params: Optional[Params] = None

class Results(object):
	pass

class Response(object):
	def __init__(self, results=Results(), error=Error.NoError):
		self.results: Results = results
		self.error: Error = error

	def __call__(self):
		return {
			"results": self.results.__dict__ if hasattr(self.results, "__dict__") else [item.__dict__ for item in self.results.values()],
			"error": self.error.__dict__
		}

	def __str__(self):
		results = []
		results.append("response:")
		results.append("  results:")
		# if self.results:
		# 	try:
		# 		for item in self.results.values():
		# 			for key, val in item.__dict__.items():
		# 				results.append(f"    {key}: {val}")
		# 			results.append("")
		# 	except: #TypeError:
		# 		for key, val in self.results.__dict__.items():
		# 			results.append(f"    {key}: {val}")
		results.append("  error:")
		for key, val in self.error.__dict__.items():
			results.append(f"    {key}: {val}")
		return "\n".join(results)

	def toJSON(self):
		return json.dumps(self, default=lambda obj: obj.__dict__, sort_keys=True, indent=2)

class API(object):
	def query(sid, query):
		session = Session().check(sid)
		resp = Response()

		print(">>>>", query)
		if query.appName == "Launcher":
			if query.methodName == "auth":
				resp.error = session.auth(query.params.login, md5(query.params.passwd))
				print("<<<< auth", resp)
				response = JSONResponse(content=resp(), status_code=200)
				response.set_cookie(key="sid", value=session.id, samesite="none", secure=True)
				return response

		if session.userId is None:
			resp.error = Error.NotAuth
			print("<<<< no auth", resp)
			return JSONResponse(content=resp(), status_code=200)

		resp.results = import_module(f"App{query.appName}.backend.api").API.exec(session, query)
		print("<<<<", resp)
		return JSONResponse(content=resp(), status_code=200)

	def exec(session, query):
		if query.objName == "User":
			mod = import_module(f"App{query.appName}.backend.users")
			if query.methodName == "getUsers":
				return mod.User.getUsers()
			elif query.methodName == "get":
				return mod.User().get()
			elif query.methodName == "put":
				return mod.User().put()
