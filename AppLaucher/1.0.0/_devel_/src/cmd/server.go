package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/securecookie"
	"github.com/valyala/fasthttp"
	"gopkg.in/ini.v1"
	// "gopkg.in/ini.v1"
	// "crypto/tls"
	// "net"
	// "github.com/valyala/fasthttp/fasthttpadaptor"
	// "net/http"
	// "golang.org/x/net/webdav"
	// // "golang.org/x/crypto/acme/autocert"
	// "github.com/gorilla/securecookie"
	// "github.com/go-gem/sessions"
	// dt "desktop"
)

// var homePath string = "/home/webdesktop/Desktop"

// //------------------------------------------------------------------------------
// func getClientIp(ctx *fasthttp.RequestCtx) string {
//   addr := string(ctx.Request.Header.Peek("X-Real-Ip"))
//   if len(addr) == 0 {
//     addr = string(ctx.Request.Header.Peek("X-Forwarded-For"))
//   }
//   if len(addr) == 0 {
//     addr = ctx.RemoteAddr().String()
//   }
//   ip, _, _ := net.SplitHostPort(addr)
//   return ip
// }

//==============================================================================
type HttpServer struct {
	proto, host, homePath, appDirPath, tlsDirPath, staticPath, favicon       string
	sessionAuthKey1, sessionEncryptKey1, sessionAuthKey2, sessionEncryptKey2 []byte
	server                                                                   *fasthttp.Server
}

var httpServer HttpServer

// //------------------------------------------------------------------------------
// var webdavHandler *webdav.Handler = &webdav.Handler{
//   Prefix: "/webdav",
//   FileSystem: webdav.Dir(homePath + "/data/Common"),
//   LockSystem: webdav.NewMemLS(),
//   Logger: func(r *http.Request, err error) {
//     if err != nil {
//       dt.LogInfo.Printf("WEBDAV [%s]: %s, ERROR: %s\n", r.Method, r.URL, err)
//     }
//   },
// }

// //------------------------------------------------------------------------------
// func (self *HttpServer) getCookieStore() *sessions.CookieStore {
//   return sessions.NewCookieStore(
//     self.sessionAuthKey1,
//     // self.sessionEncryptKey1,
//     self.sessionAuthKey2,
//     // self.sessionEncryptKey2,
//   )
// }

// //------------------------------------------------------------------------------
// func (self *HttpServer) StartHTTP(host string, handler fasthttp.RequestHandler) {
//   server := &fasthttp.Server{
//     Handler: handler,
//     ReadTimeout: 10 * time.Second,
//     WriteTimeout: 5 * time.Second,
//   }
//   listener, err := net.Listen("tcp4", host)
//   if err != nil {
//     dt.LogError.Println(err)
//     os.Exit(1)
//   }
//   err = server.Serve(listener)
//   if err != nil {
//     dt.LogError.Println(err)
//     os.Exit(1)
//   }
// }

// //------------------------------------------------------------------------------
// func (self *HttpServer) StartHTTPS() {
//   var err error
//   self.server = &fasthttp.Server{
//     Handler: self.handler,
//     ReadTimeout: 10 * time.Second,
//     WriteTimeout: 5 * time.Second,
//   }
//   listener, err := net.Listen("tcp4", httpServer.host)
//   if err != nil {
//     dt.LogError.Println(err)
//     os.Exit(1)
//   }

// // +++++++++
//   cert, err := tls.LoadX509KeyPair("/home/webdesktop/Desktop/Desktop/v1.0/.tls/cert.pem", "/home/webdesktop/Desktop/Desktop/v1.0/.tls/privkey.pem")
//   // cert, err := tls.LoadX509KeyPair("/etc/dehydrated/certs/cabinet.duckdns.org/cert.pem;", "/etc/dehydrated/certs/cabinet.duckdns.org/privkey.pem")
//   if err != nil {
//     dt.LogError.Println("cannot load cert")
//   }
// // +++++++++

//   tlsConfig := tls.Config{
//     PreferServerCipherSuites: true,
//     CurvePreferences: []tls.CurveID{
//       tls.CurveP256,
//       tls.X25519,
//     },
//     Certificates: []tls.Certificate{cert}, // +++++++++
//   }
//   // crtMgr := &autocert.Manager{
//   //   Cache: autocert.DirCache(self.tlsDirPath),
//   //   Prompt: autocert.AcceptTOS,
//   //   //HostPolicy: autocert.HostWhitelist(self.host, "www." + self.host),
//   //   HostPolicy: autocert.HostWhitelist("cabinet.duckdns.org", "www.cabinet.duckdns.org"),
//   // }
//   // tlsConfig.GetCertificate = crtMgr.GetCertificate

