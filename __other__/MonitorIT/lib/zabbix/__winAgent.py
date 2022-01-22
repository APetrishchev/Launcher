#!/usr/bin/python
#-*- coding: utf-8 -*-
from __future__ import unicode_literals

import os, re, shutil
from log import Log
from agent import Agent
from exceptions import ExceptionAgent
# from *** import cfg, rmt, log

#*******************************************************************************
class Error:
  SUCCESS = 0
  FILE_NOT_FOUND = 2
  PATH_NOT_FOUND = 3
  DIR_NOT_EMPTY = 145
  SERVICE_ALREADY_RUNNING = 1056
  SERVICE_DOES_NOT_EXIST = 1060
  SERVICE_NOT_ACTIVE = 1062

#*******************************************************************************
class WinAgent(Agent):
  @staticmethod
  def cmdStart(cfg, rmt, log):
    rmt.ctrlService("start", cfg.WIN_SERVICE_NAME)
    if rmt.errCode in (Error.SUCCESS, Error.SERVICE_ALREADY_RUNNING):
      return 0
    elif rmt.errCode == Error.SERVICE_DOES_NOT_EXIST:
      return 2
    else:
      log.err(rmt.errMsg)
      return 1

  @staticmethod
  def cmdStop(cfg, rmt, log):
    rmt.ctrlService("stop", cfg.WIN_SERVICE_NAME)
    if rmt.errCode in (Error.SUCCESS, Error.SERVICE_NOT_ACTIVE):
      return 0
    elif rmt.errCode == Error.SERVICE_DOES_NOT_EXIST:
      return 2
    else:
      log.err(rmt.errMsg)
      return 1

  @staticmethod
  def cmdRestart(cfg, rmt, log):
    rmt.ctrlService("stop", cfg.WIN_SERVICE_NAME)
    if rmt.errCode in (Error.SUCCESS, Error.SERVICE_NOT_ACTIVE):
      rmt.ctrlService("start", cfg.WIN_SERVICE_NAME)
      if rmt.errCode == Error.SUCCESS:
        return 0
      else:
        return 1
    elif rmt.errCode == Error.SERVICE_DOES_NOT_EXIST:
      return 2
    else:
      log.err(rmt.errMsg)
      return 1

  @staticmethod
  def cmdInstall(cfg, rmt, log):
    try:
      LOC_TMP_PATH = os.path.join(cfg.LOC_TMP_PATH, rmt.hostIp)
      # проверить папку с файлами агента устанавливаемой версии
      LOC_AGENT_VER_PATH = os.path.join(cfg.LOC_AGENTS_PATH, 'win', cfg.AGENT_VER)
      LOC_AGENT_xOS_PATH = os.path.join(LOC_AGENT_VER_PATH, rmt.xOS)
      if not os.path.isdir(LOC_AGENT_xOS_PATH):
        log.writeln(f"    Check dir for agent {cfg.AGENT_VER} ... ", Log.FAIL)
        raise ExceptionAgent(None, f"    Local dir {LOC_AGENT_xOS_PATH} is not exists")
      try:
        #-------------------------------------------------------------------------
        # копировать исходные файлы во временную папку
        dst = os.path.join(LOC_TMP_PATH, cfg.AGENT_VER)
        msg = f"    Copy {LOC_AGENT_xOS_PATH} to {dst} ... "
        shutil.copytree(LOC_AGENT_xOS_PATH, dst)
        #-------------------------------------------------------------------------
        WinAgent.prepareConfig(rmt)
      except IOError, exc:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(None, str(exc))
      #-------------------------------------------------------------------------
      # удалить файлы и папку агента
      rmt.delTree(cfg.WIN_AGENT_VER_PATH)
      if not rmt.errCode in (Error.SUCCESS, Error.FILE_NOT_FOUND, Error.PATH_NOT_FOUND):
        log.writeln(f'    Delete dir "{cfg.WIN_AGENT_VER_PATH}" ... ', Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      #---------------------------------------------------------------------------
      # создать папку WIN_AGENT_VER_PATH и копировать файлы из tmp
      rmt.mkDir(cfg.WIN_AGENT_VER_PATH)
      msg = f"    Create dir {cfg.WIN_AGENT_VER_PATH} on remote host ... "
      if rmt.errCode != Error.SUCCESS:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      rmt.ftpDnldDir(cfg.FTP_SERVER, f"{rmt.hostIp}/{cfg.AGENT_VER}", cfg.WIN_AGENT_VER_PATH)
      msg = f"    Copy files to {cfg.WIN_AGENT_VER_PATH} on remote host ... "
      if rmt.errCode != Error.SUCCESS:
        log.writeln(msg, Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      #---------------------------------------------------------------------------
      # удалить временную папку
      try:
        shutil.rmtree(LOC_TMP_PATH)
      except IOError, exc:
        log.writeln(f"    Delete dir {LOC_TMP_PATH} ... ", Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
      # установить сервис
      WinAgent.installService(rmt)
      # запустить агент
      WinAgent.startService(rmt)
      #---------------------------------------------------------------------------
      # подключить сетевой диск
      #for diskLtr in "zyxvtsrqponm":
      #  if rmt.isDiskExists(diskLtr) == 0:
      #    break
      #else:
      #  raise ExceptionAgent('Not selected letter for remote disk')
      #diskLtr = "{diskLtr}:\\"
      #print(diskLtr)
      #rmt.mntDisk()
      return 0
    except ExceptionAgent, exc:
      #-------------------------------------------------------------------------
      # удалить временную папку
      if os.path.isdir(LOC_TMP_PATH):
        shutil.rmtree(LOC_TMP_PATH, True)
      log.err(exc.errMsg)
      return 1

  @staticmethod
  def prepareConfig(rmt):
    """подготовить конфигурационный файл"""
    msg = "    Prepare config file ... "
    logFilePath = f"{cfg.WIN_AGENT_VER_PATH}\\{cfg.DEFAULT_DAEMON_NAME}.log"
    LOC_TMP_CONF_PATH = os.path.join(LOC_TMP_PATH, cfg.AGENT_VER, f"{cfg.DEFAULT_DAEMON_NAME}.conf")
    locConfPath = os.path.join(LOC_AGENT_VER_PATH, f"{cfg.DEFAULT_DAEMON_NAME}.conf.tmpl")
    with open(locConfPath, "r") as confFile, open(LOC_TMP_CONF_PATH, "w") as tmpConfFile:
      Agent.prepareConfig(
        confFile,
        tmpConfFile,
        hostname = rmt.hostname,
        logFile = logFilePath,
        serverIp = cfg.SERVER_IP,
        listenPort = cfg.AGENT_PORT_ENA
      )

  @staticmethod
  def installService(rmt):
    """установить сервис"""
    binPath = f"{cfg.WIN_AGENT_VER_PATH}\\{cfg.DEFAULT_DAEMON_NAME}.exe --config {cfg.WIN_AGENT_VER_PATH}\\{cfg.DEFAULT_DAEMON_NAME}.conf"
    dispName = cfg.WIN_SERVICE_NAME
    start = "auto"
    descr = "Provides system monitoring"
    rmt.installService(cfg.WIN_SERVICE_NAME, binPath, dispName, start, descr)
    if rmt.errCode != Error.SUCCESS:
      log.writeln("    Innstall service ... ", Log.FAIL)
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)

  @staticmethod
  def startService(rmt):
    """запустить агент"""
    rmt.ctrlService("start", cfg.WIN_SERVICE_NAME)
    if rmt.errCode != Error.SUCCESS:
      log.writeln("    Starting agent ... ", Log.FAIL)
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)

  @staticmethod
  def cmdUninstall(ver, rmt, log):
    #---------------------------------------------------------------------------
    # получить список сервисов
    srvNames = rmt.execute("SC queryex type= service state= all")
    if rmt.errCode != Error.SUCCESS:
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)
    if not srvNames:
      return 2
    err = 0
    excMsg = "    uninstalled ... "
    for srvName in srvNames:
      #-------------------------------------------------------------------------
      # выбрать сервисы zabbix
      srvName = re.search("(SERVICE_NAME:|ИМЯ_СЛУЖБЫ:) (ZABBIX.*)", srvName, flags=re.I+re.U)
      if srvName:
        SERVICE_NAME = srvName.group(2)
        #-----------------------------------------------------------------------
        # получить конфигурации сервисов
        srvConfs = rmt.ctrlService("qc", SERVICE_NAME)
        if rmt.errCode != Error.SUCCESS:
          raise ExceptionAgent(rmt.errCode, rmt.errMsg)
        if not srvConfs:
          continue
        for srvConf in srvConfs:
          srvConf = re.search("(binPath|ИМЯ_ДВОИЧНОГО_ФАЙЛА[\s]*:) (.*)", srvConf, flags=re.I+re.U)
          if not srvConf:
            continue
          try:
            verPath = srvConf.group(2).split()[0].strip().split('\\')[:-1]
            AGENT_PATH = "\\".join(verPath)
            AGENT_HOME_PATH = "\\".join(verPath[:-1])            
            log.writeln(f"  {SERVICE_NAME}")
						WinAgent.deleteService(rmt)
            WinAgent.deleteAgentFolder(rmt)
            log.writeln(excMsg, Log.SUCCESS)
          #---------------------------------------------------------------------
          except ExceptionAgent, exc:
            log.err(exc.errMsg)
            log.writeln(excMsg, Log.FAIL)
            err += 1
    return 0 if err == 0 else 1

  @staticmethod
  def deleteService(rmt):
    """остановить и удалить сервис"""
    rmt.ctrlService("stop", SERVICE_NAME)
    if rmt.errCode in (Error.SUCCESS, Error.SERVICE_NOT_ACTIVE):
      rmt.ctrlService("delete", SERVICE_NAME)
      if rmt.errCode != Error.SUCCESS:
        log.writeln("    Uninstall service ... ", Log.FAIL)
        raise ExceptionAgent(rmt.errCode, rmt.errMsg)
    elif rmt.errCode != Error.SERVICE_DOES_NOT_EXIST:
      log.writeln("    Stop service ... ", Log.FAIL)
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)

  @staticmethod
  def deleteAgentFolder(rmt):
    """удалить файлы и папку агента если она пуста"""
    rmt.delTree(AGENT_PATH)
    if not rmt.errCode in (Error.SUCCESS, Error.FILE_NOT_FOUND, Error.PATH_NOT_FOUND):
      log.writeln(f"    Delete dir {AGENT_PATH} ... ", Log.FAIL)
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)
    rmt.delDir(AGENT_HOME_PATH)
    if not rmt.errCode in (Error.SUCCESS, Error.DIR_NOT_EMPTY):
      log.writeln(f"    Delete dir {AGENT_HOME_PATH} ... ", Log.FAIL)
      raise ExceptionAgent(rmt.errCode, rmt.errMsg)
