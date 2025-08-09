use axum::{
    Router,
    http::{self, Method},
    routing::{delete, get, post},
};
use backend::{
    ENVIRONMENT, Environment,
    handlers::*,
    unifi_api::{UNIFI_API, UnifiAPI},
};
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info, level_filters::LevelFilter};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_env_var("BACKEND_LOG_LEVEL")
                .with_default_directive(LevelFilter::INFO.into())
                .from_env_lossy(),
        )
        .init();

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

    let unifi_api = match UnifiAPI::new().await {
        Ok(api) => api,
        Err(_) => {
            error!("Failed to initialize UnifiAPI wrapper");
            std::process::exit(1);
        }
    };
    UNIFI_API.set(unifi_api).expect("Failed to set UnifiAPI");

    let cors = CorsLayer::new()
        .allow_headers([http::header::CONTENT_TYPE])
        .allow_methods([Method::POST, Method::GET, Method::DELETE])
        .allow_origin(Any);

    let app = Router::new()
        .route("/api/health", get(health_check_handler))
        .route("/api/vouchers", get(get_vouchers_handler))
        .route("/api/vouchers", post(create_voucher_handler))
        .route("/api/vouchers/details", get(get_voucher_details_handler))
        .route("/api/vouchers/expired", delete(delete_expired_handler))
        .route("/api/vouchers/newest", get(get_newest_voucher_handler))
        .route("/api/vouchers/selected", delete(delete_selected_handler))
        .layer(cors);

    let environment = ENVIRONMENT.get().expect("Environment not set");
    let bind_address = format!(
        "{}:{}",
        environment.backend_bind_host, environment.backend_bind_port
    );
    let listener = tokio::net::TcpListener::bind(&bind_address).await.unwrap();
    info!("Server running on http://{}", bind_address);

    axum::serve(listener, app).await.unwrap();
}
