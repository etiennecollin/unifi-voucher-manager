use chrono::DateTime;
use chrono_tz::Tz;
use reqwest::{Client, ClientBuilder, StatusCode};
use std::{sync::OnceLock, time::Duration};
use tracing::{error, info, warn};

use crate::{
    ENVIRONMENT, Environment,
    models::{
        CreateVoucherRequest, CreateVoucherResponse, DeleteResponse, ErrorResponse,
        GetSitesResponse, GetVouchersResponse, Voucher,
    },
};

const UNIFI_API_ROUTE: &str = "proxy/network/integration/v1/sites";
const DATE_TIME_FORMAT: &str = "%Y-%m-%d %H:%M:%S";

pub static UNIFI_API: OnceLock<UnifiAPI> = OnceLock::new();

enum RequestType {
    Get,
    Post,
    Delete,
}

#[derive(Debug, Clone)]
pub struct UnifiAPI<'a> {
    client: Client,
    sites_api_url: String,
    voucher_api_url: String,
    environment: &'a Environment,
}

impl<'a> UnifiAPI<'a> {
    pub async fn new() -> Result<Self, ()> {
        let environment: &Environment = ENVIRONMENT.get().expect("Environment not set");

        let mut headers = reqwest::header::HeaderMap::with_capacity(2);
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/json"),
        );
        headers.insert(
            "X-API-Key",
            environment
                .unifi_api_key
                .parse()
                .expect("Could not parse API Key"),
        );

        let client = ClientBuilder::new()
            .timeout(Duration::from_secs(30))
            .connect_timeout(Duration::from_secs(10))
            .default_headers(headers)
            .use_rustls_tls()
            .build()
            .expect("Failed to build UniFi reqwest client");

        let mut unifi_api = Self {
            client,
            sites_api_url: format!("{}/{}", environment.unifi_controller_url, UNIFI_API_ROUTE),
            voucher_api_url: String::new(),
            environment,
        };

        let site_id = match environment.unifi_site_id.to_lowercase().as_str() {
            "default" => {
                info!("Trying to fetch the default site ID from UniFi controller...");
                let id = match unifi_api.get_default_site_id().await {
                    Ok(id) => id,
                    Err(e) => {
                        error!("Failed to fetch default site ID: {}", e);
                        return Err(());
                    }
                };
                info!("Default site ID found: {}", id);
                id
            }
            _ => environment.unifi_site_id.clone(),
        };

        unifi_api.voucher_api_url =
            format!("{}/{}/hotspot/vouchers", unifi_api.sites_api_url, site_id);

