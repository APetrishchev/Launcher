import os, re, inspect, socket
# from service.remote import WinRemote, NixRemote
# from auth.auth import ZbxAgent as Auth
from pexpect.pxssh import ExceptionPxssh
from exceptions import ExceptionAgent
from appagent.config.config import Common as cfg

#*******************************************************************************
class Agent(object):
	WIN_INSTALLER_USER = None
  WIN_INSTALLER_PASSWD = None
  NIX_INSTALLER_USER = None
  NIX_INSTALLER_PASSWD = None
  NIX_USER = None
  NIX_PASSWD = None

  @staticmethod
  def connect(hostIp, sudo):

    def getPasswd(os):
      if os == "Win":
        if hasattr(Auth, "WIN_INSTALLER_USER"):
          Agent.WIN_INSTALLER_USER = Auth.WIN_INSTALLER_USER
        if hasattr(Auth, "WIN_INSTALLER_PASSWD"):
          Agent.WIN_INSTALLER_PASSWD = Auth.WIN_INSTALLER_PASSWD
        if not Agent.WIN_INSTALLER_PASSWD:
          if not Agent.WIN_INSTALLER_USER:
            Agent.WIN_INSTALLER_USER = raw_input("Win-admin authorization required\nUsername: ")
          else:
            print(f"Username: {Agent.WIN_INSTALLER_USER}")
          Agent.NIX_INSTALLER_PASSWD = getpass("Password: ")
      elif os == "Nix":
        if hasattr(Auth, "NIX_INSTALLER_USER"):
          Agent.NIX_INSTALLER_USER = Auth.NIX_INSTALLER_USER
        if hasattr(Auth, "NIX_INSTALLER_PASSWD"):
          Agent.NIX_INSTALLER_PASSWD = Auth.NIX_INSTALLER_PASSWD
        Agent.NIX_USER = Auth.NIX_USER
        Agent.NIX_PASSWD = Auth.NIX_PASSWD
        if not Agent.NIX_INSTALLER_PASSWD:
          if not Agent.NIX_INSTALLER_USER:
            Agent.NIX_INSTALLER_USER = raw_input("Nix-admin authorization required\nUsername: ")
          else:
            print(f"Username: {Agent.NIX_INSTALLER_USER}")
          Agent.NIX_INSTALLER_PASSWD = getpass('Password: ')

    #---------------------------------------------------------------------------
    # Try Win
    #if Agent.WIN_INSTALLER_USER is None or Agent.WIN_INSTALLER_PASSWD is None:
    #  getPasswd("Win")
    #rmt = WinRemote(hostIp, Agent.WIN_INSTALLER_USER, Agent.WIN_INSTALLER_PASSWD)
    #hostname = rmt.getHostname()
    #if rmt.errCode == 0:
    #  rmt.hostname = hostname
    #  rmt.os = "Win"
    #  from winAgent import WinAgent
    #  rmt.agent = WinAgent
    #elif rmt.errCode == -1:
    if 1:
      #-------------------------------------------------------------------------
      # Try Nix
      try:
        if Agent.NIX_INSTALLER_USER is None or Agent.NIX_INSTALLER_PASSWD is None:
          getPasswd("Nix")
        if sudo:
          rmt = NixRemote(hostIp, Agent.NIX_INSTALLER_USER, Agent.NIX_INSTALLER_PASSWD, True)
        else:
          rmt = NixRemote(hostIp, Agent.NIX_USER, Agent.NIX_PASSWD, False)
        rmt.os = "Nix"
        from nixAgent import NixAgent
        rmt.agent = NixAgent
        rmt.hostname = rmt.getHostname()
        if rmt.errCode != 0:
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)
        rmt.systemd = rmt.chkSystemd()
        if rmt.errCode != 0:
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      except ExceptionPxssh as exc:
        raise ExceptionAgent(-1, exc)
      #-------------------------------------------------------------------------
    else:
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)
    rmt.hostIp = hostIp
    rmt.xOS = f"x{rmt.getXOS()}"
    if rmt.errCode != 0:
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)
    return rmt

  @staticmethod
  def cmdStart(rmt, cfg, log):
    raise ExceptionAgent(None, "    Agent.cmdStart must be overridden. ")

  @staticmethod
  def cmdStop(rmt, cfg, log):
    raise ExceptionAgent(None, "    Agent.cmdStop must be overridden. ")

  @staticmethod
  def cmdRestart(rmt, cfg, log):
    raise ExceptionAgent(None, "    Agent.cmdRestart must be overridden. ")

  @staticmethod
  def cmdInstall(rmt, cfg, log):
   raise ExceptionAgent(None, "    Agent.cmdInstall must be overridden. ")

  @staticmethod
  def cmdUninstall(rmt, cfg, log):
    raise ExceptionAgent(None, "    Agent.cmdUninstall must be overridden. ")

  @staticmethod
  def prepareConfig(confFile, tmpConfFile, **kwargs):
    '''подготавливает конфигурационный файл'''
    ln = confFile.readline()
    while ln:
      if "pidFile" in kwargs and ln.find("PidFile=") == 0:
        ln = f"PidFile={gs['pidFile']}\n"
      elif "logFile" in kwargs and ln.find("LogFile=") == 0:
        ln = f"LogFile={kwargs['logFile']}\n"
      elif "serverIp" in kwargs and ln.find("Server=") == 0:
        ln = f"Server={kwargs['serverIp']}\n"
      elif "serverIp" in kwargs and ln.find("ServerActive=") == 0:
        ln = f"ServerActive={kwargs['serverIp']}\n"
      elif "listenPort" in kwargs and ln.find("ListenPort=") == 0:
        ln = f"ListenPort={kwargs['listenPort']}\n"
      elif "hostname" in kwargs and ln.find("Hostname=") == 0:
        ln = f"Hostname={kwargs['hostname']}\n"
      tmpConfFile.write(ln)
      ln = confFile.readline()


