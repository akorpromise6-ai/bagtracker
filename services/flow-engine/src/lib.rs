use chrono::Utc;
use shared_contracts::{Chain, EntityType, FlowEdge, FlowGraph, FlowNode, TraceRequest, TransferEvent};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

pub fn trace_flow(request: TraceRequest, events: &[TransferEvent]) -> FlowGraph {
    let mut adjacency: HashMap<String, Vec<&TransferEvent>> = HashMap::new();
    for event in events {
        if event.token != request.token || event.amount < request.amount_threshold {
            continue;
        }
        adjacency.entry(event.from.clone()).or_default().push(event);
    }

    let mut nodes: HashMap<String, FlowNode> = HashMap::new();
    let mut edges: Vec<FlowEdge> = Vec::new();
    let mut inbound: HashMap<String, u32> = HashMap::new();
    let mut cycles = 0;

    fn classify(labels: &[String]) -> (EntityType, Option<String>) {
        let lower: Vec<String> = labels.iter().map(|v| v.to_lowercase()).collect();
        if lower.iter().any(|v| ["binance", "bybit", "okx", "coinbase", "kraken", "mexc"].contains(&v.as_str())) {
            return (EntityType::Exchange, Some("exchange".to_string()));
        }
        if lower.iter().any(|v| ["wormhole", "layerzero"].contains(&v.as_str())) {
            return (EntityType::Bridge, Some("bridge".to_string()));
        }
        (EntityType::Wallet, None)
    }

    fn ensure_node(nodes: &mut HashMap<String, FlowNode>, address: &str, labels: &[String]) {
        if nodes.contains_key(address) {
            return;
        }
        let (entity_type, terminal_reason) = classify(labels);
        nodes.insert(
            address.to_string(),
            FlowNode {
                id: address.to_string(),
                entity_type,
                labels: labels.to_vec(),
                terminal_reason,
            },
        );
    }

    fn walk(
        address: &str,
        hop: u16,
        request: &TraceRequest,
        adjacency: &HashMap<String, Vec<&TransferEvent>>,
        nodes: &mut HashMap<String, FlowNode>,
        edges: &mut Vec<FlowEdge>,
        inbound: &mut HashMap<String, u32>,
        seen: &mut HashSet<(String, u16)>,
        cycles: &mut u32,
    ) {
        let marker = (address.to_string(), hop);
        if seen.contains(&marker) {
            *cycles += 1;
            return;
        }
        seen.insert(marker);

        if hop >= request.hop_limit {
            if let Some(node) = nodes.get_mut(address) {
                node.terminal_reason.get_or_insert("hop_limit".to_string());
            }
            return;
        }

        let outgoing = adjacency.get(address).cloned().unwrap_or_default();
        if outgoing.is_empty() {
            if let Some(node) = nodes.get_mut(address) {
                node.terminal_reason.get_or_insert("stopped".to_string());
            }
            return;
        }

        for event in outgoing {
            ensure_node(nodes, &event.to, &event.labels);
            edges.push(FlowEdge {
                id: event.event_id.clone(),
                from: event.from.clone(),
                to: event.to.clone(),
                amount: event.amount,
                token: event.token.clone(),
                signature: event.signature.clone(),
                hop: hop + 1,
            });
            *inbound.entry(event.to.clone()).or_insert(0) += 1;
            walk(
                &event.to,
                hop + 1,
                request,
                adjacency,
                nodes,
                edges,
                inbound,
                seen,
                cycles,
            );
        }
    }

    ensure_node(&mut nodes, &request.wallet, &[]);
    walk(
        &request.wallet,
        0,
        &request,
        &adjacency,
        &mut nodes,
        &mut edges,
        &mut inbound,
        &mut HashSet::new(),
        &mut cycles,
    );

    let merges_detected = inbound.values().filter(|count| **count > 1).count() as u32;
    FlowGraph {
        flow_id: request.flow_id.unwrap_or_else(Uuid::new_v4),
        request: TraceRequest {
            chain: Chain::Solana,
            ..request
        },
        nodes: nodes.into_values().collect(),
        edges,
        cycles_detected: cycles,
        merges_detected,
        generated_at: Utc::now(),
    }
}
