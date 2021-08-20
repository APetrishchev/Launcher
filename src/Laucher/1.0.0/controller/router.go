package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/valyala/fasthttp"
	"github.com/valyala/fasthttp/fasthttpadaptor"
	"golang.org/x/net/webdav"
)

func (self *HttpServerType) webdavHandler() *webdav.Handler {
	return &webdav.Handler{
		Prefix:     "/webdav",
		FileSystem: webdav.Dir(filepath.Join(Config.DataDirPath, "public")),
		LockSystem: webdav.NewMemLS(),
		Logger: func(r *http.Request, err error) {
			if err != nil {
				Log.Info.Printf("WEBDAV [%s]: %s, ERROR: %s\n", r.Method, r.URL, err)
			}
		},
	}
}

func (self *HttpServerType) Handler(ctx *fasthttp.RequestCtx) {
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
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath, path))
			})(ctx)
		} else if path == "/AppLaucher/1.0.0/ini.js" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				//
			})(ctx)
		} else if path == "/" || path == "/index.html" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, "index.html"))
			})(ctx)
		} else if path == "/profile" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				profile := &ProfileType{Id: ctx.UserValue("ProfileId").(int64)}
				profiles := profile.Get()
				profile = (*profiles)[0]
				fmt.Printf("\n%s\n", strings.Repeat("-", 80))
				fmt.Printf("ProfileId: %+v\nProfile: %+v\n", ctx.UserValue("ProfileId"), profile)
				fmt.Println("Applications:")
				for _, app := range profile.Applications {
					fmt.Printf("  %+v\n", app)}
				fmt.Printf("\n%s\n", strings.Repeat("-", 80))
				res, err := json.Marshal(profile)
				if err != nil {panic(err)}
				ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
				ctx.Write(res)
			})(ctx)
		} else if strings.HasPrefix(path, "/public") {
			fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath, path))
		// } else if strings.HasPrefix(path, "/public") {
		// 	self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
		// 		fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath, path))
		// 	})(ctx)
		} else if strings.HasPrefix(path, "/home") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				profile := &ProfileType{Id: ctx.UserValue("ProfileId").(int64)}
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath,
					(*profile.Get())[0].HomeFolder, strings.TrimPrefix(path, "/home")))
			})(ctx)
		} else {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, path))
			})(ctx)
		}
	})(ctx)
}