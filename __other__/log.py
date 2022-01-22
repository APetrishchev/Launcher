# -*- coding: utf-8 -*-
from __future__ import unicode_literals

#*** ISSUE *********************************************************************
#
#*******************************************************************************

import sys, os, time, datetime
from config import Config as Cfg
from lang.en_en import *

#*******************************************************************************
#*******************************************************************************
class Log():

#*******************************************************************************
  def __init__(self):
    self.lastErr = None
    self.attempts = 1

#*******************************************************************************
  def __call__(self, *args):
    self.log(*args)

#*******************************************************************************
  def log(self, *args):
    def logIt():
      msg  = '[%s] ' % datetime.datetime.now()
      msg += '[%s] ' % Event.cls[Event.evn[args[0]][0]] # class
      msg += '[%s] ' % Event.lvl[Event.evn[args[0]][1]] # level
      msg += '[%s] ' % Event.stat[Event.evn[args[0]][2]] # stat
      msg += '[%s] ' % Event.obj[Event.evn[args[0]][3]] # object
      if len(args) > 1:
        msg += '[%s] ' % Event.evn[args[0]][4].format(*args[1:]) # description
      else:
        msg += '[%s] ' % Event.evn[args[0]][4] # description
      msg += '\n'
      if os.path.isfile(Cfg.LOG_FILENAME) and os.path.getsize(Cfg.LOG_FILENAME) > Cfg.LOG_FILEMAXSIZE:
        Cfg.LOG_FILENAME = os.path.join(self.logFileDir, self.serviceName.lower() + datetime.datetime.now().strftime('_%Y%m%d_%H%M%S') + u'.log')
      file(Cfg.LOG_FILENAME,'a+').write(msg)
      return

    msg = ''
    if isinstance(args[0], int):
      if Cfg.LOG_DEBUGLEVEL >= Event.evn[args[0]][1] or Cfg.LOG_DEBUGLEVEL >= Cfg.LOG_DEBUG_LEVEL:
        if not self.lastErr == args[0]:
          if self.attempts > 1:
            msg = '%s\n' % Message.lastEvnOccurred.format(self.attempts,)
            file(Cfg.LOG_FILENAME,'a+').write(msg)
            self.attempts = 1
          logIt()
        else:
          self.attempts += 1
          if Cfg.LOG_DEBUGLEVEL >= Cfg.LOG_DEBUG_LEVEL:
            logIt()
      self.lastErr = args[0]
    else:
      file(Cfg.LOG_FILENAME,'a+').write(args[0])

