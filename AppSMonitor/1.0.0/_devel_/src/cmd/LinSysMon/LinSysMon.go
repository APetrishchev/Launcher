package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"os"
	"os/exec"
	"os/signal"

	// "path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"metrics"

	"github.com/valyala/fasthttp"
	"gopkg.in/ini.v1"
)

// //==============================================================================
// type Metrics struct {
// 	Hostname string  `json:"hostname"`
// 	Uptime   float64 `json:"uptime"`
// 	CPU      struct {
// 		CPU  float64    `json:"cpu"`
// 		CPUs []float64  `json:"cpus"`
// 		Top  [5]Process `json:"top"`
// 	} `json:"cpu"`
// 	Memory struct {
// 		Total uint64     `json:"total"`
// 		Avail uint64     `json:"avail"`
// 		Top   [5]Process `json:"top"`
// 	} `json:"memory"`
// 	Swap struct {
// 		Total uint64 `json:"total"`
// 		Free  uint64 `json:"free"`
// 	} `json:"swap"`
// 	Filesystems []Partition `json:"filesystems"`
// 	Networks    []Interface `json:"networks"`
// }

// type Process struct {
// 	Pid  string `json:"pid"`
// 	Cmd  string `json:"cmd"`
// 	Perc string `json:"perc"`
// }

// type Partition struct {
// 	Name  string `json:"name"`
// 	Total uint64 `json:"total"`
// 	Used  uint64 `json:"used"`
// 	Avail uint64 `json:"avail"`
// }

// type Interface struct {
// 	Name  string  `json:"name"`
// 	IP    string  `json:"ip"`
// 	ExtIP string  `json:"extIP"`
// 	Up    float64 `json:"up"`
// 	Down  float64 `json:"down"`
// }

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getHostname() {
	var err error
	if self.Hostname, err = os.Hostname(); err != nil {
		fmt.Println("Error: ", err)
	}
}

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getUptime() {
	var err error
	if contents, err := ioutil.ReadFile("/proc/uptime"); err == nil {
		if self.Uptime, err = strconv.ParseFloat(strings.Split(string(contents), " ")[0], 64); err == nil {
			return
		}
	}
	fmt.Println("Error: ", err)
	return
}

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getTopProcess(top *[5]metrics.Process, by string) {
	// ps -eo pid,cmd,%%cpu --sort=-%%cpu | head
	fmt.Println(">>> getProcess", by)
	if out, err := exec.Command("ps", "-e", "--format=pid,cmd,%"+by, "--no-headers", "--sort=-%"+by).Output(); err == nil {
		for idx, line := range strings.Split(string(out), "\n") {
			if len(line) == 0 {
				continue
			}
			process := &metrics.Process{}
			process.Pid = strings.Trim(line[:7], " ")
			cmd := strings.Split(strings.Fields(line[8:36])[0], "/")
			process.Cmd = strings.Trim(cmd[len(cmd)-1], " ")
			process.Perc = strings.Trim(line[36:], " ")
			if idx < 5 {
				top[idx] = *process
				if by == "cpu" {
					fmt.Println(idx, "  ", *process)
				} else {
					fmt.Println(idx, "  ", *process)
				}
			}
		}
	} else {
		fmt.Println(err)
	}
}

// //------------------------------------------------------------------------------
// type CPUTicks struct {
// 	idleTicks, totalTicks uint64
// }

// var cpusTicks = struct {
// 	CPUTicks
// 	CPUs []CPUTicks
// }{}

// func (self *Metrics) cpuParse(fields *[]string, cpuTicks *CPUTicks, cpuUsage *float64) {
// 	var idleTicks, totalTicks uint64
// 	for i := 1; i < len(*fields); i++ {
// 		val, err := strconv.ParseUint((*fields)[i], 10, 64)
// 		if err != nil {
// 			fmt.Println("Error: ", i, (*fields)[i], err)
// 		}
// 		totalTicks += val
// 		if i == 4 {
// 			idleTicks = val
// 		}
// 	}
// 	deltaIdle := float64(idleTicks - cpuTicks.idleTicks)
// 	deltaTotal := float64(totalTicks - cpuTicks.totalTicks)
// 	cpuTicks.idleTicks = idleTicks
// 	cpuTicks.totalTicks = totalTicks
// 	*cpuUsage = 100 * (deltaTotal - deltaIdle) / deltaTotal
// 	return
// }

