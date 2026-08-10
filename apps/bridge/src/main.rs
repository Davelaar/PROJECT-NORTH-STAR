use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/slicers", get(list_slicers))
        .route("/v1/auth/session", post(auth_session));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8788));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind 127.0.0.1:8788");
    println!("open-filament-bridge listening on http://{addr}");
    axum::serve(listener, app).await.expect("serve");
}

async fn health() -> Json<Value> {
    Json(json!({
        "ok": true,
        "service": "open-filament-bridge",
        "mode": "stub"
    }))
}

async fn list_slicers() -> Json<Value> {
    // Stub: no local slicer discovery yet
    Json(json!({
        "slicers": [],
        "note": "Stub bridge — slicer discovery not implemented"
    }))
}

#[derive(Deserialize)]
struct SessionRequest {
    token: Option<String>,
}

#[derive(Serialize)]
struct SessionResponse {
    ok: bool,
    mode: &'static str,
    message: String,
}

async fn auth_session(Json(body): Json<SessionRequest>) -> Json<SessionResponse> {
    let _ = body.token;
    Json(SessionResponse {
        ok: true,
        mode: "stub",
        message: "Session accepted locally without validation (stub only)".into(),
    })
}
