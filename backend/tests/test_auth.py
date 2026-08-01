def test_signup_returns_token(client):
    resp = client.post(
        "/api/auth/signup",
        json={"email": "alice@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_signup_duplicate_email_conflicts(client):
    payload = {"email": "bob@example.com", "password": "supersecret"}
    assert client.post("/api/auth/signup", json=payload).status_code == 201

    resp = client.post("/api/auth/signup", json=payload)
    assert resp.status_code == 409


def test_signup_rejects_short_password(client):
    resp = client.post(
        "/api/auth/signup",
        json={"email": "carol@example.com", "password": "short"},
    )
    assert resp.status_code == 422


def test_signin_succeeds_with_correct_password(client):
    payload = {"email": "dave@example.com", "password": "supersecret"}
    client.post("/api/auth/signup", json=payload)

    resp = client.post("/api/auth/signin", json=payload)
    assert resp.status_code == 200
    assert resp.json()["access_token"]


def test_signin_wrong_password_unauthorized(client):
    client.post(
        "/api/auth/signup",
        json={"email": "erin@example.com", "password": "supersecret"},
    )

    resp = client.post(
        "/api/auth/signin",
        json={"email": "erin@example.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401


def test_signin_unknown_user_unauthorized(client):
    resp = client.post(
        "/api/auth/signin",
        json={"email": "nobody@example.com", "password": "supersecret"},
    )
    assert resp.status_code == 401


def test_me_returns_current_user(client):
    payload = {"email": "frank@example.com", "password": "supersecret"}
    token = client.post("/api/auth/signup", json=payload).json()["access_token"]

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "frank@example.com"
    assert "id" in body


def test_me_rejects_missing_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_rejects_invalid_token(client):
    resp = client.get(
        "/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert resp.status_code == 401
