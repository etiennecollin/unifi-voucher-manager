use axum::{
    extract::Query,
    http::{HeaderMap, StatusCode},
    response::Json,
};
use tracing::{debug, error, info};

use crate::{models::*, unifi_api::UNIFI_API};

pub async fn get_vouchers_filtered_handler(
    Query(site): Query<SiteNameRequest>,
    Query(params): Query<VouchersGetRequest>,
) -> Result<Json<VouchersGetResponse>, StatusCode> {
    debug!("Received request to get vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_vouchers(site.site_name.as_str(), &params).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to get vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn get_all_vouchers_handler(
    Query(site): Query<SiteNameRequest>,
) -> Result<Json<VouchersGetResponse>, StatusCode> {
    debug!("Received request to get all vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_all_vouchers(site.site_name.as_str()).await {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to get vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn get_rolling_voucher_handler(
    Query(site): Query<SiteNameRequest>,
) -> Result<Json<Voucher>, StatusCode> {
    debug!("Received request to get rolling voucher");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_rolling_voucher(site.site_name.as_str()).await {
        Ok(Some(voucher)) => Ok(Json(voucher)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            error!("Failed to get rolling voucher: {}", e);
            Err(e)
        }
    }
}

pub async fn get_newest_voucher_handler(
    Query(site): Query<SiteNameRequest>,
) -> Result<Json<Voucher>, StatusCode> {
    debug!("Received request to get newest voucher");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client.get_newest_voucher(site.site_name.as_str()).await {
        Ok(voucher) => Ok(Json(voucher)),
        Err(e) => {
            error!("Failed to get newest voucher: {}", e);
            Err(e)
        }
    }
}

pub async fn get_voucher_details_handler(
    Query(site): Query<SiteNameRequest>,
    Query(params): Query<VoucherDetailsRequest>,
) -> Result<Json<Voucher>, StatusCode> {
    debug!("Received request to get voucher details");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client
        .get_voucher_details(site.site_name.as_str(), params.id)
        .await
    {
        Ok(voucher) => Ok(Json(voucher)),
        Err(e) => {
            error!("Failed to get voucher details: {}", e);
            Err(e)
        }
    }
}

pub async fn create_voucher_handler(
    Query(site): Query<SiteNameRequest>,
    Json(request): Json<VouchersCreateRequest>,
) -> Result<Json<VouchersCreateResponse>, StatusCode> {
    debug!("Received request to create voucher");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client
        .create_voucher(site.site_name.as_str(), &request)
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to create voucher: {}", e);
            Err(e)
        }
    }
}

pub async fn create_rolling_voucher_handler(
    headers: HeaderMap,
    Query(site): Query<SiteNameRequest>,
) -> Result<Json<Voucher>, StatusCode> {
    debug!("Received request to create voucher");

    let client = UNIFI_API.get().expect("UnifiAPI not initialized");

    if let Some(forwarded) = headers.get("x-forwarded-for")
        && let Ok(ip) = forwarded.to_str()
    {
        debug!("Client IP from x-forwarded-for: {}", ip);

        // Check if user already rotated the rolling voucher
        if client
            .check_rolling_voucher_ip(site.site_name.as_str(), ip)
            .await?
        {
            info!("Rolling voucher already rotated for IP: {}", ip);
            return Err(StatusCode::FORBIDDEN);
        }

        // Voucher rotation allowed, create a new rolling voucher
        match client
            .create_rolling_voucher(site.site_name.as_str(), ip)
            .await
        {
            Ok(response) => return Ok(Json(response)),
            Err(e) => {
                error!("Failed to create rolling voucher: {}", e);
                return Err(e);
            }
        }
    }

    error!("Invalid x-forwarded-for header");
    Err(StatusCode::BAD_REQUEST)
}

pub async fn delete_selected_handler(
    Query(site): Query<SiteNameRequest>,
    Query(params): Query<VouchersDeleteRequest>,
) -> Result<Json<DeleteResponse>, StatusCode> {
    debug!("Received request to delete selected vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    let ids = params.ids.split(',').map(|s| s.to_string()).collect();
    match client
        .delete_vouchers_by_ids(site.site_name.as_str(), ids)
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to delete selected vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn delete_expired_handler(
    Query(site): Query<SiteNameRequest>,
) -> Result<Json<DeleteResponse>, StatusCode> {
    debug!("Received request to delete expired vouchers");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client
        .delete_expired_vouchers(site.site_name.as_str())
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to delete expired vouchers: {}", e);
            Err(e)
        }
    }
}

pub async fn delete_expired_rolling_handler(
    Query(site): Query<SiteNameRequest>,
) -> Result<Json<DeleteResponse>, StatusCode> {
    debug!("Received request to delete expired rolling voucher");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    match client
        .delete_expired_rolling_vouchers(site.site_name.as_str())
        .await
    {
        Ok(response) => Ok(Json(response)),
        Err(e) => {
            error!("Failed to delete expired rolling voucher: {}", e);
            Err(e)
        }
    }
}

pub async fn health_check_handler() -> Json<HealthCheckResponse> {
    debug!("Received health check request");
    let response = HealthCheckResponse {
        status: "ok".to_string(),
    };
    Json(response)
}

pub async fn get_site_names_handler() -> Json<SiteNamesResponse> {
    debug!("Received site names request");
    let client = UNIFI_API.get().expect("UnifiAPI not initialized");
    let response = SiteNamesResponse {
        site_names: client.get_configured_sites_names(),
    };
    Json(response)
}
