#! /bin/sh
# /etc/init.d/zabbix_agentd
#

### BEGIN INIT INFO
# Provides:          zabbix_agentd
# Required-Start:    $local_fs $network $named $time $syslog
# Required-Stop:     $local_fs $network $named $time $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Description:       Provides system monitoring
### END INIT INFO

START_CMD="/sbin/zabbix_agentd -c /etc/zabbix/zabbix_agentd.conf"
PIDFILE=/tmp/zabbix_agentd.pid

start() {
  if [ -f "$PIDFILE" ]; then
    printf "zabbix_agentd already running\n" >&2
    return 1
  fi
  printf "Starting zabbix_agentd ..." >&2
  $START_CMD
  printf " ok\n" >&2
}

stop() {
  if [ ! -f "$PIDFILE" ]; then
    printf 'zabbix_agentd not running\n' >&2
    return 1
  fi
  printf 'Stopping zabbix_agentd ..' >&2
  kill -15 $(cat "$PIDFILE")
  time_out=15
  while [ -f "$PIDFILE" ] && [[ $time_out -gt 0 ]]; do
    printf "."
    sleep 1
    time_out=$[ $time_out - 1 ]
  done
  if [[ -z $time_out ]]; then
    printf " fail. Check $PIDFILE\n" >&2
    return 1
  fi
  printf " ok\n" >&2
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart)
    stop
    start
    ;;
  *)
    printf "Usage: /etc/init.d/zabbix_agentd start|stop|restart"
    exit 1
    ;;
esac

exit 0