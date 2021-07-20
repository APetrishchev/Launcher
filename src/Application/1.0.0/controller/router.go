package controller

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/valyala/fasthttp"
	"github.com/valyala/fasthttp/fasthttpadaptor"
	"golang.org/x/net/webdav"
)

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
		} else if strings.HasPrefix(path, "/admin") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(self.Conf.DataDirPath, path))
			})(ctx)
		} else if strings.HasPrefix(path, "/public") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(self.Conf.DataDirPath, path))
			})(ctx)
		} else if path == "/AppLaucher/1.0.0/ini.js" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				//
			})(ctx)
		} else if path == "/" || path == "/index.html" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(self.Conf.RootDirPath, "index.html"))
			})(ctx)
		} else {
			fasthttp.ServeFileUncompressed(ctx, filepath.Join(self.Conf.RootDirPath, path))
		}
	})(ctx)
}
