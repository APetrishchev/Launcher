package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	srv "server"
	"strings"
	"syscall"
	"time"

	"github.com/valyala/fasthttp"

	"crypto/tls"
	"net"

	"net/http"

	"github.com/valyala/fasthttp/fasthttpadaptor"
	"golang.org/x/crypto/acme/autocert"
	"golang.org/x/net/webdav"
	// "github.com/gorilla/securecookie"
	// "github.com/go-gem/sessions"
)

var (
	log        = srv.Log
	conf       = srv.Config
	staticPath = "/home/apetrishchev/Portable/Projects/apetrishchev.github.io/"
)

func getClientIp(ctx *fasthttp.RequestCtx) string {
	addr := string(ctx.Request.Header.Peek("X-Real-Ip"))
	if len(addr) == 0 {
		addr = string(ctx.Request.Header.Peek("X-Forwarded-For"))
	}
	if len(addr) == 0 {
		addr = ctx.RemoteAddr().String()
	}
	ip, _, _ := net.SplitHostPort(addr)
	return ip
}

//==============================================================================
type HttpServer struct {
	// sessionAuthKey1, sessionEncryptKey1, sessionAuthKey2, sessionEncryptKey2 []byte
	server *fasthttp.Server
}

var httpServer = &HttpServer{}

// func (self *HttpServer) getCookieStore() *sessions.CookieStore {
//	 return sessions.NewCookieStore(
//		 self.sessionAuthKey1,
//		 // self.sessionEncryptKey1,
//		 self.sessionAuthKey2,
//		 // self.sessionEncryptKey2,
//	 )
// }

func (self *HttpServer) StartHTTP(host string, handler fasthttp.RequestHandler) {
	if err := fasthttp.ListenAndServe(host, handler); err != nil {
		log.Error.Println(err)
		os.Exit(1)
	}
}

func (self *HttpServer) StartHTTPS() {
	var err error
	listener, err := net.Listen("tcp4", conf.Host+":"+conf.Port)
	if err != nil {
		log.Error.Println(err)
		os.Exit(1)
	}
	tlsConfig := tls.Config{
		PreferServerCipherSuites: true,
		CurvePreferences: []tls.CurveID{
			tls.CurveP256,
			tls.X25519,
		},
	}
	if len(conf.TlsCertFileName) > 0 {
		cert, err := tls.LoadX509KeyPair(filepath.Join(conf.CertDirPath, conf.TlsCertFileName),
			filepath.Join(conf.CertDirPath, conf.TlsKeyFileName))
		if err != nil {
			log.Error.Println("cannot load certificate")
			os.Exit(1)
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	} else {
		certMngr := &autocert.Manager{
			Cache:      autocert.DirCache(conf.CertDirPath),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(conf.Host, "www."+conf.Host),
		}
		tlsConfig.GetCertificate = certMngr.GetCertificate
		go func() {
			if err := http.ListenAndServe(conf.Host+":80", certMngr.HTTPHandler(nil)); err != nil {
				log.Error.Println(err)
				os.Exit(1)
			}
		}()
	}
	tlsListener := tls.NewListener(listener, &tlsConfig)
	self.server = &fasthttp.Server{
		Handler:      self.handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 5 * time.Second,
	}
	if err = self.server.Serve(tlsListener); err != nil {
		log.Error.Println(err)
		os.Exit(1)
	}
}

func logMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		startTime := time.Now()
		clientIp := getClientIp(ctx)
		ctx.SetUserValue("ClientIp", clientIp)
		userAgent := string(ctx.Request.Header.Peek("User-Agent"))
		ctx.SetUserValue("UserAgent", userAgent)
		next(ctx)
		log.Info.Printf(
			"%s %s %s %s %d %d %s\n",
			clientIp,
			userAgent,
			ctx.Method(),
			ctx.Path(),
			ctx.Response.StatusCode(),
			ctx.Response.Header.ContentLength(),
			time.Since(startTime),
		)
	}
}

func panicMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		defer func() {
			if err := recover(); err != nil {
				log.Error.Printf("%s\n", err)
				log.Trace()
				ctx.Error(fasthttp.StatusMessage(fasthttp.StatusInternalServerError), fasthttp.StatusInternalServerError)
			}
		}()
		next(ctx)
	}
}

func sessionMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return panicMiddleware(func(ctx *fasthttp.RequestCtx) {
		//		 var err error
		//		 cookieStore := httpServer.getCookieStore()
		//		 cookies, err := cookieStore.Get(ctx, "dt_session")
		//		 if err != nil {
		//			 panic(err)
		//		 }
		//		 dt.Init()
		//		 query := &dt.SessionQuery{
		//			 ById: cookies.Values["sid"],
		//			 ByClientIp: ctx.UserValue("ClientIp").(string),
		//			 ByUserAgent: ctx.UserValue("UserAgent").(string),
		//		 }
		//		 var ses *dt.Session
		//		 if ses, err = query.OpenSession(); err != nil {
		//			 ses = query.NewSession()
		//			 cookies.Values["sid"] = ses.Id
		//			 cookies.Options = &sessions.Options{
		//				 Domain: httpServer.host,
		//				 Path: "/",
		//				 MaxAge: 86400 * 7,
		//				 //SameSite: "Strict",
		//				 //Secure: true,
		//				 HttpOnly: false,
		//			 }
		//			 if err := cookies.Save(ctx); err != nil {
		//				 panic(err)
		//			 }
		//			 ctx.Redirect("/", fasthttp.StatusTemporaryRedirect)
		//		 }
		//		 ctx.SetUserValue("ProfileId", ses.ProfileId)
		next(ctx)
	})
}

