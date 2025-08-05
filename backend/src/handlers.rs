use crate::{models::*, unifi_api::*};
use axum::{extract::Query, http::StatusCode, response::Json};
use tracing::{debug, error};

pub async fn get_vouchers_handler() -> Result<Json<GetVouchersResponse>, StatusCode> {
    debug!("Received request to get vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_all_vouchers().await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to get vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn get_newest_voucher_handler() -> Result<Json<Option<Voucher>>, StatusCode> {
    debug!("Received request to get newest voucher");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_newest_voucher().await {
        Ok(voucher) => Ok(Json(voucher)),
        Err(e) => {
            error!("Failed to get newest voucher: {}", e);
            Err(e)
        }
    }
}

pub async fn get_voucher_details_handler(
    Query(params): Query<DetailsRequest>,
) -> Result<Json<Voucher>, StatusCode> {
    debug!("Received request to get voucher details");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_voucher_details(params.id).await {
        Ok(voucher) => Ok(Json(voucher)),
        Err(e) => {
            error!("Failed to get voucher details: {}", e);
            Err(e)
        }
    }
}

pub async fn create_voucher_handler(
    Json(request): Json<CreateVoucherRequest>,
) -> Result<Json<CreateVoucherResponse>, StatusCode> {
    debug!("Received request to create voucher");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.create_voucher(request.clone()).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to create voucher: {}", e);
            Err(e)
        }
    }
}

pub async fn delete_selected_handler(
    Query(params): Query<DeleteRequest>,
) -> Result<Json<DeleteResponse>, StatusCode> {
    debug!("Received request to delete selected vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    let ids = params.ids.split(',').map(|s| s.to_string()).collect();
    match client.delete_vouchers_by_ids(ids).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to delete selected vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn delete_expired_handler() -> Result<Json<DeleteResponse>, StatusCode> {
    debug!("Received request to delete expired vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.delete_expired_vouchers().await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to delete expired vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn health_check_handler() -> Result<Json<HealthCheckResponse>, StatusCode> {
    debug!("Received health check request");
    let response = HealthCheckResponse {
        status: "ok".to_string(),
    };
    Ok(Json(response))
}