//   tlsListener := tls.NewListener(listener, &tlsConfig)
//   err = self.server.Serve(tlsListener)
//   if err != nil {
//     dt.LogError.Println(err)
//     os.Exit(1)
//   }
// }

// //------------------------------------------------------------------------------
// func logMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
//   return func(ctx *fasthttp.RequestCtx) {
//     startTime := time.Now()
//     clientIp := getClientIp(ctx)
//     ctx.SetUserValue("ClientIp", clientIp)
//     userAgent := string(ctx.Request.Header.Peek("User-Agent"))
//     ctx.SetUserValue("UserAgent", userAgent)
//     next(ctx)
//     dt.LogInfo.Printf(
//       "%s %s %s %s %d %d %s\n",
//       clientIp,
//       userAgent,
//       ctx.Method(),
//       ctx.Path(),
//       ctx.Response.StatusCode(),
//       ctx.Response.Header.ContentLength(),
//       time.Since(startTime),
//     )
//   }
// }

// //------------------------------------------------------------------------------
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

// //------------------------------------------------------------------------------
// func (self *HttpServer) handler(ctx *fasthttp.RequestCtx) {
//   logMiddleware(func(ctx *fasthttp.RequestCtx) {
//     path := string(ctx.Path())
//     pathArray := strings.Split(string(ctx.Path()), "/")[1:]
//     //--------------------------------------------------------------------------
//     if path == "/" {
//       sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
//         fasthttp.ServeFileUncompressed(ctx, self.staticPath + "/start.html")
//       })(ctx)
//     //--------------------------------------------------------------------------
//     } else if len(pathArray) > 1 && pathArray[1] == "Load" {
//       sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
//         ctx.Write(dt.AppLoad(ctx, self.homePath, pathArray[0]))
//       })(ctx)
//     } else if pathArray[0] == "Desktop" {
//       sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
//         //----------------------------------------------------------------------
//         if strings.HasPrefix(path, "/Desktop/Close") {
//           dt.DesktopClose(ctx)
//           cookieStore := httpServer.getCookieStore()
//           cookies, err := cookieStore.Get(ctx, "dt_session")
//           if err != nil {
//             panic(err)
//           }
//           cookies.Options = &sessions.Options{
//             Domain: httpServer.host,
//             Path: "/",
//             MaxAge: -86400,
//             HttpOnly: true,
//           }
//           if err = cookies.Save(ctx); err != nil {
//             panic(err)
//           }
//           ctx.Redirect("/", fasthttp.StatusTemporaryRedirect)
//         //----------------------------------------------------------------------
//         } else if strings.HasPrefix(path, "/Desktop/ProfileData/Get") {
//           ctx.Write(dt.DesktopProfileDataGet(ctx))
//         //----------------------------------------------------------------------
//         } else if strings.HasPrefix(path, "/Desktop/ProfileData/Save") {
//           ctx.Write(dt.DesktopProfileDataSave(ctx))
//         //----------------------------------------------------------------------
//         } else if strings.HasPrefix(path, "/Desktop/Application/Get") {
//           ctx.Write(dt.DesktopApplicationGet(ctx))
//         }
//       })(ctx)
//     } else if pathArray[0] == "webdav" {
//       sessionMiddleware(fasthttpadaptor.NewFastHTTPHandler(webdavHandler))(ctx)
//     } else {
//       //------------------------------------------------------------------------
//       fasthttp.ServeFileUncompressed(ctx, self.staticPath + path)
//     }
//   })(ctx)
// }

// //------------------------------------------------------------------------------
// func (self *HttpServer) redirectHandler(ctx *fasthttp.RequestCtx) {
//   logMiddleware(func(ctx *fasthttp.RequestCtx) {
//     path := string(ctx.Path())
//     if strings.HasPrefix(path, "/.well-known/acme-challenge") {
//       fasthttp.ServeFileUncompressed(ctx, "/home/webdesktop/Desktop/Desktop/v1.0/html" + path)
//     } else {
//       ctx.URI().Update(fmt.Sprintf("https://%s", httpServer.host))
//       ctx.Redirect("/", fasthttp.StatusTemporaryRedirect)
//     }
//   })(ctx)
// }

