package main

import (
	"Application/1.0.0/controller"
	"Application/1.0.0/model"
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

var (
	log *controller.LogType
	conf *controller.ConfigType
)

func initial() {
	log.Open()
	model.Db(conf.DbHost, conf.DbPort, conf.DbUser, conf.DbPasswd, conf.DbName)
	controller.Init(filepath.Join(conf.BackupDirPath, "init", "laucher.json"))
	log.Close()
}

func backup() {
}

func restore() {
}

func start() {
	log.Open()
	log.Write.Println()
	log.Header.Println("Press Ctrl+C for stop server")

	// db := model.Db(conf.DbHost, conf.DbPort, conf.DbUser, conf.DbPasswd, conf.DbName)
	// db.Open()

	// getSessionKey := func(key string) []byte {
	// 	var buf []byte
	// 	str := dtIni.Section("session").Key(key).String()
	// 	if str != "" {
	// 		for _, item := range strings.Fields(str) {
	// 			val, _ := strconv.ParseUint(item, 10, 8)
	// 			buf = append(buf, byte(val))
	// 		}
	// 	} else {
	// 		buf = securecookie.GenerateRandomKey(32)
	// 		str := fmt.Sprintf("%v", buf)
	// 		dtIni.Section("session").Key(key).SetValue(str[1 : len(str)-1])
	// 		conf.IsChanged = true
	// 	}
	// 	return buf
	// }

	// httpServer = HttpServer{
	// 	favicon:						dtIni.Section("http").Key("favicon").MustString("favicon.ico"),
	// 	sessionAuthKey1:		getSessionKey("auth_key_1"),
	// 	sessionEncryptKey1: getSessionKey("encrypt_key_1"),
	// 	sessionAuthKey2:		getSessionKey("auth_key_2"),
	// 	sessionEncryptKey2: getSessionKey("encrypt_key_2"),
	// }

	if conf.IsChanged {
		conf.Save()
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGTERM)

	host := conf.Host + ":" + conf.Port
	log.Info.Printf("Server start at %s ... OK\n", host)
  var httpServer = &controller.HttpServer{Log: log, Conf: conf}
	if conf.Proto == "https" {
		go httpServer.StartHTTPS()
	} else {
		go httpServer.StartHTTP(host, httpServer.Handler)
	}

	//TestHttpClient()

	<-stop
	log.Write.Println()
	log.Info.Printf("Server stop ... ")
	_, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		log.Info.Println("OK")
		// db.Close()
		log.Close()
		cancel()
	}()
	if err := httpServer.Server.Shutdown(); err != nil {
		log.Error.Println("Error: %v\n", err)
	}
}

func stop() {
}

func restart() {
}

func main() {
	var isVer = flag.Bool("V", false, "display version")
	var isInit = flag.Bool("init", false, "initialization database")
	var isStart = flag.Bool("start", false, "start server")
	var isConf = flag.String("config", "", "config file")
	var isStop = flag.Bool("stop", false, "stop server")
	var isRestart = flag.Bool("restart", false, "restart server")
	var isBackup = flag.Bool("backup", false, "backup database")
	var isRestore = flag.Bool("restore", false, "restore database")
	flag.Parse()

	if *isVer {
		fmt.Println("v1.0.0")
		os.Exit(0)
	}

	if *isStop {
		stop()
	}

	if *isRestart {
		restart()
	}

	if *isBackup {
		backup()
	}

	if *isRestore {
		restore()
	}

	var (
		appDirPath, iniFilePath string
		err error
	)
	if appDirPath, err = filepath.Abs(filepath.Dir(os.Args[0])); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Println(">>>>>>", isConf)
	if len(flag.Args()) > 0 {
		iniFilePath = flag.Arg(0)
	} else {
		iniFilePath = filepath.Join(appDirPath, "config", "server.ini")
	}
	fmt.Println(iniFilePath)
	conf = &controller.ConfigType{}
	conf.Load(appDirPath, iniFilePath)
	log = &controller.LogType{LogFilePath: conf.LogFilePath}

	if *isInit {
		initial()
		os.Exit(0)
	}

	if *isStart {
		start()
	}
}
