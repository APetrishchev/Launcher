package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	"github.com/valyala/fasthttp"
	"gopkg.in/ini.v1"

	"AppHomeServer/1.0.0/agent"
)

//==============================================================================
var Config = struct {
	Application struct {
		Host string
		Port string
	}
	Filesystems struct {
		Partitions []string
	}
	Networks struct {
		Interfaces []string
	}
}{}

func getConfig(args []string) {
	var (
		appDirPath  string
		iniFilePath string
		err         error
	)
	if appDirPath, err = filepath.Abs(filepath.Dir(args[0])); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	if len(args) > 1 {
		iniFilePath = args[1]
	} else {
		iniFilePath = filepath.Join(appDirPath, "agent.ini")
	}
	if conf, err := ini.Load(iniFilePath); err == nil {
		Config.Application.Host = "127.0.0.1"
		Config.Application.Port = strconv.Itoa(conf.Section("application").Key("port").MustInt(5000))
		Config.Filesystems.Partitions = conf.Section("filesystems").Key("partitions").Strings(", ")
		Config.Networks.Interfaces = conf.Section("networks").Key("interfaces").Strings(", ")
	} else {
		panic(fmt.Sprintf("Fail to read file: %v\n", err))
	}
}

//==============================================================================
type Series struct {
	buffer [150]*agent.Metrics //map[int]*Metrics
	idx    uint16
}

var series = &Series{}

func (self *Series) addMetrics() (metrics *agent.Metrics) {
	metrics = &agent.Metrics{}
	metrics.GetHostname()
	metrics.GetUptime()
	metrics.GetCPU()
	metrics.GetMemory()
	metrics.GetFilesystems(Config.Filesystems.Partitions)
	metrics.GetNetworks(Config.Networks.Interfaces)
	self.buffer[self.idx] = metrics
	self.idx++
	if self.idx == uint16(len(self.buffer)) {
		self.idx = 0
	}
	return metrics
}

//==============================================================================
type HttpServer struct {
	server *fasthttp.Server
}

var httpServer = &HttpServer{}

func (self *HttpServer) StartHTTP() {
	self.server = &fasthttp.Server{
		Handler:      self.handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 5 * time.Second,
	}
	listener, err := net.Listen("tcp4", Config.Application.Host+":"+Config.Application.Port)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	if err = self.server.Serve(listener); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func logMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		startTime := time.Now()
		userAgent := string(ctx.Request.Header.Peek("User-Agent"))
		next(ctx)
		fmt.Printf(
			"%s %s %s %d %d %s\n",
			userAgent,
			ctx.Method(),
			ctx.Path(),
			ctx.Response.StatusCode(),
			ctx.Response.Header.ContentLength(),
			time.Since(startTime),
		)
	}
}

// func panicMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
//   return func(ctx *fasthttp.RequestCtx) {
//     defer func() {
//       if err := recover(); err != nil {
//         dt.LogError.Printf("%s\n", err)
//         dt.LogTrace()
//         ctx.Error(fasthttp.StatusMessage(fasthttp.StatusInternalServerError), fasthttp.StatusInternalServerError)
//       }
//     }()
//     next(ctx)
//   }
// }

func (self *HttpServer) handler(ctx *fasthttp.RequestCtx) {
	logMiddleware(func(ctx *fasthttp.RequestCtx) {
		var (
			jsonBytes []byte
			err       error
		)
		// path := string(ctx.Path())
		// if path == "/" {
		var metrics = series.addMetrics()
		if jsonBytes, err = json.MarshalIndent(&metrics, "", "  "); err == nil {
			ctx.Response.Header.Set("Content-Type", "text/javascript; charset=utf-8")
			ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
			ctx.Write(jsonBytes)
		} else {
			fmt.Println(err.Error())
		}
		// }
	})(ctx)
}

//==============================================================================
func main() {
	getConfig(os.Args)

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGTERM)
	fmt.Printf("Server start at %s ... OK\n", Config.Application.Host+":"+Config.Application.Port)
	go httpServer.StartHTTP()

	<-stop
	fmt.Println("\nServer stop ... ")
	_, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		fmt.Println("OK")
		cancel()
	}()
	if err := httpServer.server.Shutdown(); err != nil {
		fmt.Printf("Error: %v\n", err)
	}
}
