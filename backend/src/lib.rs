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
    pub unifi_has_valid_cert: bool,
    pub timezone: Tz,
}

impl Environment {
    pub fn try_new() -> Result<Self, String> {
        #[cfg(feature = "dotenv")]
        dotenvy::dotenv().map_err(|e| format!("Failed to load .env file: {e}"))?;

        let unifi_controller_url: String =
            env::var("UNIFI_CONTROLLER_URL").map_err(|e| format!("UNIFI_CONTROLLER_URL: {e}"))?;

        if !unifi_controller_url.starts_with("http://")
            && !unifi_controller_url.starts_with("https://")
        {
            return Err("UNIFI_CONTROLLER_URL must start with http:// or https://".to_string());
        }

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

        let unifi_has_valid_cert: bool = match env::var("UNIFI_HAS_VALID_CERT") {
            Ok(val) => {
                Self::parse_bool(&val).map_err(|e| format!("Invalid UNIFI_HAS_VALID_CERT: {e}"))?
            }
            Err(_) => true,
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
            unifi_has_valid_cert,
            timezone,
        })
    }

    fn parse_bool(s: &str) -> Result<bool, String> {
        match s.trim().to_lowercase().as_str() {
            "true" | "1" | "yes" => Ok(true),
            "false" | "0" | "no" => Ok(false),
            _ => Err(format!("Boolean value must be true or false, found: {s}")),
        }
    }
}