        Ok(unifi_api)
    }

    async fn make_request<
        T: serde::ser::Serialize + Sized,
        U: serde::de::DeserializeOwned + Sized,
    >(
        &self,
        request_type: RequestType,
        url: &str,
        body: Option<&T>,
    ) -> Result<U, StatusCode> {
        // Make request
        let response_result = match request_type {
            RequestType::Get => self.client.get(url).send().await,
            RequestType::Post => {
                if let Some(b) = body {
                    self.client.post(url).json(b).send().await
                } else {
                    error!("Body is required for POST requests");
                    return Err(StatusCode::BAD_REQUEST);
                }
            }
            RequestType::Delete => self.client.delete(url).send().await,
        };

        // Check if the request was successful
        let response = match response_result {
            Ok(resp) => resp,
            Err(e) => {
                let status = e.status().unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
                error!("Request failed with status {}: {}", status, e.without_url());
                return Err(status);
            }
        };

        // The request was successful, now check the status code
        let clean_response = match response.error_for_status_ref().is_ok() {
            true => response,
            false => {
                let status = response.status();
                error!("Request failed with status: {}", status);

                if let Ok(body) = response.json::<ErrorResponse>().await {
                    error!("Error response message: {}", body.message);
                } else {
                    error!("Failed to parse error response body");
                }
                return Err(status);
            }
        };

        // It's a successful response, now parse the JSON
        clean_response.json::<U>().await.map_err(|e| {
            error!("Failed to parse response JSON: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })
    }

    fn process_voucher(&self, voucher: &mut Voucher) {
        voucher.created_at = format_unifi_date(&voucher.created_at, &self.environment.timezone);
        if let Some(activated_at) = &mut voucher.activated_at {
            *activated_at = format_unifi_date(activated_at, &self.environment.timezone);
        }
        if let Some(expires_at) = &mut voucher.expires_at {
            *expires_at = format_unifi_date(expires_at, &self.environment.timezone);
        }
    }

    fn process_vouchers(&self, mut vouchers: Vec<Voucher>) -> Vec<Voucher> {
        vouchers.iter_mut().for_each(|voucher| {
            self.process_voucher(voucher);
        });
        vouchers
    }

    async fn get_default_site_id(&self) -> Result<String, StatusCode> {
        let url = format!(
            "{}?filter=or(internalReference.eq('default'),name.eq('Default'))",
            self.sites_api_url
        );
        let result: GetSitesResponse = self
            .make_request(RequestType::Get, &url, None::<&()>)
            .await?;

        if result.data.is_empty() {
            error!("No default site found on the UniFi controller");
            error!(
                "Please manually set the `UNIFI_SITE_ID` environment variable to a valid site ID."
            );
            return Err(StatusCode::NOT_FOUND);
        }

        let id = result.data[0].id.to_owned();

        Ok(id)
    }

    pub async fn get_all_vouchers(&self) -> Result<GetVouchersResponse, StatusCode> {
        let mut result: GetVouchersResponse = self
            .make_request(RequestType::Get, &self.voucher_api_url, None::<&()>)
            .await?;
        result.data = self.process_vouchers(result.data);
        Ok(result)
    }

    pub async fn get_newest_voucher(&self) -> Result<Option<Voucher>, StatusCode> {
        let response = self.get_all_vouchers().await?;

        if response.data.is_empty() {
            warn!("No vouchers found when fetching the newest voucher");
            return Err(StatusCode::NOT_FOUND);
        }

        // Find the newest voucher
        let newest = response
            .data
            .iter()
            .max_by_key(|voucher| {
                DateTime::parse_from_str(&voucher.created_at, DATE_TIME_FORMAT)
                    .unwrap_or_else(|_| DateTime::UNIX_EPOCH.fixed_offset())
            })
            .cloned();

        Ok(newest)
    }

    pub async fn get_voucher_details(&self, id: String) -> Result<Voucher, StatusCode> {
        let url = format!("{}/{}", self.voucher_api_url, id);

        let mut result: Voucher = self
            .make_request(RequestType::Get, &url, None::<&()>)
            .await?;

        self.process_voucher(&mut result);
        Ok(result)
    }

    pub async fn create_voucher(
        &self,
        request: CreateVoucherRequest,
    ) -> Result<CreateVoucherResponse, StatusCode> {
        let mut result: CreateVoucherResponse = self
            .make_request(RequestType::Post, &self.voucher_api_url, Some(&request))
            .await?;
        result.vouchers = self.process_vouchers(result.vouchers);
        Ok(result)
    }

    pub async fn delete_vouchers_by_ids(
        &self,
        ids: Vec<String>,
    ) -> Result<DeleteResponse, StatusCode> {
        if ids.is_empty() || (ids.len() == 1 && ids[0].is_empty()) {
            return Ok(DeleteResponse {
                vouchers_deleted: 0,
            });
        }

        let filter_expr = ids
            .iter()
            .map(|id| format!("id.eq({id})"))
            .collect::<Vec<_>>()
            .join(",");

        let url = if ids.len() == 1 {
            format!("{}?filter={}", self.voucher_api_url, filter_expr)
        } else {
            format!("{}?filter=or({})", self.voucher_api_url, filter_expr)
        };

        self.make_request(RequestType::Delete, &url, None::<&()>)
            .await
    }

    pub async fn delete_expired_vouchers(&self) -> Result<DeleteResponse, StatusCode> {
        let url = format!("{}?filter=expired.eq(true)", self.voucher_api_url);
        self.make_request(RequestType::Delete, &url, None::<&()>)
            .await
    }
}

fn format_unifi_date(rfc3339_string: &str, target_timezone: &Tz) -> String {
    match DateTime::parse_from_rfc3339(rfc3339_string) {
        Ok(dt) => {
            let local_time = dt.with_timezone(target_timezone);
            local_time.format(DATE_TIME_FORMAT).to_string()
        }
        Err(_) => {
            error!("Failed to parse RFC3339 date: {}", rfc3339_string);
            rfc3339_string.to_string()
        }
    }
}
