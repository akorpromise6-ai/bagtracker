use axum::{extract::State, http::StatusCode, routing::get, routing::post, Json, Router};
use chrono::{Duration, Utc};
use shared_contracts::{Chain, TraceRequest, TransferEvent};
use std::sync::Arc;
use tracing::info;

#[derive(Clone)]
struct AppState {
    seed_events: Arc<Vec<TransferEvent>>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter("info").init();

    let state = AppState {
        seed_events: Arc::new(seed_events()),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/trace", post(trace))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.expect("bind api listener");
    info!("api listening on 0.0.0.0:8080");
    axum::serve(listener, app).await.expect("serve api");
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok", "service": "bagtracker-api" }))
}

async fn trace(State(state): State<AppState>, Json(mut request): Json<TraceRequest>) -> Result<Json<shared_contracts::FlowGraph>, (StatusCode, String)> {
    if request.wallet.is_empty() || request.signature.is_empty() || request.token.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "wallet, signature, and token are required".to_string()));
    }
    request.chain = Chain::Solana;
    if request.hop_limit == 0 {
        request.hop_limit = 1;
    }

    let graph = flow_engine::trace_flow(request, &state.seed_events);
    Ok(Json(graph))
}

fn seed_events() -> Vec<TransferEvent> {
    let now = Utc::now();
    vec![
        TransferEvent {
            event_id: "evt-1".to_string(),
            from: "WalletA111".to_string(),
            to: "WalletB111".to_string(),
            amount: 50.0,
            token: "SOL".to_string(),
            signature: "sig-1".to_string(),
            slot: 1,
            block_time: now,
            labels: vec![],
        },
        TransferEvent {
            event_id: "evt-2".to_string(),
            from: "WalletA111".to_string(),
            to: "WalletC111".to_string(),
            amount: 30.0,
            token: "SOL".to_string(),
            signature: "sig-1".to_string(),
            slot: 1,
            block_time: now + Duration::seconds(1),
            labels: vec![],
        },
        TransferEvent {
            event_id: "evt-3".to_string(),
            from: "WalletB111".to_string(),
            to: "BinanceDeposit111".to_string(),
            amount: 40.0,
            token: "SOL".to_string(),
            signature: "sig-2".to_string(),
            slot: 2,
            block_time: now + Duration::seconds(2),
            labels: vec!["binance".to_string()],
        },
    ]
}
