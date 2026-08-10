mod cfs;
mod presets;
mod slicers;
mod transport;

use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::net::SocketAddr;

const VERSION: &str = env!("CARGO_PKG_VERSION");
const DEFAULT_TOKEN: &str = "local-dev-token";

fn bridge_token() -> String {
    std::env::var("OF_BRIDGE_TOKEN").unwrap_or_else(|_| DEFAULT_TOKEN.to_string())
}

fn origin_allowed(headers: &HeaderMap) -> bool {
    let allowed = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:8787",
        "http://localhost:8787",
    ];
    let origin = headers
        .get("origin")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if origin.is_empty() {
        // non-browser clients (curl) — allow when no Origin
        return true;
    }
    allowed.iter().any(|a| *a == origin)
}

async fn require_origin(headers: HeaderMap, req: Request, next: Next) -> Response {
    let path = req.uri().path();
    if path == "/health" || req.method() == axum::http::Method::GET {
        return next.run(req).await;
    }
    if !origin_allowed(&headers) {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({ "ok": false, "error": "Origin not allowed" })),
        )
            .into_response();
    }
    next.run(req).await
}

async fn require_token(headers: HeaderMap, req: Request, next: Next) -> Response {
    // /health is open; everything else needs X-OF-Bridge-Token
    if req.uri().path() == "/health" {
        return next.run(req).await;
    }
    let expected = bridge_token();
    let provided = headers
        .get("x-of-bridge-token")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if provided != expected {
        return (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "ok": false,
                "error": "Missing or invalid X-OF-Bridge-Token"
            })),
        )
            .into_response();
    }
    next.run(req).await
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/slicers", get(list_slicers))
        .route("/v1/presets/install", post(presets_install))
        .route("/v1/presets/list", post(presets_list))
        .route("/v1/presets/rollback", post(presets_rollback))
        .route("/v1/presets/remove", post(presets_remove))
        .route("/v1/rfid/encode", post(rfid_encode))
        .route("/v1/rfid/simulate-write", post(rfid_simulate))
        .route("/v1/rfid/write", post(rfid_write))
        .route("/v1/rfid/readers", get(rfid_readers))
        .route("/v1/rfid/map-install", post(rfid_map_install))
        .route("/v1/auth/session", post(auth_session))
        .layer(middleware::from_fn(require_origin))
        .layer(middleware::from_fn(require_token));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8788));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind 127.0.0.1:8788");
    println!("open-filament-bridge {VERSION} listening on http://{addr}");
    println!(
        "token header X-OF-Bridge-Token (env OF_BRIDGE_TOKEN, default {DEFAULT_TOKEN})"
    );
    if let Some(over) = slicers::filament_root_override() {
        println!("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE={}", over.display());
    }
    axum::serve(listener, app).await.expect("serve");
}

async fn health() -> Json<Value> {
    let detected = slicers::detect_slicers();
    Json(json!({
        "ok": true,
        "service": "open-filament-bridge",
        "version": VERSION,
        "bind": "127.0.0.1:8788",
        "mode": "local",
        "features": [
            "slicer_detect",
            "preset_install",
            "preset_list",
            "cfs_encode",
            "cfs_simulate_write"
        ],
        "slicers": detected,
        "filamentRootOverride": slicers::filament_root_override()
            .map(|p| p.display().to_string()),
    }))
}

async fn list_slicers() -> Json<Value> {
    Json(json!({
        "slicers": slicers::detect_slicers()
    }))
}

async fn presets_install(Json(body): Json<Value>) -> Response {
    let parsed: Result<presets::InstallRequest, _> = serde_json::from_value(body);
    match parsed {
        Ok(req) => match presets::install_preset(req) {
            Ok(resp) => (StatusCode::OK, Json(resp)).into_response(),
            Err(e) => (
                StatusCode::BAD_REQUEST,
                Json(json!({ "ok": false, "error": e })),
            )
                .into_response(),
        },
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e.to_string() })),
        )
            .into_response(),
    }
}

async fn presets_list(Json(body): Json<Value>) -> Response {
    let parsed: Result<presets::ListRequest, _> = serde_json::from_value(body);
    match parsed {
        Ok(req) => match presets::list_presets(req) {
            Ok(list) => (StatusCode::OK, Json(json!({ "presets": list }))).into_response(),
            Err(e) => (
                StatusCode::BAD_REQUEST,
                Json(json!({ "ok": false, "error": e })),
            )
                .into_response(),
        },
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e.to_string() })),
        )
            .into_response(),
    }
}

async fn presets_rollback(Json(body): Json<Value>) -> Response {
    let parsed: Result<presets::RollbackRequest, _> = serde_json::from_value(body);
    match parsed {
        Ok(req) => match presets::rollback_preset(req) {
            Ok(resp) => (StatusCode::OK, Json(resp)).into_response(),
            Err(e) => (
                StatusCode::BAD_REQUEST,
                Json(json!({ "ok": false, "error": e })),
            )
                .into_response(),
        },
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e.to_string() })),
        )
            .into_response(),
    }
}