//==============================================================================
func main() {
	var verFlag = flag.Bool("V", false, "display version of application")
	flag.Parse()
	if *verFlag {
		fmt.Println("v1.0")
		os.Exit(0)
	}

	appDirPath, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	var iniFilePath string
	if len(os.Args) > 1 {
		iniFilePath = os.Args[1]
	} else {
		iniFilePath = appDirPath + "/" + "desktop.ini"
	}

	dtIni, err := ini.Load(iniFilePath)
	if err != nil {
		panic(fmt.Sprintf("Fail to read file: %v\n", err))
	}

	logFilePath := dtIni.Section("http_server").Key("log_file_path").String()
	if logFilePath != "" && !strings.HasPrefix(logFilePath, "/") {
		logFilePath = appDirPath + "/" + logFilePath
	}
	dt.LogOpen(logFilePath)

	dt.Log.Println()
	dt.LogHeader.Println("Press Ctrl+C for stop server")

	// //----------------------------------------------------------------------------
	// dtDb := dt.DB{
	//   Host: dtIni.Section("db").Key("host").MustString("127.0.0.1"),
	//   Port: dtIni.Section("db").Key("port").MustInt(5432),
	//   User: dtIni.Section("db").Key("user").String(),
	//   Passwd: dtIni.Section("db").Key("passwd").String(),
	//   Name: dtIni.Section("db").Key("name").String(),
	// }
	// dtDb.Open()

	//----------------------------------------------------------------------------
	var iniChanged bool = false

	getSessionKey := func(key string) []byte {
		var buf []byte
		str := dtIni.Section("session").Key(key).String()
		if str != "" {
			for _, item := range strings.Fields(str) {
				val, _ := strconv.ParseUint(item, 10, 8)
				buf = append(buf, byte(val))
			}
		} else {
			buf = securecookie.GenerateRandomKey(32)
			str := fmt.Sprintf("%v", buf)
			dtIni.Section("session").Key(key).SetValue(str[1 : len(str)-1])
			iniChanged = true
		}
		return buf
	}

	var host string
	url := strings.Split(dtIni.Section("http_server").Key("url").MustString("http://127.0.0.1"), "://")
	proto := url[0]
	url = strings.Split(url[1], ":")
	if len(url) == 1 {
		if proto == "https" {
			host = url[0] + ":443"
		} else if proto == "http" {
			host = url[0] + ":80"
		}
	} else {
		host = url[0] + ":" + url[1]
	}
	httpServer = HttpServer{
		proto:      proto,
		host:       host,
		homePath:   homePath,
		appDirPath: appDirPath,
		tlsDirPath: dtIni.Section("http_server").Key("tls_dir_path").MustString(appDirPath + "/" + ".tls"),
		// tlsDirPath: dtIni.Section("http_server").Key("tls_dir_path").MustString("/etc/dehydrated/certs/cabinet.duckdns.org"),
		staticPath:         dtIni.Section("http_server").Key("static_path").MustString(appDirPath + "/" + "html"),
		favicon:            dtIni.Section("http_server").Key("favicon").MustString("favicon.ico"),
		sessionAuthKey1:    getSessionKey("auth_key_1"),
		sessionEncryptKey1: getSessionKey("encrypt_key_1"),
		sessionAuthKey2:    getSessionKey("auth_key_2"),
		sessionEncryptKey2: getSessionKey("encrypt_key_2"),
	}
	if iniChanged {
		dtIni.SaveTo(iniFilePath)
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGTERM)
	var handler fasthttp.RequestHandler

	if httpServer.proto == "https" {
		dt.LogInfo.Printf("Server start at %s ... OK\n", httpServer.host)
		go httpServer.StartHTTPS()
		host = strings.Split(httpServer.host, ":")[0] + ":80"
		handler = httpServer.redirectHandler
	} else {
		host = httpServer.host
		handler = httpServer.handler
	}
	dt.LogInfo.Printf("Server start at %s ... OK\n", host)
	go httpServer.StartHTTP(host, handler)

	//TestHttpClient()

	<-stop
	dt.Log.Println()
	dt.LogInfo.Printf("Server stop ... ")
	_, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		dt.LogInfo.Println("OK")

		dtDb.Close()

		dt.LogClose()
		cancel()
	}()
	if err := httpServer.server.Shutdown(); err != nil {
		dt.LogError.Println("Error: %v\n", err)
	}
}
