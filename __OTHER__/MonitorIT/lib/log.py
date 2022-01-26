import sys, re
from datetime import datetime

class Log():
  FILE = 1
  CONSOLE = 2
  NOCOLOR = 4
  COLOR = 8
  START_TIME = None
  RED = "\033[31m"
  GREEN = "\033[32m"
  WHITE = "\033[37m"
  HEADER1 = "=" * 80
  HEADER2 = "--- {:-<76}"
  ERR_HEADER = "{:^80s}"
  MSG_SUCCESS = "OK"
  MSG_FAIL = "FAIL"

  def __init__(self, path=None, nocolor=NOCOLOR):
    self.enable = True
    self.behavior = nocolor
    self.behavior += Log.CONSOLE
    if path:
      self.behavior += Log.FILE
      self.logFile = open(path, "w")
    Log.START_TIME = datetime.now()
    self.writeln(f"Started at {Log.START_TIME.strftime('%Y-%m-%d %H:%M:%S')}")
    Log.SUCCESS = self.green(Log.MSG_SUCCESS)
    Log.FAIL = self.red(Log.MSG_FAIL)

  def writeln(self, *msgs, **kwargs):
    if not self.enable:
      return
    out = Log.FILE+Log.CONSOLE if not "out" in kwargs else kwargs["out"]
    if self.behavior&Log.FILE&out:
      for msg in msgs:
        self.logFile.write(msg.encode("utf-8"))
      self.logFile.write("\n".encode('utf-8'))
    if self.behavior&Log.CONSOLE&out:
      for msg in msgs:
        sys.stdout.write(msg)
      sys.stdout.write("\n")
      sys.stdout.flush()

  def write(self, msg, **kwargs):
    if not self.enable:
      return
    out = Log.FILE+Log.CONSOLE if not "out" in kwargs else kwargs["out"]
    if self.behavior&Log.FILE&out:
      self.logFile.write(msg.encode("utf-8"))
    if self.behavior&Log.CONSOLE&out:
      sys.stdout.write(msg)
      sys.stdout.flush()

  def red(self, msg):
    if self.behavior&self.COLOR:
      msg = f"{Log.RED}{msg}{Log.WHITE}"
    return msg

  def green(self, msg):
    if self.behavior&self.COLOR:
      msg = f"{Log.GREEN}{msg}{Log.WHITE}"
    return msg

  def header1(self, **kwargs):
    self.writeln(Log.HEADER1, **kwargs)

  def header2(self, msg, **kwargs):
    self.writeln(Log.HEADER2.format(msg), **kwargs)

  def errHeader(self, **kwargs):
    self.writeln(Log.ERR_HEADER.format("." * 72), **kwargs)

  def success(self, message=None, **kwargs):
    if not self.enable:
      return
    out = Log.FILE+Log.CONSOLE if not "out" in kwargs else kwargs["out"]
    if self.behavior&Log.FILE&out:
      msg = message if message else Log.MSG_SUCCESS
      self.logFile.write(f"{msg.encode('utf-8')}\n")
    if self.behavior&Log.CONSOLE&out:
      msg = self.green(message) if message else Log.SUCCESS
      sys.stdout.write(f"{msg}\n")
      sys.stdout.flush()

  def fail(self, message=None, **kwargs):
    if not self.enable:
      return
    out = Log.FILE+Log.CONSOLE if not "out" in kwargs else kwargs["out"]
    if self.behavior&Log.FILE&out:
      msg = message if message else Log.MSG_FAIL
      self.logFile.write(f"{msg.encode('utf-8')}\n")
    if self.behavior&Log.CONSOLE&out:
      msg = self.red(message) if message else Log.FAIL
      sys.stdout.write('{}\n'.format(msg))
      sys.stdout.flush()

  def err(self, msg, **kwargs):
    if not self.enable:
      return
    self.errHeader()
    self.fail(msg, **kwargs)
    self.errHeader()

  def close(self):
    finishTime = datetime.now()
    self.writeln(f"Finished at {finishTime.strftime('%Y-%m-%d %H:%M:%S')} ({finishTime-Log.START_TIME})\n")
    if self.behavior&Log.FILE:
      self.logFile.close()
