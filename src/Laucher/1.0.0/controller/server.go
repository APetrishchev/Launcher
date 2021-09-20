package controller

import (
	"crypto/tls"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"Laucher/1.0.0/model"

	"github.com/go-gem/sessions"
	"github.com/valyala/fasthttp"
	"golang.org/x/crypto/acme/autocert"
)

//==============================================================================
type HttpServerType struct {
	Server *fasthttp.Server
	CookieStore *sessions.CookieStore
}

func (self *HttpServerType) getClientIp(ctx *fasthttp.RequestCtx) string {
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

func (self *HttpServerType) StartHTTP(host string, handler fasthttp.RequestHandler) {
	if err := fasthttp.ListenAndServe(host, handler); err != nil {
		Log.Error.Println(err)
		os.Exit(1)
	}
}

func (self *HttpServerType) StartHTTPS() {
	var err error
	listener, err := net.Listen("tcp4", Config.Host+":"+Config.Port)
	if err != nil {
		Log.Error.Println(err)
		os.Exit(1)
	}
	tlsConfig := tls.Config{
		PreferServerCipherSuites: true,
		CurvePreferences: []tls.CurveID{
			tls.CurveP256,
			tls.X25519,
		},
	}
	if len(Config.CertFileName) > 0 {
		cert, err := tls.LoadX509KeyPair(filepath.Join(Config.CertDirPath, Config.CertFileName),
			filepath.Join(Config.CertDirPath, Config.CertKeyFileName))
		if err != nil {
			Log.Error.Println("cannot load certificate")
			os.Exit(1)
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	} else {
		certMngr := &autocert.Manager{
			Cache:      autocert.DirCache(Config.CertDirPath),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(Config.Host, "www."+Config.Host),
		}
		tlsConfig.GetCertificate = certMngr.GetCertificate
		go func() {
			if err := http.ListenAndServe(Config.Host+":80", certMngr.HTTPHandler(nil)); err != nil {
				Log.Error.Println(err)
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
		Log.Error.Println(err)
		os.Exit(1)
	}
}

func (self *HttpServerType) logMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		startTime := time.Now()
		clientIp := self.getClientIp(ctx)
		ctx.SetUserValue("ClientIp", clientIp)
		userAgent := string(ctx.Request.Header.Peek("User-Agent"))
		ctx.SetUserValue("ClientAgent", userAgent)
		next(ctx)
		Log.Info.Printf(
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

func (self *HttpServerType) panicMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		defer func() {
			if err := recover(); err != nil {
				Log.Error.Printf("%s\n", err)
				Log.Trace()
				ctx.Error(fasthttp.StatusMessage(fasthttp.StatusInternalServerError), fasthttp.StatusInternalServerError)
			}
		}()
		next(ctx)
	}
}

func (self *HttpServerType) sessionMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return self.panicMiddleware(func(ctx *fasthttp.RequestCtx) {
		cookies, err := self.CookieStore.Get(ctx, "laucher_session")
		if err != nil {panic(err)}
		sid := cookies.Values["sid"]
		model.Db.Open()
		defer model.Db.Close()
		ses := &SessionType{ClientIp: ctx.UserValue("ClientIp").(string),
			ClientAgent: ctx.UserValue("ClientAgent").(string)}
		if !ses.Open(sid) {
			ses.UserId = 1 // user Ananimous
			ses.ProfileId = 1 // profile Ananimous
			ses.Add()
			cookies.Values["sid"] = ses.Id
			cookies.Options = &sessions.Options{
				Domain: Config.Host,
				Path: "/",
				MaxAge: 86400 * 3,
				//SameSite: "Strict",
				//Secure: true,
				HttpOnly: false,
			}
			if err := cookies.Save(ctx); err != nil {panic(err)}
			ctx.Redirect("/", fasthttp.StatusTemporaryRedirect)
			return
		}
		ctx.SetUserValue("UserId", ses.UserId)
		ctx.SetUserValue("ProfileId", ses.ProfileId)
		next(ctx)
	})
}
