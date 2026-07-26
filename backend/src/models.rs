#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Voucher {
    pub id: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub name: String,
    pub code: String,
    #[serde(rename = "authorizedGuestLimit")]
    pub authorized_guest_limit: Option<u64>,
    #[serde(rename = "authorizedGuestCount")]
    pub authorized_guest_count: u64,
    #[serde(rename = "activatedAt")]
    pub activated_at: Option<String>,
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<String>,
    pub expired: bool,
    #[serde(rename = "timeLimitMinutes")]
    pub time_limit_minutes: u64,
    #[serde(rename = "dataUsageLimitMBytes")]
    pub data_usage_limit_mbytes: Option<u64>,
    #[serde(rename = "rxRateLimitKbps")]
    pub rx_rate_limit_kbps: Option<u64>,
    #[serde(rename = "txRateLimitKbps")]
    pub tx_rate_limit_kbps: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VouchersCreateRequest {
    pub count: u32,
    pub name: String,
    #[serde(rename = "authorizedGuestLimit")]
    pub authorized_guest_limit: Option<u64>,
    #[serde(rename = "timeLimitMinutes")]
    pub time_limit_minutes: u64,
    #[serde(rename = "dataUsageLimitMBytes")]
    pub data_usage_limit_mbytes: Option<u64>,
    #[serde(rename = "rxRateLimitKbps")]
    pub rx_rate_limit_kbps: Option<u64>,
    #[serde(rename = "txRateLimitKbps")]
    pub tx_rate_limit_kbps: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VouchersCreateResponse {
    #[serde(alias = "data")]
    pub vouchers: Vec<Voucher>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VouchersGetResponse {
    pub offset: u64,
    pub limit: u32,
    pub count: u32,
    #[serde(rename = "totalCount")]
    pub total_count: u64,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct VouchersGetRequest {
    pub offset: u32,
    pub limit: u32,
    pub filter: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VouchersDeleteRequest {
    pub ids: String,
}

#[derive(Debug, Deserialize)]
pub struct VoucherDetailsRequest {
    pub id: String,
}

#[derive(Debug, Deserialize)]
pub struct Site {
    pub id: String,
    #[serde(rename = "internalReference")]
    pub internal_reference: String,
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
    pub status_code: i32,
    #[serde(rename = "statusName")]
    pub status_name: String,
    pub message: String,
    timestamp: String,
    #[serde(rename = "requestPath")]
    request_path: String,
    #[serde(rename = "requestId")]
    request_id: String,
}
