use std::{env, sync::OnceLock};

use chrono_tz::Tz;
use tracing::{error, info};

pub mod handlers;
pub mod models;
pub mod unifi_api;

const DEFAULT_BACKEND_BIND_HOST: &str = "127.0.0.1";
const DEFAULT_BACKEND_BIND_PORT: u16 = 8080;
const DEFAULT_UNIFI_SITE_ID: &str = "default";

pub static ENVIRONMENT: OnceLock<Environment> = OnceLock::new();

#[derive(Debug, Clone)]
pub struct Environment {
    pub unifi_controller_url: String,
    pub unifi_site_id: String,
    pub unifi_api_key: String,
    pub backend_bind_host: String,
    pub backend_bind_port: u16,
    pub timezone: Tz,
}

impl Environment {
    pub fn try_new() -> Result<Self, String> {
        let unifi_controller_url: String =
            env::var("UNIFI_CONTROLLER_URL").map_err(|e| format!("UNIFI_CONTROLLER_URL: {e}"))?;
        let unifi_api_key: String =
            env::var("UNIFI_API_KEY").map_err(|e| format!("UNIFI_API_KEY: {e}"))?;
        let unifi_site_id: String =
            env::var("UNIFI_SITE_ID").unwrap_or(DEFAULT_UNIFI_SITE_ID.to_owned());

        let backend_bind_host: String =
            env::var("BACKEND_BIND_HOST").unwrap_or(DEFAULT_BACKEND_BIND_HOST.to_owned());
        let backend_bind_port: u16 = match env::var("BACKEND_BIND_PORT") {
            Ok(port_str) => port_str
                .parse()
                .map_err(|e| format!("Invalid BACKEND_BIND_PORT: {e}"))?,
            Err(_) => DEFAULT_BACKEND_BIND_PORT,
        };

        let timezone: Tz = match env::var("TIMEZONE") {
            Ok(s) => match s.parse() {
                Ok(tz) => {
                    info!("Using timezone: {}", s);
                    tz
                }
                Err(_) => {
                    error!("Using UTC, could not parse timezone: {}", s);
                    Tz::UTC
                }
            },
            Err(_) => {
                info!("TIMEZONE environment variable not set, defaulting to UTC");
                Tz::UTC
            }
        };

        Ok(Self {
            unifi_controller_url,
            unifi_site_id,
            unifi_api_key,
            backend_bind_host,
            backend_bind_port,
            timezone,
        })
    }
}
