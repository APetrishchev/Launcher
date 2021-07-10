package server

import (
	"log"
	"os"
	"runtime"
	"strings"
)

var logFile *os.File

type LogType struct {
	Header *log.Logger
	Write  *log.Logger
	//   Trace *log.Logger
	Info        *log.Logger
	Warning     *log.Logger
	Error       *log.Logger
	logFilePath string
}

var Log = &LogType{}

func (self *LogType) Trace() {
	buf := make([]byte, 1<<20)
	n := runtime.Stack(buf, true)
	self.Write.Printf("%s\n", buf[:n])
}

func (self *LogType) Open(logFilePath string) {
	self.logFilePath = logFilePath
	if self.logFilePath != "" {
		var err error
		logFile, err = os.OpenFile(self.logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0660)
		if err != nil {
			log.Fatalln("Failed to open log file ", self.logFilePath, ":", err)
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
	if self.logFilePath != "" {
		logFile.Close()
	}
}
