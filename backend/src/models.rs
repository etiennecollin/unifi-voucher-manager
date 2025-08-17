#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Voucher {
    id: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    name: String,
    code: String,
    #[serde(rename = "authorizedGuestLimit")]
    authorized_guest_limit: Option<u64>,
    #[serde(rename = "authorizedGuestCount")]
    authorized_guest_count: u64,
    #[serde(rename = "activatedAt")]
    pub activated_at: Option<String>,
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<String>,
    expired: bool,
    #[serde(rename = "timeLimitMinutes")]
    time_limit_minutes: u64,
    #[serde(rename = "dataUsageLimitMBytes")]
    data_usage_limit_mbytes: Option<u64>,
    #[serde(rename = "rxRateLimitKbps")]
    rx_rate_limit_kbps: Option<u64>,
    #[serde(rename = "txRateLimitKbps")]
    tx_rate_limit_kbps: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateVoucherRequest {
    count: u32,
    name: String,
    #[serde(rename = "authorizedGuestLimit")]
    authorized_guest_limit: Option<u64>,
    #[serde(rename = "timeLimitMinutes")]
    time_limit_minutes: u64,
    #[serde(rename = "dataUsageLimitMBytes")]
    data_usage_limit_mbytes: Option<u64>,
    #[serde(rename = "rxRateLimitKbps")]
    rx_rate_limit_kbps: Option<u64>,
    #[serde(rename = "txRateLimitKbps")]
    tx_rate_limit_kbps: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVoucherResponse {
    #[serde(alias = "data")]
    pub vouchers: Vec<Voucher>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetVouchersResponse {
    pub data: Vec<Voucher>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteResponse {
    #[serde(rename = "vouchersDeleted")]
    pub vouchers_deleted: u32,
}

#[derive(Debug, Serialize)]
pub struct HealthCheckResponse {
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct DeleteRequest {
    pub ids: String,
}

#[derive(Debug, Deserialize)]
pub struct DetailsRequest {
    pub id: String,
}

#[derive(Debug, Deserialize)]
pub struct Site {
    pub id: String,
    #[serde(rename = "internalReference")]
    internal_reference: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct GetSitesResponse {
    offset: u64,
    limit: u32,
    count: u32,
    #[serde(rename = "totalCount")]
    total_count: u32,
    pub data: Vec<Site>,
}

#[derive(Debug, Deserialize)]
pub struct ErrorResponse {
    #[serde(rename = "statusCode")]
    pub status_code: u32,
    #[serde(rename = "statusName")]
    pub status_name: String,
    pub message: String,
    timestamp: String,
    #[serde(rename = "requestPath")]
    request_path: String,
    #[serde(rename = "requestId")]
    request_id: String,
}