#*******************************************************************************
def usage(err=None):
  if err:
    print(err)
  print('''
Usage:
  agent start|stop|restart all|<version> hostip
  agent install|uninstall all|version [hostip]

  If hostip is allowed, the host.list file is used. 

  Example: agent start v3.4 192.168.27.35
           agent stop all 192.168.27.35
           agent uninstall all
''')

#*******************************************************************************
def cmdExe(cmd=None, ver=None, host=None, noColor=Log.COLOR):
  cmdSet1 = ("start", "stop", "restart")
  cmdSet2 = ("install", "uninstall")

  if not(cmd in cmdSet1 or cmd in cmdSet2):
    usage(f"Parameters error. Invalid command: \"{cmd}\"")
    return 1

  if not ver or not(ver in (filter(None, [None if attr[0] != "v" else attr.replace("_", ".") for attr in dir(config)]) + ["all"])):
    usage(f"Parameters error. Invalid version: \"{ver}\"")
    return 1

  if cmd in cmdSet1 and not host:
    usage("Parameters error. No Host")
    return 1

  if cmd in cmdSet1:
    log = Log(None, noColor)
  else:
    log = Log(cfg.INSTALL_LOG, noColor)

  log.header1()
  if cmd == "start":
    msgBefore = ("Starting agent(s) ... ", {"out": Log.CONSOLE})
    msgAfter = ("Agent(s) started ... ", {"out": Log.CONSOLE})
  elif cmd == "stop":
    msgBefore = ("Stopping agent(s) ... ", {"out": Log.CONSOLE})
    msgAfter = ("Agent(s) stopped ... ", {"out": Log.CONSOLE})
  elif cmd == "restart":
    msgBefore = ("Restarting agent(s) ... ", {"out": Log.CONSOLE})
    msgAfter = ("Agent(s) restarted ... ", {"out": Log.CONSOLE})
  elif cmd == "install":
    msgBefore = ("Install agent(s) ... ", {"out": Log.CONSOLE+Log.FILE})
    msgAfter = ("Agent(s) installed ... ", {"out": Log.CONSOLE+Log.FILE})
  elif cmd == "uninstall":
    msgBefore = ("Uninstall agent(s) ... ", {"out": Log.CONSOLE+Log.FILE})
    msgAfter = ("Agent(s) uninstalled ... ", {"out": Log.CONSOLE+Log.FILE})
 
  total = 0
  fail = 0
  err = 0
  log.writeln(msgBefore[0], **msgBefore[1])

  return

  if host:
    err = cmdExeHost(cmd, ver, host, log)
    fail += err
    total += 1
  else:
    listFilePath = cfg.HOSTLIST
    tmpListFilePath = f"{cfg.HOSTLIST}.tmp"
    with open(listFilePath, "r") as listFile, open(tmpListFilePath, "w") as tmpListFile:
      host = listFile.readline()
      while host:
        host = host.decode("utf-8").strip()
        if host == '' or host.find("#") == 0 or host.find(";") == 0:
          tmpListFile.write(f"{host.encode('utf-8')}\n")
          host = listFile.readline()
          continue
        err = cmdExeHost(cmd, ver, host, log)
        if err:
          tmpListFile.write(f"{host.encode('utf-8')}\n")
        else:
          tmpListFile.write(f";{host.encode('utf-8')}\n")
        fail += err
        total += 1
        host = listFile.readline()
    stat = os.stat(listFilePath)
    os.rename(tmpListFilePath, listFilePath)
    #os.chmod(listFilePath, stat.st_mode)
    os.chown(listFilePath, stat.st_uid, stat.st_gid)
  log.write(msgAfter[0], **msgAfter[1])
  if err:
    log.fail()
  else:
    log.success()
  log.header1()
  log.writeln(f"Processed failed: {log.red(fail) if fail > 0 else log.green(fail)}  total: {log.green(total)}")
  log.close()
  return 0 if fail == 0 else 1

