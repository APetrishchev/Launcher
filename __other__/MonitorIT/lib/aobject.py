# from enum import IntEnum

class __Error__():
	def __init__(self, code, msg):
		self.code = code
		self.msg = msg

	def __str__(self):
		return f'[{self.code}] {self.msg}'

class ExceptionApp(Exception):
	def __init__(self, error, *args):
		self.errCode = error.code
		self.errMsg = error.msg.format(*args)

	def __str__(self):
		return f'[{self.errCode}] {self.errMsg}'

class Error(object):
	NoError = __Error__(0, "No error")
	MissedUser = __Error__(1, "Missing login or password")
	InvalidUser = __Error__(2, "Invalid login or password")
	NotAuth = __Error__(3, "Session is not authorized")
	ConnError = __Error__(41, "Connection error")
	AuthError = __Error__(42, "Authorization error")
	PrivilegeError = __Error__(43, 'User {%s} is not in the sudoers file')

def exception(msg):
	def decorator(func):
		def wrapper(*args, **kvargs):
			try:
				res = func(*args, **kvargs)
				return "{:.<60} OK".format(f"{msg} ")
			except Exception as err:
				return "{:.<60} FAIL".format(f"{msg} ")
		return wrapper
	return decorator

class AObject:
	def __init__(self, **kvargs):
		if kvargs:
			self.__dict__ = kvargs

	def __str__(self):
		out = []
		out.append(f"Object: {self.__class__.__name__}{{")
		for key, val in self.__dict__.items():
			out.append(f"  {key}: {val}")
		out.append("}")
		return "\n".join(out)
