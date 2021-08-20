package controller

import (
	"log"
	"os"
	"runtime"
	"strings"
)


type LogType struct {
	Write       *log.Logger
	Header      *log.Logger
	Info        *log.Logger
	Warning     *log.Logger
	Error       *log.Logger
	LogFilePath string
}
var (
	logFile *os.File
	Log *LogType
)

func (self *LogType) Open() (err error) {
	if self.LogFilePath != "" {
		logFile, err = os.OpenFile(self.LogFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0660)
		if err != nil {
			return err
		}
	} else {
		logFile = os.Stdout
	}
	self.Header = log.New(logFile, strings.Repeat("*", 80)+"\n", 0)
	self.Write = log.New(logFile, "", 0)
	self.Info = log.New(logFile, "\033[32mINFO:\033[0m ", log.Ldate|log.Ltime)
	self.Warning = log.New(logFile, "\033[33mWARNING:\033[0m ", log.Ldate|log.Ltime|log.Lshortfile)
	self.Error = log.New(logFile, "\033[31mERROR:\033[0m ", log.Ldate|log.Ltime|log.Lshortfile)
	Log = self
	return nil
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
