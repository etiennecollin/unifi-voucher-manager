use chrono::Utc;
use chrono_tz::Tz;
use tokio::time::sleep;
use tracing::{error, info};

use crate::handlers::{delete_expired_handler, delete_expired_rolling_handler};

pub async fn run_daily_purge(timezone: Tz, purge_all: bool) {
    let voucher_desc = if purge_all {
        "expired vouchers"
    } else {
        "expired rolling vouchers"
    };

    loop {
        let now = Utc::now().with_timezone(&timezone);
        let next_midnight = now
            .date_naive()
            .succ_opt()
            .expect("Next day is not representable")
            .and_hms_opt(0, 0, 0)
            .expect("Could not get next midnight")
            .and_local_timezone(timezone)
            .latest()
            .expect("Could not convert next midnight time to local timezone");

        let delta = next_midnight - now;
        let duration = delta
            .to_std()
            .expect("Duration to next midnight is less than 0");

        info!(
            "Next purge of {} at midnight ({}), in {} hours and {} minutes...",
            voucher_desc,
            timezone,
            delta.num_hours(),
            delta.num_minutes() % 60
        );

        sleep(duration).await;

        info!("Purging {}...", voucher_desc);

        let result = if purge_all {
            delete_expired_handler().await
        } else {
            delete_expired_rolling_handler().await
        };
        match result {
            Ok(response) => info!("Deleted {} {}", response.vouchers_deleted, voucher_desc),
            Err(code) => error!("Failed to delete {}: {}", voucher_desc, code),
        };
    }
}
