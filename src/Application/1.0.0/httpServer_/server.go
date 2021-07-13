package httpServer_

import (
	"crypto/tls"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/valyala/fasthttp"
	"github.com/valyala/fasthttp/fasthttpadaptor"
	"golang.org/x/crypto/acme/autocert"
	"golang.org/x/net/webdav"

	// "github.com/gorilla/securecookie"
	// "github.com/go-gem/sessions"

	"Application/1.0.0/config"
	"Application/1.0.0/log_"
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
	Server *fasthttp.Server
	Log *log_.LogType
	Conf *config.ConfigType
}

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
		self.Log.Error.Println(err)
		os.Exit(1)
	}
}

func (self *HttpServer) StartHTTPS() {
	var err error
	listener, err := net.Listen("tcp4", self.Conf.Host+":"+self.Conf.Port)
	if err != nil {
		self.Log.Error.Println(err)
		os.Exit(1)
	}
	tlsConfig := tls.Config{
		PreferServerCipherSuites: true,
		CurvePreferences: []tls.CurveID{
			tls.CurveP256,
			tls.X25519,
		},
	}
	if len(self.Conf.CertFileName) > 0 {
		cert, err := tls.LoadX509KeyPair(filepath.Join(self.Conf.CertDirPath, self.Conf.CertFileName),
			filepath.Join(self.Conf.CertDirPath, self.Conf.CertKeyFileName))
		if err != nil {
			self.Log.Error.Println("cannot load certificate")
			os.Exit(1)
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	} else {
		certMngr := &autocert.Manager{
			Cache:      autocert.DirCache(self.Conf.CertDirPath),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(self.Conf.Host, "www."+self.Conf.Host),
		}
		tlsConfig.GetCertificate = certMngr.GetCertificate
		go func() {
			if err := http.ListenAndServe(self.Conf.Host+":80", certMngr.HTTPHandler(nil)); err != nil {
				self.Log.Error.Println(err)
				os.Exit(1)
			}
		}()
	}
	tlsListener := tls.NewListener(listener, &tlsConfig)
	self.Server = &fasthttp.Server{
		Handler:      self.Handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 5 * time.Second,
	}
	if err = self.Server.Serve(tlsListener); err != nil {
		self.Log.Error.Println(err)
		os.Exit(1)
	}
}

func (self *HttpServer) logMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		startTime := time.Now()
		clientIp := getClientIp(ctx)
		ctx.SetUserValue("ClientIp", clientIp)
		userAgent := string(ctx.Request.Header.Peek("User-Agent"))
		ctx.SetUserValue("UserAgent", userAgent)
		next(ctx)
		self.Log.Info.Printf(
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

func (self *HttpServer) panicMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		defer func() {
			if err := recover(); err != nil {
				self.Log.Error.Printf("%s\n", err)
				self.Log.Trace()
				ctx.Error(fasthttp.StatusMessage(fasthttp.StatusInternalServerError), fasthttp.StatusInternalServerError)
			}
		}()
		next(ctx)
	}
}

func (self *HttpServer) sessionMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return self.panicMiddleware(func(ctx *fasthttp.RequestCtx) {
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

func (self *HttpServer) webdavHandler() *webdav.Handler {
	return &webdav.Handler{
		Prefix:     "/webdav",
		FileSystem: webdav.Dir(filepath.Join(self.Conf.DataDirPath, "public")),
		LockSystem: webdav.NewMemLS(),
		Logger: func(r *http.Request, err error) {
			if err != nil {
				self.Log.Info.Printf("WEBDAV [%s]: %s, ERROR: %s\n", r.Method, r.URL, err)
			}
		},
	}
}

func (self *HttpServer) Handler(ctx *fasthttp.RequestCtx) {
	self.logMiddleware(func(ctx *fasthttp.RequestCtx) {
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
			self.sessionMiddleware(fasthttpadaptor.NewFastHTTPHandler(self.webdavHandler()))(ctx)
		} else if path == "/" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(self.Conf.RootDirPath, "index.html"))
			})(ctx)
		} else {
			fasthttp.ServeFileUncompressed(ctx, filepath.Join(self.Conf.RootDirPath, path))
		}
	})(ctx)
}
