package controller

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gorilla/securecookie"
	"gopkg.in/ini.v1"
)

type ConfigType struct {
	AppDirPath         string
	IniFilePath        string
	PidFilePath        string
	LogFilePath        string
	DataDirPath        string
	Proto              string
	Host               string
	Port               string
	CertDirPath        string
	CertKeyFileName    string
	CertFileName       string
	BackupDirPath      string
	RootDirPath        string
	SessionAuthKey1    []byte
	SessionEncryptKey1 []byte
	SessionAuthKey2    []byte
	SessionEncryptKey2 []byte
	DbHost             string
	DbPort             int
	DbUser             string
	DbPasswd           string
	DbName             string
	IsChanged          bool
}

var (
	Config *ConfigType
	cfg *ini.File
)

func (self *ConfigType) getSessionKey(key *[]byte, confKey string) {
	str := cfg.Section("session").Key(confKey).String()
	if len(str) == 64 {
		for idx := 0; idx < 64; idx += 2 {
			val, _ := strconv.ParseUint(str[idx:idx+2], 16, 8)
			*key = append(*key, byte(val))
		}
	} else {
		key := securecookie.GenerateRandomKey(32)
		fmt.Printf("%s: %x\n", confKey, key)
    str := fmt.Sprintf("%x", key)
		cfg.Section("session").Key(confKey).SetValue(str)
		self.IsChanged = true
	}
}

func (self *ConfigType) Load() (err error) {
	if cfg, err = ini.Load(self.IniFilePath); err != nil {
		return err
	}
	self.IsChanged = false
	// Path
	self.PidFilePath = cfg.Section("path").Key("pid_file_path").String()
	self.LogFilePath = cfg.Section("path").Key("log_file_path").String()
	if self.LogFilePath != "" && !strings.HasPrefix(self.LogFilePath, "/") {
		self.LogFilePath = filepath.Join(self.AppDirPath, self.LogFilePath)
	}
	self.DataDirPath = cfg.Section("path").Key("data_dir_path").String()
	self.BackupDirPath = cfg.Section("path").Key("backup_dir_path").String()
	self.RootDirPath = cfg.Section("path").Key("root_dir_path").String()
	// Host
	url := strings.Split(cfg.Section("http").Key("url").MustString("http://127.0.0.1"), "://")
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
	// Tls
	self.CertDirPath = cfg.Section("http").Key("cert_dir_path").String()
	self.CertFileName = cfg.Section("http").Key("tls_cert_file_name").MustString("")
	self.CertKeyFileName = cfg.Section("http").Key("tls_key_file_name").MustString("")
	// SessionKey
	self.getSessionKey(&self.SessionAuthKey1, "auth_key_1")
	self.getSessionKey(&self.SessionEncryptKey1, "encrypt_key_1")
	self.getSessionKey(&self.SessionAuthKey2, "auth_key_2")
	self.getSessionKey(&self.SessionEncryptKey2, "encrypt_key_2")
	// Db
	self.DbName = cfg.Section("db").Key("name").String()
	self.DbHost = cfg.Section("db").Key("host").MustString("127.0.0.1")
	self.DbPort = cfg.Section("db").Key("port").MustInt(5432)
	self.DbUser = cfg.Section("db").Key("user").String()
	self.DbPasswd = cfg.Section("db").Key("passwd").String()
	Config = self
	return nil
}

func (self *ConfigType) Save() {
	cfg.SaveTo(self.IniFilePath)
}
