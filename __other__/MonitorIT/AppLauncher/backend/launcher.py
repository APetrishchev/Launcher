import os, sys
from time import sleep

def usage(err=None):
	if err:
		print(err)
	print("""
Usage:
  launcher [discovery] start|stop|restart
""")
	return ("Parameters error", 1)

def launcher(*args):
	try:
		if len(args) == 1:
			from AppLauncher.backend.httpServer import HTTPServer
			service = HTTPServer()
			opr = args[0]
			return HTTPServer.run()
		elif len(args) == 2:
			if args[0] == "discovery":
				from AppMonitorIT.backend.discovery import Discovery
				service = Discovery()
				opr = args[1]
			else:
				raise
		else:
			raise
		if opr == "start":
			return service.start()
		elif opr == "stop":
			return service.stop()
		elif opr == "restart":
			msg, retCode = service.stop()
			print(msg)
			sleep(3)
			return service.start()
		raise
	except Exception:
		raise
		return usage()
