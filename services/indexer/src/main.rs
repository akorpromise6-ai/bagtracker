use anyhow::Result;
use chrono::Utc;
use shared_contracts::TransferEvent;
use tokio::time::{sleep, Duration};
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt().with_env_filter("info").init();
    info!("solana indexer scaffold started");

    loop {
        let parsed = parse_mock_transfer();
        persist_event(&parsed).await?;
        sleep(Duration::from_secs(5)).await;
    }
}

fn parse_mock_transfer() -> TransferEvent {
    TransferEvent {
        event_id: format!("evt-{}", Utc::now().timestamp_millis()),
        from: "WalletA111".to_string(),
        to: "WalletB111".to_string(),
        amount: 1.0,
        token: "SOL".to_string(),
        signature: "mock-signature".to_string(),
        slot: 0,
        block_time: Utc::now(),
        labels: vec![],
    }
}

async fn persist_event(_event: &TransferEvent) -> Result<()> {
    // Placeholder for PostgreSQL persistence.
    Ok(())
}
