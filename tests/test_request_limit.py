import asyncio

from balaka.main import CloneBodyLimitMiddleware


def test_clone_body_limit_rejects_stream_without_content_length() -> None:
    messages = iter(
        [
            {"type": "http.request", "body": b"ab", "more_body": True},
            {"type": "http.request", "body": b"cd", "more_body": False},
        ]
    )
    sent = []

    async def receive():
        return next(messages)

    async def send(message):
        sent.append(message)

    async def app(scope, receive, send):
        raise AssertionError("oversized body reached the app")

    scope = {"type": "http", "method": "POST", "path": "/clone", "headers": []}
    middleware = CloneBodyLimitMiddleware(app, path="/clone", max_bytes=3)

    asyncio.run(middleware(scope, receive, send))

    assert sent[0]["type"] == "http.response.start"
    assert sent[0]["status"] == 413


def test_clone_body_limit_rejects_known_length_before_reading() -> None:
    sent = []

    async def receive():
        raise AssertionError("oversized body was read")

    async def send(message):
        sent.append(message)

    async def app(scope, receive, send):
        raise AssertionError("oversized body reached the app")

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/clone",
        "headers": [(b"content-length", b"4")],
    }
    middleware = CloneBodyLimitMiddleware(app, path="/clone", max_bytes=3)

    asyncio.run(middleware(scope, receive, send))

    assert sent[0]["status"] == 413
