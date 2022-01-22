import os
from typing import NamedTuple
import uvicorn
from importlib import import_module
# from starlette import status
# from starlette.responses import Response
from fastapi import FastAPI, Request, Cookie, Body #, status
from fastapi.responses import Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
# from fastapi.responses import HTMLResponse
# from fastapi.responses import StreamingResponse
# from fastapi.responses import RedirectResponse
from fastapi.responses import JSONResponse
from fastapi.responses import PlainTextResponse
from typing import Optional
from pydantic import BaseModel
from asyncio.exceptions import CancelledError
# from AppLauncher.backend.log import Log
from AppLauncher.backend.api import Query
from AppLauncher.backend.config import config
from AppLauncher.backend.events import Events
from AppLauncher.backend.sessions import Session
from AppLauncher.backend.users import User
from AppLauncher.backend.api import API

prefix = "/monitor_it"
app = FastAPI()

app.mount(f"{prefix}/styles", StaticFiles(directory=config.stylesDirPath), name="styles")
templates = Jinja2Templates(directory=config.httpDirPath)

@app.on_event("startup")
async def onStart():
	Events.onStart()

@app.on_event("shutdown")
async def onStop():
	Events.onStop()

@app.get(f"{prefix}/{{app_}}/install")
async def install(request: Request, app_: str) -> bytes:
	return templates.TemplateResponse("install.html", {
		"request": request,
		"items": import_module(f"App{app_}.install.install").Install().run()
	})

@app.get(f"{prefix}/scripts/{{name}}")
async def getScript(request: Request, name: str) -> bytes:
	return FileResponse(os.path.join(config.scriptsDirPath, name))

@app.get(f"{prefix}/pictures/{{name}}")
async def getPicture(request: Request, name: str) -> bytes:
	return FileResponse(os.path.join(config.picturesDirPath, name))

@app.get(f"{prefix}/{{chapter}}")
@app.get(f"{prefix}/")
async def index(
	request: Request,
	sid: Optional[str] = Cookie(None),
	chapter: Optional[str] = None
) -> bytes:
	ses = Session().get(where=f'id="{sid}"')
	if ses.userId:
		isAdmin = False if User().get(where=f"id={ses.userId}").tags.lower().find("admin") == -1 else True
		if chapter == "admin":
			if isAdmin:
				return templates.TemplateResponse("index.html", {
					"request": request,
					"title": "Administration",
					"icon": "favicon.ico",
					"styles": ["white_blue.css"],
					"scripts": ["system.js", "admin.js"]
				})
			return PlainTextResponse(content="Access denied", status_code=403)
		return templates.TemplateResponse("index.html", {
			"request": request,
			"title": "MonitoringIT",
			"icon": "favicon.ico",
			"styles": ["white_blue.css"],
			"scripts": ["system.js", "monitorit.js"],
			"isAdmin": isAdmin
		})
	return templates.TemplateResponse("index.html", {
		"request": request,
		"title": "Authorization",
		"icon": "favicon.ico",
		"styles": ["auth.css"],
		"scripts": ["auth.js"]
	})

@app.post(f"{prefix}/api")
async def api(
	request: Request,
	sid: Optional[str] = Cookie(None),
	query: Query = Body(...)
) -> bytes:
	response = API.query(sid, query)
	response.headers["Access-Control-Allow-Origin "] = "https://cabinet.duckdns.org"
	response.headers["Access-Control-Allow-Credentials"] = "true"
	return response

@app.options(f"{prefix}/api")
async def options(request: Request)-> bytes:
	response = Response(content="", status_code=200)
	response.headers["Access-Control-Allow-Methods"] = "POST"
	response.headers["Access-Control-Allow-Headers"] = "Content-type"
	response.headers["Access-Control-Allow-Origin"] = "https://cabinet.duckdns.org"
	response.headers["Access-Control-Allow-Credentials"] = "true"
	response.headers["Access-Control-Max-Age"] = "3600"
	return response

class HTTPServer(object):
	def run(**kvargs) -> (str, int):
		try:
			uvicorn.run("AppLauncher.backend.httpServer:app", host=config.httpHost, port=config.httpPort,
				reload=config.httpReload, debug=config.httpDebug, workers=config.httpWorkers)
		except CancelledError:
			return "Ok", 0
		except Exception as exc:
			return exc, 1
