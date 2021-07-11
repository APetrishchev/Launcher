package httpServer_

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/ini.v1"
)

type ConfigType struct {
	conf            *ini.File
	iniFilePath     string
	IsChanged       bool
	AppDirPath      string
	LogFilePath     string
	Proto           string
	Host            string
	Port            string
	CertDirPath     string
	CertKeyFileName string
	CertFileName    string
	DataDirPath     string
	RootDirPath     string
	DbHost          string
	DbPort          int
	DbUser          string
	DbPasswd        string
	DbName          string
}

func (self *ConfigType) Load(args []string) {
	self.IsChanged = false
	var err error
	if self.AppDirPath, err = filepath.Abs(filepath.Dir(args[0])); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	if len(args) > 1 {
		self.iniFilePath = args[1]
	} else {
		self.iniFilePath = filepath.Join(self.AppDirPath, "config", "server.ini")
	}

	if self.conf, err = ini.Load(self.iniFilePath); err == nil {
		// log
		self.LogFilePath = self.conf.Section("http").Key("log_file_path").String()
		if self.LogFilePath != "" && !strings.HasPrefix(self.LogFilePath, "/") {
			self.LogFilePath = filepath.Join(self.AppDirPath, self.LogFilePath)
		}
		// host
		url := strings.Split(self.conf.Section("http").Key("url").MustString("http://127.0.0.1"), "://")
		self.Proto = url[0]
		url = strings.Split(url[1], ":")
		if len(url) == 1 {
			if self.Proto == "https" {
				self.Host = url[0]
				self.Port = "443"
			} else if self.Proto == "http" {
				self.Host = url[0]
				self.Port = "80"
			}
		} else {
			self.Host = url[0]
			self.Port = url[1]
		}
		self.DataDirPath = self.conf.Section("http").Key("data_dir_path").String()
		self.RootDirPath = self.conf.Section("http").Key("root_dir_path").String()
		// tls
		self.CertDirPath = self.conf.Section("http").Key("cert_dir_path").String()
		self.CertFileName = self.conf.Section("http").Key("tls_cert_file_name").MustString("")
		self.CertKeyFileName = self.conf.Section("http").Key("tls_key_file_name").MustString("")
    // db
		self.DbName = self.conf.Section("db").Key("name").String()
		self.DbHost = self.conf.Section("db").Key("host").MustString("127.0.0.1")
		self.DbPort = self.conf.Section("db").Key("port").MustInt(5432)
		self.DbUser = self.conf.Section("db").Key("user").String()
		self.DbPasswd = self.conf.Section("db").Key("passwd").String()

	} else {
		panic(fmt.Sprintf("Fail to read file: %v\n", err))
	}
}

func (self *ConfigType) Save() {
	self.conf.SaveTo(self.iniFilePath)
}
