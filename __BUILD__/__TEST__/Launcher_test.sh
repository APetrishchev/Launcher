#!/bin/bash

WORKDIR=/home/apetrishchev/Portable/Projects/github.com/APetrishchev/Launcher
export GO111MODULE=off
export GOPATH=$WORKDIR

cd "$WORKDIR/src/Launcher/1.0.0"
go test "./controller/application_test.go"
