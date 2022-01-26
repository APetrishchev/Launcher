#!/bin/bash

. /home/apetrishchev/Portable/Projects/github.com/APetrishchev/Launcher/__BUILD__/build.sh

# go build "$WORKDIR/src/http-server/server.go"

APPNAME=MonitorIT/1.0.0
export GOBIN=/home/apetrishchev/Portable/data/admin/bin/$APPNAME
go install "$WORKDIR/src/$APPNAME/server.go"
# cat /home/apetrishchev/Portable/data/admin/.passwd | sudo --stdin "$GOBIN/server -stop"
# cat /home/apetrishchev/Portable/data/admin/.passwd | sudo --stdin "$GOBIN/server -start"
