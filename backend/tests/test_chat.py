import json
from types import SimpleNamespace

import pytest

from app.routers import chat as chat_router


def _fake_completion(content: str):
    """Build a stand-in for litellm.completion returning the given content."""

    def _completion(*args, **kwargs):
        message = SimpleNamespace(content=content)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])

    return _completion


def test_chat_returns_reply_and_updated_data(client, monkeypatch):
    result = {
        "reply": "Got it. What state's law should govern the NDA?",
        "data": {
            "purpose": "Evaluating a partnership.",
            "effectiveDate": "",
            "mndaTermMode": "expires",
            "mndaTermYears": 2,
            "confidentialityMode": "years",
            "confidentialityYears": 2,
            "governingLaw": "",
            "jurisdiction": "",
            "modifications": "",
            "party1": {"company": "Acme, Inc.", "name": "", "title": "", "noticeAddress": ""},
            "party2": {"company": "", "name": "", "title": "", "noticeAddress": ""},
        },
    }
    monkeypatch.setattr(
        chat_router, "completion", _fake_completion(json.dumps(result))
    )

    response = client.post(
        "/api/chat",
        json={
            "messages": [{"role": "user", "content": "It's for evaluating a partnership with Acme."}],
            "data": {
                "purpose": "",
                "effectiveDate": "",
                "mndaTermMode": "expires",
                "mndaTermYears": 1,
                "confidentialityMode": "years",
                "confidentialityYears": 1,
                "governingLaw": "",
                "jurisdiction": "",
                "modifications": "",
                "party1": {"company": "", "name": "", "title": "", "noticeAddress": ""},
                "party2": {"company": "", "name": "", "title": "", "noticeAddress": ""},
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == result["reply"]
    assert body["data"]["purpose"] == "Evaluating a partnership."
    assert body["data"]["mndaTermYears"] == 2
    assert body["data"]["party1"]["company"] == "Acme, Inc."


def test_chat_accepts_empty_history(client, monkeypatch):
    result = {"reply": "Hello!", "data": {"party1": {}, "party2": {}}}
    monkeypatch.setattr(
        chat_router, "completion", _fake_completion(json.dumps(result))
    )

    response = client.post(
        "/api/chat",
        json={"messages": [], "data": {"party1": {}, "party2": {}}},
    )

    assert response.status_code == 200
    assert response.json()["reply"] == "Hello!"


def test_chat_llm_error_returns_502(client, monkeypatch):
    def _boom(*args, **kwargs):
        raise RuntimeError("upstream down")

    monkeypatch.setattr(chat_router, "completion", _boom)

    response = client.post(
        "/api/chat",
        json={"messages": [], "data": {"party1": {}, "party2": {}}},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "AI service error"
