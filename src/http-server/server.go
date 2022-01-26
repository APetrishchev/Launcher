package main

import (
	"context"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/go-gem/sessions"
)

var (
	log  *controller.LogType
	conf *controller.ConfigType
	err error
)

func CheckDb() (err error) {
	db := &model.DbType{
		Host: conf.DbHost,
		Port: conf.DbPort,
		User: conf.DbUser,
		Passwd: conf.DbPasswd,
		Name: conf.DbName,
	}
	if err = db.Open(); err != nil {
		return err
	}
	db.Close()
	return nil
}

func _init_(args []string) string {
	var appDirPath string
	appDirPath, err = filepath.Abs(filepath.Dir(args[0]))
	if  err != nil {
		return fmt.Sprintln(err)
	}
	// Config file
	iniFilePath := filepath.Join(appDirPath, "config", "server.ini")
	conf = &controller.ConfigType{AppDirPath: appDirPath, IniFilePath: iniFilePath}
	if err = conf.Load(); err != nil {
		return fmt.Sprintf("Fail to read ini file '%s': %v\n", conf.IniFilePath, err)
	}
	// Log file
	log = &controller.LogType{LogFilePath: conf.LogFilePath}
	if err = log.Open(); err != nil {
		return fmt.Sprintf("Failed to open log file '%s': %v", conf.LogFilePath, err)
	}
	defer log.Close()
	return "Ok"
}

func start(args []string) string {
	var pidFile *os.File
	if ret := _init_(args); ret != "Ok" {
		return ret
	}
	// Pid file
	if pidFile, err = os.OpenFile(conf.PidFilePath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0664); err != nil {
		if os.IsExist(err) {
			return fmt.Sprintf("File '%s' is exist. Server already running?\n", conf.PidFilePath)
		}
		return fmt.Sprintf("Fail to create pid file '%s': %v\n", conf.PidFilePath, err)
	}
	if _, err = pidFile.WriteString(strconv.Itoa(os.Getpid())); err != nil {
		return fmt.Sprintf("Fail to write pid file '%s': %v\n", conf.PidFilePath, err)
	}
	if err = pidFile.Close(); err != nil {
		return fmt.Sprintf("Fail to close pid file '%s': %v\n", conf.PidFilePath, err)
	}
	if err = CheckDb(); err != nil {
		return fmt.Sprintf("Failed to open DB '%s': %v", conf.DbName, err)
	}
	var httpServer = &controller.HttpServerType{
		CookieStore: sessions.NewCookieStore(
			conf.SessionAuthKey1, conf.SessionEncryptKey1,
			conf.SessionAuthKey2, conf.SessionEncryptKey2,
		),
	}
	if conf.IsChanged {
		conf.Save()
	}

	host := conf.Host + ":" + conf.Port
	fmt.Printf("Server start at %s ... OK\n", host)
	fmt.Println("Press Ctrl+C for stop server")
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT)
	if conf.Proto == "https" {
		go httpServer.StartHTTPS()
	} else {
		go httpServer.StartHTTP(host, httpServer.Handler)
	}
	<-stop
	log.Write.Println()
	log.Info.Printf("Server stopping ... ")
	_, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		log.Info.Println("Server stop ... OK")
		cancel()
	}()
	if err = httpServer.Server.Shutdown(); err != nil {
		return fmt.Sprintln("Error: %v\n", err)
	}
	if err = os.Remove(conf.PidFilePath); err != nil {
		return fmt.Sprintf("Fail to delete pid file '%s': %v\n", conf.PidFilePath, err)
	}
	return "Ok"
}

func stop(args []string) string {
	var (
		pidFile *os.File
		pidStr []byte
		pid int
	)
	if ret := _init_(args); ret != "Ok" {
		return ret
	}
	if pidFile, err = os.Open(conf.PidFilePath); err != nil {
		if os.IsNotExist(err) {
			return fmt.Sprintf("Pid file '%s' is not exist. Server is not running?\n", conf.PidFilePath)
		}
		return fmt.Sprintf("Fail to open pid file '%s': %v\n", conf.PidFilePath, err)
	}
	if pidStr, err = ioutil.ReadAll(pidFile); err != nil {
		return fmt.Sprintf("Fail to read pid file '%s': %v\n", conf.PidFilePath, err)
	}
	if err = pidFile.Close(); err != nil {
		return fmt.Sprintf("Fail to close pid file '%s': %v\n", conf.PidFilePath, err)
	}
	if pid, err = strconv.Atoi(string(pidStr)); err != nil {
		return fmt.Sprintf("Fail to atoi pid: %v\n", err)
	}
	if err = syscall.Kill(-pid, syscall.SIGTERM); err != nil {
		if errno, ok := err.(syscall.Errno); ok && errno == syscall.ESRCH {
			if err = os.Remove(conf.PidFilePath); err != nil {
				return fmt.Sprintf("Fail to delete pid file '%s': %v\n", conf.PidFilePath, err)
			}
			return fmt.Sprintf("%d - no such process", pid)
		}
		return fmt.Sprintf("Fail to kill: ", err)
	}
	fmt.Println("Server stopping ... Ok")
	return "Ok"
}

func CmdLn() {
	fmt.Println("\n" + strings.Repeat("*", 80))
	var (
		isVer = flag.Bool("V", false, "display version")
		isInit = flag.Bool("init", false, "initialization database")
		isStart = flag.Bool("start", false, "start server")
		// isConf = flag.String("config", "", "config file")
		isStop = flag.Bool("stop", false, "stop server")
		isRestart = flag.Bool("restart", false, "restart server")
		isBackup = flag.Bool("backup", false, "backup database")
		isRestore = flag.Bool("restore", false, "restore database")
	)
	flag.Parse()
	ret := "Ok"

	// fmt.Println(">>>>>>", isConf)
	// if len(flag.Args()) > 0 {
	// 	iniFilePath = flag.Arg(0)
	// }

	if *isVer {
		fmt.Println("v1.0.0")
	}

	if *isInit {
		if ret = _init_(os.Args);	ret == "Ok" {
			if _, err = os.Stat(conf.PidFilePath); err != nil {
				if os.IsNotExist(err) {
					if err = CheckDb(); err != nil {
						ret = fmt.Sprintf("Failed to open DB '%s': %v", conf.DbName, err)
					} else {
						if err = controller.Init(filepath.Join(conf.BackupDirPath, "init", "launcher.json")); err != nil {
							ret = fmt.Sprintf("Error: %v", err)
						}
					}
				} else {
					ret = fmt.Sprintf("Error: %v", err)
				}
			}	else {
				ret = fmt.Sprintf("Pid file '%s' is exist. Server is running?\n", conf.PidFilePath)
			}
		}
	}

	if *isBackup {
	}

	if *isRestore {
	}

	if *isStart {
		ret = start(os.Args)
	}

	if *isStop {
		ret = stop(os.Args)
	}

	if *isRestart {
		if stop(os.Args) == "Ok" {
			ret = start(os.Args)
		}
	}

	if ret == "Ok" {
		os.Exit(0)
	} else {
		fmt.Println(ret)
		os.Exit(1)
	}
}
