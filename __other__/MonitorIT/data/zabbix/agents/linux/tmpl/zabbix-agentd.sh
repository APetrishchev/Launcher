#!/bin/bash

case "$1" in
  start)
    <start>
    ;;
  stop)
    <stop>
    ;;
  restart)
    <restart>
    ;;
  *)
    printf "Usage: z start|stop|restart"
    exit 1
    ;;
esac

exit 0
