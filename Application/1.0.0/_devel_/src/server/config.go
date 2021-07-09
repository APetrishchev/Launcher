package server

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
	TlsCertFileName string
	TlsKeyFileName  string
}

var Config = &ConfigType{}

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
		self.iniFilePath = filepath.Join(self.AppDirPath, "server.ini")
	}

	if self.conf, err = ini.Load(self.iniFilePath); err == nil {
		self.LogFilePath = self.conf.Section("http").Key("log_file_path").String()
		if self.LogFilePath != "" && !strings.HasPrefix(self.LogFilePath, "/") {
			self.LogFilePath = filepath.Join(self.AppDirPath, self.LogFilePath)
		}
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
		self.CertDirPath = self.conf.Section("http").Key("cert_dir_path").String()
		self.TlsCertFileName = self.conf.Section("http").Key("tls_cert_file_name").MustString("")
		self.TlsKeyFileName = self.conf.Section("http").Key("tls_key_file_name").MustString("")
	} else {
		panic(fmt.Sprintf("Fail to read file: %v\n", err))
	}
}

func (self *ConfigType) Save() {
	self.conf.SaveTo(self.iniFilePath)
}