async fn presets_remove(Json(body): Json<Value>) -> Response {
    let parsed: Result<presets::RemoveRequest, _> = serde_json::from_value(body);
    match parsed {
        Ok(req) => match presets::remove_preset(req) {
            Ok(resp) => (StatusCode::OK, Json(resp)).into_response(),
            Err(e) => (
                StatusCode::BAD_REQUEST,
                Json(json!({ "ok": false, "error": e })),
            )
                .into_response(),
        },
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e.to_string() })),
        )
            .into_response(),
    }
}

async fn rfid_readers() -> Json<Value> {
    Json(transport::list_readers_json())
}

async fn rfid_write(Json(body): Json<RfidEncodeBody>) -> Response {
    match transport::write_with_policy(
        &body.material,
        &body.color,
        &body.weight_or_length,
        body.serial.as_deref(),
        body.batch.as_deref(),
        body.date.as_deref(),
        body.supplier.as_deref(),
        body.uid.as_deref(),
        false,
    ) {
        Ok(v) => (StatusCode::OK, Json(v)).into_response(),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e })),
        )
            .into_response(),
    }
}

async fn rfid_map_install(Json(body): Json<Value>) -> Response {
    // Accept either bridgeInstallPayload directly or nested under that key
    let payload = body
        .get("bridgeInstallPayload")
        .cloned()
        .unwrap_or(body);
    let parsed: Result<presets::InstallRequest, _> = serde_json::from_value(payload);
    match parsed {
        Ok(req) => match presets::install_preset(req) {
            Ok(resp) => (StatusCode::OK, Json(json!({ "ok": true, "install": resp }))).into_response(),
            Err(e) => (
                StatusCode::BAD_REQUEST,
                Json(json!({ "ok": false, "error": e })),
            )
                .into_response(),
        },
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e.to_string() })),
        )
            .into_response(),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RfidEncodeBody {
    material: String,
    color: String,
    #[serde(default = "default_weight")]
    weight_or_length: String,
    serial: Option<String>,
    batch: Option<String>,
    date: Option<String>,
    supplier: Option<String>,
    uid: Option<String>,
}

fn default_weight() -> String {
    "1kg".into()
}

async fn rfid_encode(Json(body): Json<RfidEncodeBody>) -> Response {
    match encode_inner(body) {
        Ok(v) => (StatusCode::OK, Json(v)).into_response(),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e })),
        )
            .into_response(),
    }
}

fn encode_inner(body: RfidEncodeBody) -> Result<Value, String> {
    let (ascii, fields) = cfs::encode_plaintext(
        &body.material,
        &body.color,
        &body.weight_or_length,
        body.serial.as_deref(),
        body.batch.as_deref(),
        body.date.as_deref(),
        body.supplier.as_deref(),
    )?;
    let ct = cfs::encrypt_payload(ascii.as_bytes())?;
    let mut out = json!({
        "ok": true,
        "format": "creality-cfs-v1",
        "plaintextAscii": ascii,
        "plaintextHex": hex::encode(ascii.as_bytes()),
        "ciphertextHex": hex::encode(&ct),
        "blocksHex": {
            "block4": hex::encode(&ct[0..16]),
            "block5": hex::encode(&ct[16..32]),
            "block6": hex::encode(&ct[32..48]),
        },
        "fields": fields,
    });
    if let Some(uid) = body.uid {
        let uid_bytes = hex::decode(uid.replace(' ', "")).map_err(|e| e.to_string())?;
        let key_a = cfs::derive_uid_key_a(&uid_bytes)?;
        out["uidKeyAHex"] = json!(hex::encode(key_a));
        out["uid"] = json!(uid);
    }
    Ok(out)
}

async fn rfid_simulate(Json(body): Json<RfidEncodeBody>) -> Response {
    match simulate_inner(body) {
        Ok(v) => (StatusCode::OK, Json(v)).into_response(),
        Err(e) => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "ok": false, "error": e })),
        )
            .into_response(),
    }
}

fn simulate_inner(body: RfidEncodeBody) -> Result<Value, String> {
    transport::write_with_policy(
        &body.material,
        &body.color,
        &body.weight_or_length,
        body.serial.as_deref(),
        body.batch.as_deref(),
        body.date.as_deref(),
        body.supplier.as_deref(),
        body.uid.as_deref(),
        true,
    )
}

#[derive(Deserialize)]
struct SessionRequest {
    token: Option<String>,
}

async fn auth_session(Json(body): Json<SessionRequest>) -> Json<Value> {
    let expected = bridge_token();
    let ok = body.token.as_deref() == Some(expected.as_str());
    Json(json!({
        "ok": ok,
        "mode": "shared_secret",
        "message": if ok {
            "Session token accepted"
        } else {
            "Provide token matching OF_BRIDGE_TOKEN / X-OF-Bridge-Token"
        }
    }))
}
