@echo off
SET ZBX_SERVER=172.28.142.87
SET ZBX_DIR=C:\zabbix_v1.8
SET ZBX_AGENT_CONF=%ZBX_DIR%\zabbix_agentd.conf
SET ZBX_SENDER=%ZBX_DIR%\zabbix_sender.exe

FOR /F "eol=# tokens=1,2 delims==" %%i IN (%ZBX_AGENT_CONF%) DO IF "%%i" == "Hostname" (
  SET HOSTNAME=%%j
  GOTO :ok
)
CLS
ECHO Error: Hostname undefined or file %ZBX_AGENT_CONF% unavailable.
PAUSE 0
GOTO :exit

:ok
REM Silent?
IF "%1"=="-s" GOTO :restart

CLS
SET chr=
SET /P chr=Restart Server "%HOSTNAME%" ? (Y/N): %=%
IF %chr%==Y GOTO :restart
IF %chr%==y GOTO :restart
GOTO :exit

:restart
%ZBX_SENDER% -z %ZBX_SERVER% -p 10051 -s %HOSTNAME% -k PlanRestartSvr -o 1 > nul
C:\WINDOWS\system32\shutdown.exe /r /t 3

:exit
