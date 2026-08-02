import json
from types import SimpleNamespace

from app.routers import chat as chat_router


def _fake_completion(content: str):
    """Build a stand-in for litellm.completion returning the given content."""

    def _completion(*args, **kwargs):
        message = SimpleNamespace(content=content)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])

    return _completion


def _post(client, messages, data):
    return client.post("/api/chat", json={"messages": messages, "data": data})


def test_chat_selects_document_and_collects_fields(client, monkeypatch):
    result = {
        "reply": "A Mutual NDA it is. Who are the two parties?",
        "data": {
            "docType": "mutual-nda",
            "coverFields": [
                {"label": "Purpose", "value": "Evaluating a partnership."}
            ],
            "parties": [
                {
                    "heading": "Party 1",
                    "company": "Acme, Inc.",
                    "name": "",
                    "title": "",
                    "noticeAddress": "",
                }
            ],
        },
    }
    monkeypatch.setattr(chat_router, "completion", _fake_completion(json.dumps(result)))

    response = _post(
        client,
        [{"role": "user", "content": "I need an NDA to evaluate a partnership with Acme."}],
        {"docType": "", "coverFields": [], "parties": []},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == result["reply"]
    assert body["data"]["docType"] == "mutual-nda"
    assert body["data"]["coverFields"][0]["label"] == "Purpose"
    assert body["data"]["parties"][0]["company"] == "Acme, Inc."


def test_chat_accepts_empty_history_and_document(client, monkeypatch):
    result = {"reply": "What kind of document do you need?", "data": {"docType": ""}}
    monkeypatch.setattr(chat_router, "completion", _fake_completion(json.dumps(result)))

    response = _post(client, [], {"docType": "", "coverFields": [], "parties": []})

    assert response.status_code == 200
    assert response.json()["data"]["docType"] == ""


def test_chat_clears_unknown_document_type(client, monkeypatch):
    # A hallucinated docType must not survive — it would yield an empty PDF.
    result = {
        "reply": "Let's start over — what do you need?",
        "data": {"docType": "employment-contract", "coverFields": [], "parties": []},
    }
    monkeypatch.setattr(chat_router, "completion", _fake_completion(json.dumps(result)))

    response = _post(client, [{"role": "user", "content": "hi"}], {"docType": ""})

    assert response.status_code == 200
    assert response.json()["data"]["docType"] == ""


def test_chat_llm_error_returns_502(client, monkeypatch):
    def _boom(*args, **kwargs):
        raise RuntimeError("upstream down")

    monkeypatch.setattr(chat_router, "completion", _boom)

    response = _post(client, [], {"docType": "", "coverFields": [], "parties": []})

    assert response.status_code == 502
    assert response.json()["detail"] == "AI service error"
