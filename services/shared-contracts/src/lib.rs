use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Chain {
    Solana,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EntityType {
    Wallet,
    Contract,
    Exchange,
    Bridge,
    Token,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceRequest {
    pub flow_id: Option<Uuid>,
    pub wallet: String,
    pub signature: String,
    pub token: String,
    pub amount_threshold: f64,
    pub hop_limit: u16,
    pub chain: Chain,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferEvent {
    pub event_id: String,
    pub from: String,
    pub to: String,
    pub amount: f64,
    pub token: String,
    pub signature: String,
    pub slot: u64,
    pub block_time: DateTime<Utc>,
    pub labels: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowNode {
    pub id: String,
    pub entity_type: EntityType,
    pub labels: Vec<String>,
    pub terminal_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowEdge {
    pub id: String,
    pub from: String,
    pub to: String,
    pub amount: f64,
    pub token: String,
    pub signature: String,
    pub hop: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowGraph {
    pub flow_id: Uuid,
    pub request: TraceRequest,
    pub nodes: Vec<FlowNode>,
    pub edges: Vec<FlowEdge>,
    pub cycles_detected: u32,
    pub merges_detected: u32,
    pub generated_at: DateTime<Utc>,
}
