package controller

import (
	"log"
	"os"
	"runtime"
	"strings"
)

var logFile *os.File

type LogType struct {
	Write       *log.Logger
	Header      *log.Logger
	Info        *log.Logger
	Warning     *log.Logger
	Error       *log.Logger
	LogFilePath string
}

func (self *LogType) Open() {
	if self.LogFilePath != "" {
		var err error
		logFile, err = os.OpenFile(self.LogFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0660)
		if err != nil {
			log.Fatalln("Failed to open log file ", self.LogFilePath, ":", err)
		}
	} else {
		logFile = os.Stdout
	}
	self.Header = log.New(logFile, strings.Repeat("*", 80)+"\n", 0)
	self.Write = log.New(logFile, "", 0)
	self.Info = log.New(logFile, "INFO: ", log.Ldate|log.Ltime)
	self.Warning = log.New(logFile, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	self.Error = log.New(logFile, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func (self *LogType) Close() {
	if self.LogFilePath != "" {
		logFile.Close()
	}
}

func (self *LogType) Trace() {
	buf := make([]byte, 1<<20)
	n := runtime.Stack(buf, true)
	self.Write.Printf("%s\n", buf[:n])
}
