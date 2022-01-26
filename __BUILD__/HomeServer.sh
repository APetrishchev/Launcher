#!/bin/bash

. /home/apetrishchev/Portable/Projects/github.com/APetrishchev/Launcher/__BUILD__/build.sh
APPNAME=HomeServer/1.0.0
export GOBIN="/home/apetrishchev/Portable/data/admin/bin/$APPNAME"
go install "$WORKDIR/src/$APPNAME/agent.go"
# "$GOBIN/agent"