// func (self *Metrics) getCPU() {
// 	contents, err := ioutil.ReadFile("/proc/stat")
// 	if err != nil {
// 		return
// 	}
// 	var idx int8 = 0
// 	for _, line := range strings.Split(string(contents), "\n") {
// 		if len(line) == 0 {
// 			continue
// 		}
// 		fields := strings.Fields(line)
// 		if fields[0] == "cpu" {
// 			self.cpuParse(&fields, &cpusTicks.CPUTicks, &self.CPU.CPU)
// 		} else if strings.HasPrefix(fields[0], "cpu") {
// 			if int8(len(cpusTicks.CPUs)) < idx+1 {
// 				cpusTicks.CPUs = append(cpusTicks.CPUs, CPUTicks{})
// 			}
// 			if int8(len(self.CPU.CPUs)) < idx+1 {
// 				self.CPU.CPUs = append(self.CPU.CPUs, 0)
// 			}
// 			self.cpuParse(&fields, &cpusTicks.CPUs[idx], &self.CPU.CPUs[idx])
// 			idx++
// 		}
// 	}
// 	self.getTopProcess(&self.CPU.Top, "cpu")
// 	return
// }

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getMemory() {
	if contents, err := ioutil.ReadFile("/proc/meminfo"); err == nil {
		for _, line := range strings.Split(string(contents), "\n") {
			fields := strings.Fields(line)
			if len(line) == 0 {
				continue
			}
			if fields[0] == "MemTotal:" {
				if self.Memory.Total, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Memory.Total = self.Memory.Total * 1024
			} else if fields[0] == "MemAvailable:" {
				if self.Memory.Avail, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Memory.Avail = self.Memory.Avail * 1024
			} else if fields[0] == "SwapTotal:" {
				if self.Swap.Total, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Swap.Total = self.Swap.Total * 1024
			} else if fields[0] == "SwapFree:" {
				if self.Swap.Free, err = strconv.ParseUint((fields)[1], 10, 64); err != nil {
					fmt.Println("Error: ", err)
				}
				self.Swap.Free = self.Swap.Free * 1024
			}
		}
	}
	self.getTopProcess(&self.Memory.Top, "mem")
	return
}

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getFilesystems() {
	for _, fsName := range config.filesystems.partitions {
		self.Filesystems = append(self.Filesystems, Partition{Name: fsName})
	}
	if out, err := exec.Command("df", "--block-size=1K", "--output=target,size,used,avail").Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			fields := strings.Fields(line)
			if len(line) == 0 {
				continue
			}
			for idx, fs := range self.Filesystems {
				if fields[0] == fs.Name {
					if self.Filesystems[idx].Total, err = strconv.ParseUint(fields[1], 10, 64); err != nil {
						fmt.Println(err)
					}
					self.Filesystems[idx].Total = self.Filesystems[idx].Total * 1024
					if self.Filesystems[idx].Used, err = strconv.ParseUint(fields[2], 10, 64); err != nil {
						fmt.Println(err)
					}
					self.Filesystems[idx].Used = self.Filesystems[idx].Used * 1024
					if self.Filesystems[idx].Avail, err = strconv.ParseUint(fields[3], 10, 64); err != nil {
						fmt.Println(err)
					}
					self.Filesystems[idx].Avail = self.Filesystems[idx].Avail * 1024
				}
			}
		}
	} else {
		fmt.Println(err)
	}
}

