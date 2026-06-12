use anyhow::Result;
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt().with_env_filter("info").init();
    info!("telegram bot scaffold ready: /trace /watch /alert /flow /risk /explain");
    Ok(())
}
