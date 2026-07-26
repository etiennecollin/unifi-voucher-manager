use axum::{
    Router,
    http::{self, Method},
    routing::{delete, get, post},
};
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info, level_filters::LevelFilter, warn};
use tracing_subscriber::EnvFilter;

use backend::{
    environment::{ENVIRONMENT, Environment},
    handlers::*,
    tasks::run_daily_purge,
    unifi_api::{UNIFI_API, UnifiAPI},
};

#[tokio::main]
async fn main() {
    // =================================
    // Initialize tracing
    // =================================
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_env_var("BACKEND_LOG_LEVEL")
                .with_default_directive(LevelFilter::INFO.into())
                .from_env_lossy(),
        )
        .init();

    // =================================
    // Setup environment variables manager
    // =================================
    let env = match Environment::try_new() {
        Ok(env) => env,
        Err(e) => {
            error!("Failed to load environment variables: {e}");
            std::process::exit(1);
        }
    };
    ENVIRONMENT
        .set(env)
        .expect("Failed to set environment variables");
    let environment = ENVIRONMENT.get().expect("Environment not set");

    // =================================
    // Setup UniFi Controller API connection
    // =================================
    loop {
        match UnifiAPI::try_new().await {
            Ok(api) => {
                UNIFI_API.set(api).expect("Failed to set UnifiAPI");
                info!("Successfully connected to Unifi controller");
                break;
            }
            Err(e) => {
                error!("Failed to initialize UnifiAPI wrapper: {}", e);
                warn!("Retrying connection in 5 seconds...");
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
            }
        }
    }

    // =================================
    // Start scheduled tasks
    // =================================
    tokio::spawn(run_daily_purge(
        environment.timezone,
        environment.purge_all_expired_vouchers,
    ));

    // =================================
    // Setup Axum server
    // =================================
    let cors = CorsLayer::new()
        .allow_headers([http::header::CONTENT_TYPE])
        .allow_methods([Method::POST, Method::GET, Method::DELETE])
        .allow_origin(Any);

    let app = Router::new()
        .route("/api/health", get(health_check_handler))
        .route("/api/vouchers", get(get_all_vouchers_handler))
        .route("/api/vouchers", post(create_voucher_handler))
        .route("/api/vouchers/details", get(get_voucher_details_handler))
        .route("/api/vouchers/expired", delete(delete_expired_handler))
        .route("/api/vouchers/filtered", get(get_vouchers_filtered_handler))
        .route(
            "/api/vouchers/expired/rolling",
            delete(delete_expired_rolling_handler),
        )
        .route("/api/vouchers/newest", get(get_newest_voucher_handler))
        .route("/api/vouchers/rolling", get(get_rolling_voucher_handler))
        .route(
            "/api/vouchers/rolling",
            post(create_rolling_voucher_handler),
        )
        .route("/api/vouchers/selected", delete(delete_selected_handler))
        .layer(cors);

    let bind_address = format!(
        "{}:{}",
        environment.backend_bind_host, environment.backend_bind_port
    );

    let listener = tokio::net::TcpListener::bind(&bind_address)
        .await
        .expect("Could not bind listener");

    info!("Server running on http://{}", bind_address);

    axum::serve(listener, app)
        .await
        .expect("Axum server should never error");
}