//------------------------------------------------------------------------------
func (self *metrics.Metrics) getNetworks() {
	// echo $(wget -qO - https://api.ipify.org)
	// echo $(curl -s https://api.ipify.org)
	// ip a s | grep -w inet | awk '{ print $2}'
	for _, ifName := range config.networks.interfaces {
		self.Networks = append(self.Networks, Interface{Name: ifName})
	}
	for _, intf := range self.Networks {
		fmt.Println(intf.Name)
	}
}

//==============================================================================
type Series struct {
	buffer [150]*metrics.Metrics //map[int]*Metrics
	idx    uint16
}

var series = &Series{}

func (self *Series) addMetrics() (metrics *metrics.Metrics) {
	metrics = &metrics.Metrics{}
	metrics.getUptime()
	metrics.getCPU()
	metrics.getMemory()
	metrics.getHostname()
	metrics.getFilesystems()
	metrics.getNetworks()
	self.buffer[self.idx] = metrics
	self.idx++
	if self.idx == uint16(len(self.buffer)) {
		self.idx = 0
	}
	return metrics
}

//==============================================================================
type HttpServer struct {
	host   string
	server *fasthttp.Server
}

var httpServer HttpServer

func (self *HttpServer) StartHTTP() {
	server := &fasthttp.Server{
		Handler:      self.handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 5 * time.Second,
	}
	listener, err := net.Listen("tcp4", self.host)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	err = server.Serve(listener)
	if err != nil {
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

// //------------------------------------------------------------------------------
// func sessionMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
//   return panicMiddleware(func(ctx *fasthttp.RequestCtx) {
//     var err error
//     cookieStore := httpServer.getCookieStore()
//     cookies, err := cookieStore.Get(ctx, "dt_session")
//     if err != nil {
//       panic(err)
//     }
//     dt.Init()
//     query := &dt.SessionQuery{
//       ById: cookies.Values["sid"],
//       ByClientIp: ctx.UserValue("ClientIp").(string),
//       ByUserAgent: ctx.UserValue("UserAgent").(string),
//     }
//     var ses *dt.Session
//     if ses, err = query.OpenSession(); err != nil {
//       ses = query.NewSession()
//       cookies.Values["sid"] = ses.Id
//       cookies.Options = &sessions.Options{
//         Domain: httpServer.host,
//         Path: "/",
//         MaxAge: 86400 * 7,
//         //SameSite: "Strict",
//         //Secure: true,
//         HttpOnly: false,
//       }
//       if err := cookies.Save(ctx); err != nil {
//         panic(err)
//       }
//       ctx.Redirect("/", fasthttp.StatusTemporaryRedirect)
//     }
//     ctx.SetUserValue("ProfileId", ses.ProfileId)
//     next(ctx)
//   })
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

var config = struct {
	application struct {
		port string
	}
	filesystems struct {
		partitions []string
	}
	networks struct {
		interfaces []string
	}
}{}

func getConfig(args []string) {
	var (
		// appDirPath  string
		iniFilePath string
		// err         error
	)
	// if appDirPath, err = filepath.Abs(filepath.Dir(args[0])); err != nil {
	// 	fmt.Println(err)
	// 	os.Exit(1)
	// }
	if len(args) > 1 {
		iniFilePath = args[1]
	} else {
		// iniFilePath = filepath.join(appDirPath, "LinSySMon.ini")
		iniFilePath = "/home/apetrishchev/Portable/Projects/apetrishchev.github.io/AppSMonitor/1.0.0/back/LinSysMon.ini"
	}
	if conf, err := ini.Load(iniFilePath); err == nil {
		config.application.port = strconv.Itoa(conf.Section("application").Key("port").MustInt(5000))
		config.filesystems.partitions = conf.Section("filesystems").Key("partitions").Strings(", ")
		config.networks.interfaces = conf.Section("networks").Key("interfaces").Strings(", ")
	} else {
		panic(fmt.Sprintf("Fail to read file: %v\n", err))
	}
}

//==============================================================================
func main() {
	getConfig(os.Args)

	httpServer = HttpServer{
		host: "127.0.0.1:" + config.application.port,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGTERM)
	fmt.Printf("Server start at %s ... OK\n", httpServer.host)
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
