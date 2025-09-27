"""Python Flask WebApp Auth0 integration example
"""
import json
from os import environ as env
from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for, jsonify

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")

FRONTEND_URL = env.get("FRONTEND_URL", "http://localhost:5173")  # <-- added
PORT = int(env.get("PORT", 8000))                                # <-- default 8000

oauth = OAuth(app)
oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={"scope": "openid profile email"},
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration',
)

# Controllers API
@app.route("/")
def home():
    # Keep sample template route (not used by SPA, but harmless)
    return render_template(
        "home.html",
        session=session.get("user"),
        pretty=json.dumps(session.get("user"), indent=4),
    )

# NEW: small JSON endpoint so the SPA can read the logged-in user
@app.route("/session", methods=["GET"])
def session_info():
    return jsonify(session.get("user") or {})

@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.auth0.authorize_access_token()
    session["user"] = token
    # After login, go back to the React app
    return redirect(FRONTEND_URL)

@app.route("/login")
def login():
    # Force redirect_uri to the SPA's domain (/callback is proxied to this route)
    return oauth.auth0.authorize_redirect(
        redirect_uri=f"{FRONTEND_URL}/callback"
    )

@app.route("/logout")
def logout():
    session.clear()
    return redirect(
        "https://"
        + env.get("AUTH0_DOMAIN")
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": FRONTEND_URL,            # <-- back to SPA root
                "client_id": env.get("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
