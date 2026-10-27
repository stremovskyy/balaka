from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.types import ASGIApp, Receive, Scope, Send

from balaka.api import tts_router
from balaka.api.routes.tts import MAX_REFERENCE_AUDIO_BYTES
from balaka.core import Settings, get_settings
from balaka.services import SpeechService, TTSRuntimeError


class CloneBodyLimitMiddleware:
    def __init__(self, app: ASGIApp, path: str, max_bytes: int) -> None:
        self.app = app
        self.path = path
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["method"] != "POST" or scope["path"] != self.path:
            await self.app(scope, receive, send)
            return

        too_large = JSONResponse(
            status_code=413,
            content={"detail": "Reference audio exceeds 20 MiB."},
        )
        for name, value in scope["headers"]:
            if name.lower() == b"content-length":
                try:
                    if int(value) > self.max_bytes:
                        await too_large(scope, receive, send)
                        return
                except ValueError:
                    pass

        body = bytearray()
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            if len(body) + len(chunk) > self.max_bytes:
                await too_large(scope, receive, send)
                return
            body.extend(chunk)
            if not message.get("more_body", False):
                break

        replayed = False

        async def replay_receive():
            nonlocal replayed
            if not replayed:
                replayed = True
                return {"type": "http.request", "body": bytes(body), "more_body": False}
            return await receive()

        await self.app(scope, replay_receive, send)


def create_app(tts_service: SpeechService | None = None) -> FastAPI:
    settings = get_settings()
    service = tts_service or SpeechService(settings)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        if settings.tts_preload_runtime:
            service.warmup()
        yield

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.state.settings = settings
    app.state.tts_service = service
    app.add_middleware(
        CloneBodyLimitMiddleware,
        path=f"{settings.api_prefix}/tts/clone",
        max_bytes=MAX_REFERENCE_AUDIO_BYTES + 1024 * 1024,
    )

    @app.middleware("http")
    async def disable_browser_caching(request: Request, call_next):
        response = await call_next(request)
        if request.url.path == "/" or request.url.path.startswith("/tts/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(TTSRuntimeError)
    def handle_tts_runtime_error(_: Request, exc: TTSRuntimeError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/", include_in_schema=False)
    def root() -> RedirectResponse:
        return RedirectResponse(url="/tts/")

    app.include_router(tts_router, prefix=settings.api_prefix)

    if settings.frontend_dir.exists():
        app.mount("/tts", StaticFiles(directory=settings.frontend_dir, html=True), name="tts-frontend")

    return app


def run() -> None:
    import uvicorn

    settings: Settings = get_settings()
    uvicorn.run(
        "balaka.main:create_app",
        factory=True,
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