#*******************************************************************************
#*******************************************************************************
class Event():
  def enum():
    for i in xrange(00, 1000000):
      yield i

  i = enum()
  cls = {}
  CLASS_OPERATE = i.next()
  cls[CLASS_OPERATE] = Message.eventClassOperate
  CLASS_SEQURE = i.next()
  cls[CLASS_SEQURE] = Message.eventClassSequre

  i = enum()
  lvl = {}
  LEVEL_NONE = i.next()
  lvl[LEVEL_NONE] = Message.eventLevelNone
  LEVEL_MAJOR = i.next()
  lvl[LEVEL_MAJOR] = Message.eventLevelMajor
  LEVEL_MINOR = i.next()
  lvl[LEVEL_MINOR] = Message.eventLevelMinor
  LEVEL_WARNING = i.next()
  lvl[LEVEL_WARNING] = Message.eventLevelWarn
  LEVEL_INFO = i.next()
  lvl[LEVEL_INFO] = Message.eventLevelInfo
  LEVEL_DETAIL = i.next()
  lvl[LEVEL_DETAIL] = Message.eventLevelDetail

  i = enum()
  stat = {}
  STAT_OK = i.next()
  stat[STAT_OK] = Message.eventStatOk
  STAT_PROBLEM = i.next()
  stat[STAT_PROBLEM] = Message.eventStatProblem

  i = enum()
  obj = {}
  OBJECT_APPLICATION = i.next()
  obj[OBJECT_APPLICATION] = Message.eventObjectApplication
  OBJECT_DB = i.next()
  obj[OBJECT_DB] = Message.eventObjectDb
  OBJECT_CONSOLE = i.next()
  obj[OBJECT_CONSOLE] = Message.eventObjectConsole
  OBJECT_MONITOR = i.next()
  obj[OBJECT_MONITOR] = Message.eventObjectMonitor

  i = enum()
  evn = {}
  #(class, level, object, status, description)
  PID_WRITE_ERR = i.next()
  evn[PID_WRITE_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_APPLICATION, Message.pidWriteErr,)
  FORK_ERR = i.next()
  evn[FORK_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_APPLICATION, Message.forkErr,)

  DB_CONN_OK = i.next()
  evn[DB_CONN_OK] = (CLASS_OPERATE, LEVEL_INFO, STAT_OK, OBJECT_DB, Message.dbConnOk,)
  DB_CONN_ERR = i.next()
  evn[DB_CONN_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_DB, Message.dbConnErr,)
  DB_CONN_PORT_ERR = i.next()
  evn[DB_CONN_PORT_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_DB, Message.dbConnPortErr,)
  DB_NAME_ERR = i.next()
  evn[DB_NAME_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_DB, Message.dbNameErr,)
  DB_OTHER_ERR = i.next()
  evn[DB_OTHER_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_DB, Message.dbOtherErr,)
  DB_USER_ERR = i.next()
  evn[DB_USER_ERR] = (CLASS_OPERATE, LEVEL_MAJOR, STAT_PROBLEM, OBJECT_DB, Message.dbUserErr,)
  DB_DISCONN_OK = i.next()
  evn[DB_DISCONN_OK] = (CLASS_OPERATE, LEVEL_INFO, STAT_OK, OBJECT_DB, Message.dbDisconnOk,)

  MONITOR_EVENT_START = i.next()
  evn[MONITOR_EVENT_START] = (CLASS_OPERATE, LEVEL_INFO, STAT_OK, OBJECT_MONITOR, Message.monEvnSrvcStarted,)
  MONITOR_EVENT_HEARTBEAT = i.next()
  evn[MONITOR_EVENT_HEARTBEAT] = (CLASS_OPERATE, LEVEL_INFO, STAT_OK, OBJECT_MONITOR, Message.monEvnSrvcHeartbeat,)
  MONITOR_EVENT_STOP = i.next()
  evn[MONITOR_EVENT_STOP] = (CLASS_OPERATE, LEVEL_INFO, STAT_OK, OBJECT_MONITOR, Message.monEvnSrvcStopped,)

  SRVC_STARTED = i.next()
  evn[SRVC_STARTED] = (CLASS_OPERATE, LEVEL_NONE, STAT_OK, OBJECT_APPLICATION, Message.srvcStarted,)
  SRVC_STOPPED = i.next()
  evn[SRVC_STOPPED] = (CLASS_OPERATE, LEVEL_NONE, STAT_OK, OBJECT_APPLICATION, Message.srvcStopped,)

  CONSOLE_STARTED = i.next()
  evn[CONSOLE_STARTED] = (CLASS_OPERATE, LEVEL_NONE, STAT_OK, OBJECT_CONSOLE, Message.conStarted,)
  CONSOLE_STOPPED = i.next()
  evn[CONSOLE_STOPPED] = (CLASS_OPERATE, LEVEL_NONE, STAT_OK, OBJECT_CONSOLE, Message.conStopped,)
  CONSOLE_CONN = i.next()
  evn[CONSOLE_CONN] = (CLASS_SEQURE, LEVEL_NONE, STAT_OK, OBJECT_CONSOLE, Message.conConn,)
  CONSOLE_DISCON = i.next()
  evn[CONSOLE_DISCON] = (CLASS_SEQURE, LEVEL_NONE, STAT_OK, OBJECT_CONSOLE, Message.conDiscon,)
  EXEC_CMD = i.next()
  evn[EXEC_CMD] = (CLASS_SEQURE, LEVEL_INFO, STAT_OK, OBJECT_CONSOLE, Message.execCmd,)