#*******************************************************************************
def cmdExeHost(cmd, ver, host, log):
  try:
    log.header2(f"Host {host} ")
    result = re.match(r"([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}).*", host)
    if result:
      hostIp = result.group(1)
    else:
      hostIp = socket.gethostbyname(host.strip())
    sudo = cmd in ("install", "uninstall")
    rmt = Agent.connect(hostIp, sudo)
    log.writeln('  {} {} {} {}'.format(rmt.hostname, rmt.hostIp, rmt.os, rmt.xOS))
    log.writeln()
    err = 0
    if ver == "all":
      #-------------------------------------------------------------------------
      # удалить все установленные агенты
      if cmd == "uninstall":
        err = rmt.agent.cmdUninstall(ver, rmt, log)
        if err == 2:
          log.writeln("  No installed agents")
          err = 0
      #-------------------------------------------------------------------------
      # операции для агентов всех версий из config
      elif cmd in ("install", "start", "stop", "restart"):
        #-----------------------------------------------------------------------
        # установить агенты всех версий из config
        if cmd == "install":
          #---------------------------------------------------------------------
          # удалить все установленные агенты перед установкой
          err = rmt.agent.cmdUninstall(ver, rmt, log)
          if err in (0, 2):
            err = 0
          else:
            log.writeln()
        #-----------------------------------------------------------------------
        # start/stop/restart агентов всех версий из config
        if not err:
          versions = [ver[0] for ver in inspect.getmembers(config, predicate=inspect.isclass)]
          for ver in versions:
            if ver == "Common":
              continue
            err += cmdExeVer(cmd, ver, rmt, log)
    #---------------------------------------------------------------------------
    # для агента указанной версии
    else:
      err = cmdExeVer(cmd, ver, rmt, log)
    #---------------------------------------------------------------------------
    rmt.exit()
    return 0 if err == 0 else 1
  #-----------------------------------------------------------------------------
  except ExceptionAgent as exc:
    log.err(exc.errMsg)
    if "rmt" in locals():
      rmt.exit()
    return 1

#*******************************************************************************
def cmdExeVer(cmd, ver, rmt, log):
  cfgVer = ver.replace(".", "_")
  cfg = getattr(__import__("AppAgent.config", fromlist = [cfgVer]), cfgVer)
  err = 0
  #-----------------------------------------------------------------------------
  # install
  if cmd == "install":
    log.writeln("  Agent version: {}".format(cfg.AGENT_VER))
    err = rmt.agent.cmdUninstall(ver, rmt, log)
    if err in (0, 2):
      err = rmt.agent.cmdInstall(cfg, rmt, log)
      msg = "    installed ... "
      if err:
        log.writeln(msg, Log.FAIL)
      else:
        log.writeln(msg, Log.SUCCESS)

  #-----------------------------------------------------------------------------
  # uninstall
  elif cmd == 'uninstall':
    err = rmt.agent.cmdUninstall(ver, rmt, log)
    if err == 2:
      log.writeln("  No installed agents")
      err = 0

  #-----------------------------------------------------------------------------
  # start
  elif cmd == "start":
    log.writeln(f"  Agent version: {cfg.AGENT_VER}")
    err = rmt.agent.cmdStart(cfg, rmt, log)
    msg = "  Agent started ... "
    if err == 0:
      log.writeln(msg, Log.SUCCESS)
    elif err == 2:
      log.write(msg)
      log.fail("not installed")
    else:
      log.writeln(msg, Log.FAIL)
  #-----------------------------------------------------------------------------
  # stop
  elif cmd == "stop":
    log.writeln(f"  Agent version: {cfg.AGENT_VER}")
    err = rmt.agent.cmdStop(cfg, rmt, log)
    msg = "  Agent stopped ... "
    if err == 0:
      log.writeln(msg, Log.SUCCESS)
    elif err == 2:
      log.write(msg)
      log.fail("not installed")
    else:
      log.writeln(msg, Log.FAIL)
  #-----------------------------------------------------------------------------
  # restart
  elif cmd == "restart":
    log.writeln(f"  Agent version: {cfg.AGENT_VER}")
    err = rmt.agent.cmdRestart(cfg, rmt, log)
    msg = "  Agent restarted ... "
    if err == 0:
      log.writeln(msg, Log.SUCCESS)
    elif err == 2:
      log.write(msg)
      log.fail("not installed")
    else:
      log.writeln(msg, Log.FAIL)
  #-----------------------------------------------------------------------------
  log.writeln()
  return err