var webdavHandler *webdav.Handler = &webdav.Handler{
	Prefix:     "/webdav",
	FileSystem: webdav.Dir(filepath.Join(staticPath, "data", "public")),
	LockSystem: webdav.NewMemLS(),
	Logger: func(r *http.Request, err error) {
		if err != nil {
			log.Info.Printf("WEBDAV [%s]: %s, ERROR: %s\n", r.Method, r.URL, err)
		}
	},
}

func (self *HttpServer) handler(ctx *fasthttp.RequestCtx) {
	logMiddleware(func(ctx *fasthttp.RequestCtx) {
		path := string(ctx.Path())
		// pathArray := strings.Split(string(ctx.Path()), "/")[1:]
		//		 //--------------------------------------------------------------------------
		//		 if pathArray[0] == "Desktop" {
		//			 sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
		//				 //----------------------------------------------------------------------
		//				 if strings.HasPrefix(path, "/Desktop/Close") {
		//					 dt.DesktopClose(ctx)
		//					 cookieStore := httpServer.getCookieStore()
		//					 cookies, err := cookieStore.Get(ctx, "dt_session")
		//					 if err != nil {
		//						 panic(err)
		//					 }
		//					 cookies.Options = &sessions.Options{
		//						 Domain: httpServer.host,
		//						 Path: "/",
		//						 MaxAge: -86400,
		//						 HttpOnly: true,
		//					 }
		//					 if err = cookies.Save(ctx); err != nil {
		//						 panic(err)
		//					 }
		//					 ctx.Redirect("/", fasthttp.StatusTemporaryRedirect)
		//				 //----------------------------------------------------------------------
		//				 } else if strings.HasPrefix(path, "/Desktop/ProfileData/Get") {
		//					 ctx.Write(dt.DesktopProfileDataGet(ctx))
		//				 //----------------------------------------------------------------------
		//				 } else if strings.HasPrefix(path, "/Desktop/ProfileData/Save") {
		//					 ctx.Write(dt.DesktopProfileDataSave(ctx))
		//				 //----------------------------------------------------------------------
		//				 } else if strings.HasPrefix(path, "/Desktop/Application/Get") {
		//					 ctx.Write(dt.DesktopApplicationGet(ctx))
		//				 }
		//			 })(ctx)
		if strings.HasPrefix(path, "/webdav") {
			sessionMiddleware(fasthttpadaptor.NewFastHTTPHandler(webdavHandler))(ctx)
		} else if path == "/" {
			sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, staticPath+"index.html")
			})(ctx)
		} else {
			fasthttp.ServeFileUncompressed(ctx, staticPath+path)
		}
	})(ctx)
}

//==============================================================================
func main() {
	var verFlag = flag.Bool("V", false, "display version of application")
	flag.Parse()
	if *verFlag {
		fmt.Println("v1.0")
		os.Exit(0)
	}

	conf.Load(os.Args)
	log.Open(conf.LogFilePath)
	log.Write.Println()
	log.Header.Println("Press Ctrl+C for stop server")

	// //----------------------------------------------------------------------------
	// dtDb := dt.DB{
	//	 Host: dtIni.Section("db").Key("host").MustString("127.0.0.1"),
	//	 Port: dtIni.Section("db").Key("port").MustInt(5432),
	//	 User: dtIni.Section("db").Key("user").String(),
	//	 Passwd: dtIni.Section("db").Key("passwd").String(),
	//	 Name: dtIni.Section("db").Key("name").String(),
	// }
	// dtDb.Open()

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
	// 	proto:			proto,
	// 	host:			 host,
	// 	homePath:	 homePath,
	// 	appDirPath: appDirPath,
	// 	tlsDirPath: dtIni.Section("http_server").Key("tls_dir_path").MustString(appDirPath + "/" + ".tls"),
	// 	// tlsDirPath: dtIni.Section("http_server").Key("tls_dir_path").MustString("/etc/dehydrated/certs/cabinet.duckdns.org"),
	// 	staticPath:				 dtIni.Section("http_server").Key("static_path").MustString(appDirPath + "/" + "html"),
	// 	favicon:						dtIni.Section("http_server").Key("favicon").MustString("favicon.ico"),
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

	// var (
	// 	handler fasthttp.RequestHandler
	// )

	host := conf.Host + ":" + conf.Port
	log.Info.Printf("Server start at %s ... OK\n", host)
	if conf.Proto == "https" {
		go httpServer.StartHTTPS()
	} else {
		go httpServer.StartHTTP(host, httpServer.handler)
	}

	//TestHttpClient()

	<-stop
	log.Write.Println()
	log.Info.Printf("Server stop ... ")
	_, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer func() {
		log.Info.Println("OK")

		// 	dtDb.Close()

		log.Close()
		cancel()
	}()
	if err := httpServer.server.Shutdown(); err != nil {
		log.Error.Println("Error: %v\n", err)
	}
}
