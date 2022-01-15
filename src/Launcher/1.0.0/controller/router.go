package controller

import (
	"html/template"
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
		pathArray := strings.Split(string(ctx.Path()), "/")[1:]
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
		if path == "/" || path == "/index.html" {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, "index.html"))
			})(ctx)
		} else if strings.HasPrefix(path, "/App") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				var ver string
				if len(pathArray) < 3 {
					ver = "last"
				} else {
					ver = pathArray[1]
				}
				if strings.HasSuffix(path, ".js") {
					fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, pathArray[0], ver, "scripts", pathArray[len(pathArray)-1]))
				} else if strings.HasSuffix(path, ".css") {
					fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, pathArray[0], ver, "styles", pathArray[len(pathArray)-1]))
				} else if strings.HasSuffix(path, ".html") {
					ctx.SetContentType("text/html")
					fullPath := filepath.Join(Config.RootDirPath, "templates", "index.tmpl")
					data := struct {
						Style       string
						Application string
					}{
						Style: "default",
						Application: strings.TrimPrefix(pathArray[0], "App"),
					}
					tmpl := template.Must(template.ParseFiles(fullPath))
					tmpl.Execute(ctx, data)
				}
			})(ctx)
		} else if strings.HasSuffix(path, "/api") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				api(ctx)
			})(ctx)
		} else if strings.HasPrefix(path, "/home") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				profile := &ProfileType{Id: ctx.UserValue("ProfileId").(int64)}
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath,
					(*profile.Get())[0].HomeFolder, strings.TrimPrefix(path, "/home")))
			})(ctx)
		} else if strings.HasPrefix(path, "/admin") {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath, path))
			})(ctx)
		} else if strings.HasPrefix(path, "/public") {
			fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath, path))
			// } else if strings.HasPrefix(path, "/public") {
			// 	self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
			// 		fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.DataDirPath, path))
			// 	})(ctx)
		} else if strings.HasPrefix(path, "/webdav") {
			self.sessionMiddleware(fasthttpadaptor.NewFastHTTPHandler(self.webdavHandler()))(ctx)
		} else if strings.HasPrefix(path, "/lib") {
			fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, path))
		} else {
			self.sessionMiddleware(func(ctx *fasthttp.RequestCtx) {
				fasthttp.ServeFileUncompressed(ctx, filepath.Join(Config.RootDirPath, path))
			})(ctx)
		}
	})(ctx)
}
