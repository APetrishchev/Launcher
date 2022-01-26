import os, re, shutil, errno
from log import Log
from pexpect.exceptions import TIMEOUT
from agent import Agent
from service.remote import SFTPClient
from exceptions import ExceptionAgent

#*******************************************************************************
class NixAgent(Agent):

  @staticmethod
  def cmdStart(cfg, rmt, log):
    rmt.ctrlService("start", cfg.NIX_SERVICE_NAME)
    if rmt.errCode in (0, ):
      return 0
    elif rmt.systemd and rmt.errCode == 5:
      return 2
    #elif not rmt.systemd and rmt.errCode == -5:
    #  return 2
    else:
      log.err(rmt.errMsg)
      return 1

  @staticmethod
  def cmdStop(cfg, rmt, log):
    rmt.ctrlService("stop", cfg.NIX_SERVICE_NAME)
    if rmt.errCode in (0, ):
      return 0
    elif rmt.systemd and rmt.errCode == 5:
      return 2
    #elif not rmt.systemd and rmt.errCode == -5:
    #  return 2
    else:
      log.err(rmt.errMsg)
      return 1

  @staticmethod
  def cmdRestart(cfg, rmt, log):
    rmt.ctrlService("restart", cfg.NIX_SERVICE_NAME)
    if rmt.errCode in (0, ):
      return 0
    elif rmt.systemd and rmt.errCode == 5:
      return 2
    #elif not rmt.systemd and rmt.errCode == -5:
    #  return 2
    else:
      log.err(rmt.errMsg)
      return 1

  @staticmethod
  def cmdInstall(cfg, rmt, log):
    try:
      #-------------------------------------------------------------------------
      # на удаленном хосте определить имя OS
      OS_NAME = rmt.getOsName()
      if rmt.errCode != 0:
        log.writeln("    Determination of the OS name ... ", Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      #-------------------------------------------------------------------------
      # на удаленном хосте определить версию ядра OS
      kernelVer = rmt.kernelVer()
      if rmt.errCode != 0:
        log.writeln("    Determination of the kernel version ... ", Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      kernelVer = kernelVer.split('.')
      if kernelVer[0] == 2 and kernelVer[1] <= 4:
        KERNEL_VER = "linux_2.4"
      else:
        KERNEL_VER = "linux_2.6"

      #-------------------------------------------------------------------------
      # на локальном хосте подготовить пути для временной папки
      LOC_TMP_PATH = os.path.join(
        cfg.LOC_TMP_PATH,
        rmt.hostIp
      )
      LOC_TMP_AGENT_PATH = os.path.join(
        LOC_TMP_PATH,
        cfg.AGENT_VER
      )

      #-------------------------------------------------------------------------
      # на локальном хосте проверить папку с файлами агента устанавливаемой версии
      locAgentPath = os.path.join(cfg.LOC_AGENTS_PATH, OS_NAME, KERNEL_VER, cfg.AGENT_VER, rmt.xOS)
      if not os.path.isdir(locAgentPath):
        log.writeln(f"    Check dir for agent {cfg.AGENT_VER} ... " Log.FAIL)
        raise ExceptionAgent(None, f"    Source dir {locAgentPath} is not exists")

      #-------------------------------------------------------------------------
      try:
        #-----------------------------------------------------------------------
        # на локальном хосте создать папку в TMP и копировать файлы агента из исходной папки
        msg = f"    Copy {locAgentPath} to {LOC_TMP_AGENT_PATH} ... "
        shutil.copytree(locAgentPath, LOC_TMP_AGENT_PATH)

        #-----------------------------------------------------------------------
        # на локальном хосте подготовить конфигурационный файл
        msg = "    Prepare config file ... "
        pidFilePath = os.path.join(cfg.NIX_AGENT_VER_PATH, f"{cfg.DEFAULT_DAEMON_NAME}.pid")
        logFilePath = os.path.join(cfg.NIX_AGENT_VER_PATH, f"{cfg.DEFAULT_DAEMON_NAME}.log")
        locTmpConfPath = os.path.join(LOC_TMP_AGENT_PATH, f"{cfg.DEFAULT_DAEMON_NAME}.conf")
        locConfPath = os.path.join(cfg.LOC_AGENTS_PATH, OS_NAME, "tmpl", f"{cfg.DEFAULT_DAEMON_NAME}.conf")
        with open(locConfPath, "r") as confFile, open(locTmpConfPath, 'w') as tmpConfFile:
          NixAgent.prepareConfig(
            confFile,
            tmpConfFile,
            hostname = rmt.hostname,
            logFile = logFilePath,
            pidFile = pidFilePath,
            serverIp = cfg.SERVER_IP,
            listenPort = cfg.AGENT_PORT_ENA
          )
        CONF_PATH = os.path.join(cfg.NIX_AGENT_VER_PATH, f"{cfg.DEFAULT_DAEMON_NAME}.conf")

        #-----------------------------------------------------------------------
        # на локальном хосте подготовить скрипт автозапуска агента
        msg = f"    Prepare {cfg.NIX_SERVICE_NAME} autostart script ... "
        cfgFile = os.path.join(cfg.NIX_AGENT_VER_PATH, f"{cfg.DEFAULT_DAEMON_NAME}.conf")
        ExecStart  = f"{os.path.join(cfg.NIX_AGENT_VER_PATH, "sbin", cfg.DEFAULT_DAEMON_NAME)} -c {cfgFile}"
        TMP_AUTOSTART_FILE_FULLNAME = os.path.join(cfg.NIX_AGENT_VER_PATH, f"{cfg.NIX_DEFAULT_SERVICE_NAME}.init")
        locTmpAutostartPath = os.path.join(LOC_TMP_AGENT_PATH, f"{cfg.NIX_DEFAULT_SERVICE_NAME}.init")
        with open(locTmpAutostartPath, "w") as tmpAutostartFile:
          #---------------------------------------------------------------------
          if rmt.systemd:
            AUTOSTART_FILE_FULLNAME = f"/lib/systemd/system/{cfg.NIX_SERVICE_NAME}.service"
            with open(os.path.join(cfg.LOC_AGENTS_PATH, OS_NAME, "tmpl", "{cfg.NIX_DEFAULT_SERVICE_NAME}.systemd"), "r") as autostartFile:
              ln = autostartFile.readline()
              while ln:
                if ln.find("Environment=") == 0:
                  ln = f'Environment="CONFFILE={cfgFile}"\n'
                elif ln.find("PIDFile=") == 0:
                  ln = f"PIDFile={os.path.join(cfg.NIX_AGENT_VER_PATH, f'{cfg.DEFAULT_DAEMON_NAME}.pid'.)}\n"
                elif ln.find("ExecStart=") == 0:
                  ln = f"ExecStart={ExecStart}\n"
                tmpAutostartFile.write(ln)
                ln = autostartFile.readline()
          #---------------------------------------------------------------------
          else:
            AUTOSTART_FILE_FULLNAME = f"/etc/init.d/{cfg.NIX_SERVICE_NAME}"
            with open(os.path.join(cfg.LOC_AGENTS_PATH, OS_NAME, "tmpl", f"{cfg.NIX_DEFAULT_SERVICE_NAME}.init.d"), "r") as autostartFile:
              ln = autostartFile.readline()
              while ln:
                if ln.find("PIDFILE=") == 0:
                  ln = f"PIDFILE={os.path.join(cfg.NIX_AGENT_VER_PATH, f'{cfg.DEFAULT_DAEMON_NAME}.pid')}\n"
                elif ln.find("START_CMD=") == 0:
                  ln = f'START_CMD="{ExecStart}"\n'
                tmpAutostartFile.write(ln)
                ln = autostartFile.readline()

      except IOError, exc:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(None, str(exc))

      #-------------------------------------------------------------------------
      # User

      # на удаленном хосте создать группу AGENT_USERGROUP
      rmt.addUsergroup(cfg.NIX_AGENT_USERGROUP)
      if not rmt.errCode in (0, 9):
        log.writeln(f'  Create usergroup "{cfg.NIX_AGENT_USERGROUP}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте создать пользователя USER
      agentShell = "/bin/bash"
      rmt.addUser(
        usr = Agent.NIX_USER,
        home = cfg.NIX_AGENT_USER_HOME_PATH,
        sh = agentShell,
        grp = cfg.NIX_AGENT_USERGROUP
      )
      if rmt.errCode == 9:
        rmt.chgUser(
          usr = Agent.NIX_USER,
          home = cfg.NIX_AGENT_USER_HOME_PATH,
          sh = agentShell
        )
        if rmt.errCode != 0:
          log.writeln(
            f'  Change home dir to "{cfg.NIX_AGENT_USER_HOME_PATH}" and shell to "{agentShell}" for user ... ',
            Log.FAIL
          )
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      elif rmt.errCode != 0:
        log.writeln(f'  Create user "{Agent.NIX_USER}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте поменять пароль пользователя
      if rmt.chgPasswd(Agent.NIX_USER, Agent.NIX_PASSWD)!= 0: 
        log.writeln(f'    Change password for user "{Agent.NIX_USER}" ... ', Log.FAIL)
        raise ExceptionAgent(0, rmt.errMsg)

      # на удаленном хосте создать, если не существует, домашнюю папку пользователя
      rmt.mkDir(cfg.NIX_AGENT_HOME_PATH, owner=("root", cfg.NIX_AGENT_USERGROUP), mode="u=rwx,g=rwx,o=")
      if rmt.errCode != 0:
        log.writeln(f'    Create home dir "{cfg.NIX_AGENT_HOME_PATH}" for user ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      #-------------------------------------------------------------------------
      # Copy

      # на удаленном хосте удалить папку AGENT_HOME/agents/AGENT_VER
      rmt.delTree(cfg.NIX_AGENT_VER_PATH)
      if rmt.errCode != 0:
        log.writeln(f'    Delete dir "{cfg.NIX_AGENT_VER_PATH}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      #-------------------------------------------------------------------------
      try:
        # на локальном хосте подключить удаленный хост по sftp
        sftp = SFTPClient.getSFTPClient(Agent.NIX_USER, Agent.NIX_PASSWD, rmt.hostIp)
        # копировать на удаленный хост файлы
        sftp.putDir(LOC_TMP_AGENT_PATH, cfg.NIX_AGENT_HOME_PATH)
        # закрыть sftp соединение
        sftp.close()
      except IOError, exc:
        log.writeln('    Copy files to remote host ... ', Log.FAIL)
        raise ExceptionAgent(None, str(exc))

      # на локальном хосте удалить временную папку
      try:
        shutil.rmtree(LOC_TMP_PATH, True)
      except IOError, exc:
        log.writeln(f"    Delete dir {LOC_TMP_PATH} ... ", Log.FAIL)
        raise ExceptionAgent(None, str(exc))

      # на удаленном хосте изменить владельца и установить разрешения для папки и файлов агента
      rmt.chgOwner("root", cfg.NIX_AGENT_USERGROUP, cfg.NIX_AGENT_HOME_PATH, True)
      if rmt.errCode != 0:
        log.writeln(f'    Change owner for dir "{cfg.NIX_AGENT_HOME_PATH}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      rmt.chgMode("u=rwX,g=rwX,o=rX", cfg.NIX_AGENT_HOME_PATH, True)
      if rmt.errCode != 0:
        log.writeln(f'    Change mode for dir "{cfg.NIX_AGENT_HOME_PATH}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      path = os.path.join(cfg.NIX_AGENT_VER_PATH, "sbin")
      rmt.chgMode("u=rwx,g=rwx,o=rx", path, True)
      if rmt.errCode != 0:
        log.writeln(f'    Change mode for dir "{path}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      path = os.path.join(cfg.NIX_AGENT_VER_PATH, "bin")
      rmt.chgMode('u=rwx,g=rwx,o=rx', path, True)
      if rmt.errCode != 0:
        log.writeln(f'    Change mode for dir "{path}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте переместить скрипт автозапуска агента
      rmt.movFile(TMP_AUTOSTART_FILE_FULLNAME, AUTOSTART_FILE_FULLNAME)
      if rmt.errCode != 0:
        log.writeln(f'    Move autostart script to "{AUTOSTART_FILE_FULLNAME}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      rmt.chgOwner("root", "root", AUTOSTART_FILE_FULLNAME)
      if rmt.errCode != 0:
        log.writeln(f'    Change owner for dir "{AUTOSTART_FILE_FULLNAME}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      if rmt.systemd:
        mode = "u=rw,g=r,o=r"
      else:
        mode = "u=rwx,g=r,o=r"
      rmt.chgMode(mode, AUTOSTART_FILE_FULLNAME, True)
      if rmt.errCode != 0:
        log.writeln(f'    Change mode for "{AUTOSTART_FILE_FULLNAME}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте разрешить пользователю sudo start/stop/restart сервиса "NIX_SERVICE_NAME"
      msg = f'    Enable start/stop/restart for user "{Agent.NIX_USER}" for service "{cfg.NIX_SERVICE_NAME}" ... '
      string  = r""
      if rmt.systemd:
        start = r'{usr}\tALL=(root)\tNOPASSWD: /bin/systemctl start {srv}.service'
        stop = r'{usr}\tALL=(root)\tNOPASSWD: /bin/systemctl stop {srv}.service'
        restart = r'{usr}\tALL=(root)\tNOPASSWD: /bin/systemctl restart {srv}.service'
      else:
        start = r'{usr}\tALL=(root)\tNOPASSWD: /etc/init.d/{srv} start'
        stop = r'{usr}\tALL=(root)\tNOPASSWD: /etc/init.d/{srv} stop'
        restart = r'{usr}\tALL=(root)\tNOPASSWD: /etc/init.d/{srv} restart'
      grep = "cat /etc/sudoers | grep \"$(printf '{}')\""
      start = start.format(usr=Agent.NIX_USER, srv=cfg.NIX_SERVICE_NAME)
      rmt.execute(grep.format(start))
      if rmt.errCode == 1:
        string += r'{}\n'.format(start)
      elif rmt.errCode != 0:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      stop = stop.format(usr=Agent.NIX_USER, srv=cfg.NIX_SERVICE_NAME)
      rmt.execute(grep.format(stop))
      if rmt.errCode == 1:
        string += r'{}\n'.format(stop)
      elif rmt.errCode != 0:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      restart = restart.format(usr=Agent.NIX_USER, srv=cfg.NIX_SERVICE_NAME)
      rmt.execute(grep.format(restart))
      if rmt.errCode == 1:
        string += r'{}\n'.format(restart)
      elif rmt.errCode != 0:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      if string:
        rmt.execute(r'echo -e "{}" >> /etc/sudoers'.format(string))
        if rmt.errCode != 0:
          log.writeln(msg, Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте, если сервис firewalld запущен, разрешить порт на firewall
      result = rmt.execute("systemctl status firewalld.service")
      if re.search("Active:.*active \(running\)", "\n".join(result)):
        msg = f'    Enable port "{cfg.AGENT_PORT_ENA}/tcp" on firewall ... '
        rmt.execute("iptables -L -n | grep {cfg.AGENT_PORT_ENA}")
        if rmt.errCode == 1:
          rmt.execute(
            f"firewall-cmd --permanent --add-port={cfg.AGENT_PORT_ENA}/tcp\
            && firewall-cmd --reload\
            && systemctl restart firewalld"
          )
          if rmt.errCode != 0:
            log.writeln(msg, Log.FAIL)
            raise ExceptionAgent(rmt.errCode, rmt.errMsg)
        elif rmt.errCode != 0:
          log.writeln(msg, Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте перезагрузить systemd daemon
      rmt.ctrlServiceReload()
      if rmt.errCode != 0:
        log.writeln("    Systemd daemon-reload ... ", Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте разрешить systend автозапуск агента
      if rmt.systemd:
        rmt.ctrlService("enable", cfg.NIX_SERVICE_NAME)
        if rmt.errCode != 0:
          log.writeln("    Systemd enable agent ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      # на удаленном хосте старовать агента
      rmt.ctrlService("start", cfg.NIX_SERVICE_NAME)
      if rmt.errCode != 0:
        log.writeln("    Starting agent ... ", Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)

      return 0

    except ExceptionAgent, exc:
      # удалить временную папку
      if os.path.isdir(LOC_TMP_PATH):
        shutil.rmtree(LOC_TMP_PATH, True)
      log.err(exc.errMsg)
      return 1


  @staticmethod
  def cmdUninstall(ver, rmt, log):
    pattern = "^[[:alpha:]]+[[:blank:]]ALL=\(root\)[[:blank:]]NOPASSWD:[[:blank:]]{}$"
    if rmt.systemd:
      AUTOSTART_PATH = "/lib/systemd/system"
      SUDOERS_START_PTRN = pattern.format("/bin/systemctl[[:blank:]]start[[:blank:]]{}.service")
      SUDOERS_STOP_PTRN = pattern.format("/bin/systemctl[[:blank:]]stop[[:blank:]]{}.service")
      SUDOERS_RESTART_PTRN = pattern.format("/bin/systemctl[[:blank:]]restart[[:blank:]]{}.service")
    else:
      AUTOSTART_PATH = "/etc/init.d"
      SUDOERS_START_PTRN = pattern.format("/etc/init.d/{}[[:blank:]]start")
      SUDOERS_STOP_PTRN = pattern.format("/etc/init.d/{}[[:blank:]]stop")
      SUDOERS_RESTART_PTRN = pattern.format("/etc/init.d/{}[[:blank:]]restart")

    # получить список сервисов
    cmdStr = f"ls {AUTOSTART_PATH} | grep -i --color=never ZABBIX"
    if ver != "all":
      cmdStr += f" | grep -i --color=never {ver}"
    srvNames = rmt.execute(cmdStr)
    if not srvNames:
      return 2
    err = 0
    excMsg = "    uninstalled ... "
    for srvName in srvNames:
      try:
        SERVICE_NAME = srvName.strip().rstrip(".service")
        AUTOSTART_FILE_FULLNAME = f"{AUTOSTART_PATH}/{srvName}"
        cmdStr = f"cat {AUTOSTART_FILE_FULLNAME} | grep -i --color=never {{}}"
        cmdStr = cmdStr.format("ExecStart=") if rmt.systemd else cmdStr.format("START_CMD=")
        execStart = rmt.execute(cmdStr)
        if rmt.errCode != 0:
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)
        path = execStart[0][10:].strip().strip('"').strip("'").split(' -c')
        CONF_FILE_PATH = path[1].strip()
        daemonFilePath = path[0].strip().split('/')
        #-----------------------------------------------------------------------
        cmdStr = 'cat {} | grep -i --color=never --regexp="^LogFile="'
        LOG_FILE_PATH = rmt.execute(cmdStr.format(CONF_FILE_PATH))
        if rmt.errCode != 0:
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)
        LOG_FILE_PATH = LOG_FILE_PATH[0][8:].strip()

        AGENT_SBIN_PATH = '/'.join(daemonFilePath[:-1])
        AGENT_PATH = '/'.join(daemonFilePath[:-2])
        AGENT_VER = re.search("v\d+(\.\d+)+", daemonFilePath[-3])
        if AGENT_VER:
          AGENT_VER = AGENT_VER.group(0)
        AGENT_HOME_PATH = "/".join(daemonFilePath[:-3])
        AGENT_BIN_PATH = f"{AGENT_PATH}/bin"

        log.writeln(f"  Agent version: {AGENT_VER}")

        # остановить агента
        rmt.ctrlService("stop", SERVICE_NAME)

        if rmt.systemd and rmt.errCode in (0, 5):
          # запретить автозапуск агента
          rmt.ctrlService("disable", SERVICE_NAME)
          if not rmt.errCode in (0, 1):
            log.writeln("    Systemd disable agent ... ", Log.FAIL)
            raise ExceptionAgent(rmt.errCode, rmt.errMsg)
        elif not rmt.systemd and rmt.errCode in (0, ):
          pass
        else:
          log.writeln("    Stopping agent ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить скрипт автозапуска агента
        rmt.delFile(AUTOSTART_FILE_FULLNAME)
        if rmt.errCode != 0:
          log.writeln(f'    Delete autostart script "{AUTOSTART_FILE_FULLNAME}" ... ', Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить разрешения для пользователя на start/stop/restart из sudoers
        scr = '\n'.join((
          ":>/root/sudoers",
          "chmod u=rw,g=,o= /root/sudoers",
          "fnd=0",
          "while read ln; do",
          f"  if [[ ! $ln =~ {SUDOERS_START_PTRN.format(SERVICE_NAME)} ]] && [[ ! $ln =~ {SUDOERS_STOP_PTRN.format(SERVICE_NAME)} ]] && [[ ! $ln =~ {SUDOERS_RESTART_PTRN.format(SERVICE_NAME)} ]]; then",
          '    >>/root/sudoers echo \"$ln\"',
          "  else",
          "    fnd=1",
          "  fi",
          "done </etc/sudoers",
          "ret=$?",
          "if [ $ret -eq 0 ] && [ $fnd -eq 1 ]; then",
          "  mv -fb /root/sudoers /etc/sudoers",
          "else",
          "  rm -f /root/sudoers",
          "fi"
        ))
        cmdStr  = f">/root/scr echo '{scr}'"
        cmdStr += "&&chmod u+x /root/scr"
        cmdStr += "&&/root/scr"
        cmdStr += "&&rm -f /root/scr"
        rmt.execute(cmdStr)
        if rmt.errCode != 0:
          log.writeln("    Remove start/stop/restart agent from sudoers ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить исполняемый файл
        zbxDaemonFilePath = f"{AGENT_SBIN_PATH}/zabbix_agentd"
        rmt.delFile(zbxDaemonFilePath)
        if rmt.errCode != 0:
          log.writeln(f"    Delete {zbxDaemonFilePath} ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить zabbix_get файл
        zbxGetFilePath = f"{AGENT_BIN_PATH}/zabbix_get"
        rmt.delFile(zbxGetFilePath)
        if rmt.errCode != 0:
          log.writeln(f"    Delete {zbxGetFilePath} ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить zabbix_sender файл
        zbxSndrFilePath = f"{AGENT_BIN_PATH}/zabbix_sender"
        rmt.delFile(zbxSndrFilePath)
        if rmt.errCode != 0:
          log.writeln(f"    Delete {zbxSndrFilePath} ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить .conf файл
        rmt.delFile(CONF_FILE_PATH)
        if rmt.errCode != 0:
          log.writeln(f"    Delete {CONF_FILE_PATH} ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        # удалить .log файл
        rmt.delFile(LOG_FILE_PATH)
        if rmt.errCode != 0:
          log.writeln(f"    Delete {LOG_FILE_PATH} ... ", Log.FAIL)
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        if AGENT_PATH != '/':
          # удалить каталог AGENT_BIN_PATH
          rmt.delDir(AGENT_BIN_PATH)
          if rmt.errCode != 0:
            log.writeln(f"    Delete dir {AGENT_BIN_PATH} ... ", Log.FAIL)
            raise ExceptionAgent(rmt.errCode, rmt.errMsg)

          # удалить каталог AGENT_SBIN_PATH
          rmt.delDir(AGENT_SBIN_PATH)
          if rmt.errCode != 0:
            log.writeln(f"    Delete dir {AGENT_SBIN_PATH} ... ", Log.FAIL)
            raise ExceptionAgent(rmt.errCode, rmt.errMsg)

          # если путь содержит версию, удалить каталог агента
          if AGENT_VER:
            rmt.delDir(AGENT_PATH)
            if rmt.errCode != 0:
              log.writeln(f"    Delete dir {AGENT_PATH} ... ", Log.FAIL)
              raise ExceptionAgent(rmt.errCode, rmt.errMsg)

        log.writeln(excMsg, Log.SUCCESS)

      except ExceptionAgent, exc:
        log.err(exc.errMsg)
        log.writeln(excMsg, Log.FAIL)
        err += 1
      log.writeln()

    return 0 if err == 0 else 1