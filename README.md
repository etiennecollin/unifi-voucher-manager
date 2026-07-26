# UniFi Voucher Manager

[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/etiennecollin/unifi-voucher-manager?sort=semver&label=Version&logo=docker&color=blue) ![Docker Pulls](https://img.shields.io/docker/pulls/etiennecollin/unifi-voucher-manager?label=Pulls&logo=docker&color=blue)](https://hub.docker.com/r/etiennecollin/unifi-voucher-manager)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/etiennecollin/unifi-voucher-manager/release_docker.yaml?label=Docker%20Build&logo=github) ![GitHub License](https://img.shields.io/github/license/etiennecollin/unifi-voucher-manager?label=License&logo=github&color=red)](https://github.com/etiennecollin/unifi-voucher-manager)

UVM is a modern, touch-friendly web application for managing WiFi vouchers on UniFi controllers.
Perfect for businesses, cafes, hotels, and home networks that need to provide guest WiFi access.

![WiFi Voucher Manager](./assets/view.png)

<!-- vim-markdown-toc GFM -->

- [✨ Features](#-features)
  - [🎫 Voucher Management & WiFi QR Code](#-voucher-management--wifi-qr-code)
  - [Kiosk Display](#kiosk-display)
  - [🎨 Modern Interface](#-modern-interface)
  - [🔧 Technical Features](#-technical-features)
- [🚀 Quick Start](#-quick-start)
  - [Using Docker Compose (Recommended)](#using-docker-compose-recommended)
  - [Without Docker](#without-docker)
- [⚙️ Configuration](#-configuration)
  - [Getting UniFi API Credentials](#getting-unifi-api-credentials)
  - [Rolling Vouchers and Kiosk Page](#rolling-vouchers-and-kiosk-page)
    - [How Rolling Vouchers Work](#how-rolling-vouchers-work)
  - [Custom SVG Logo](#custom-svg-logo)
  - [Environment Variables](#environment-variables)
- [🐛 Troubleshooting](#-troubleshooting)
  - [Common Issues](#common-issues)
  - [Getting Help](#getting-help)

<!-- vim-markdown-toc -->

## ✨ Features

### 🎫 Voucher Management & WiFi QR Code

- **Quick Create** - Generate guest vouchers with preset durations (1 hour to 1 week)
- **Custom Create** - Full control over voucher parameters:
  - Custom name
  - Duration (minutes to days)
  - Guest count limits
  - Data usage limits
  - Upload/download speed limits
- **Browse Vouchers** - Browse and search existing vouchers by name
- **Bulk Operations** - Select and delete multiple vouchers at once
- **Print Vouchers** - Print vouchers in either list or grid format; thermal printers friendly
- **Auto-cleanup** - Remove expired vouchers with a single click
- **QR Code** - Easily connect guests to your network
- **Rolling Vouchers** - Automatically generate a voucher for the next guest when the current one gets used

### Kiosk Display

The kiosk page (`/kiosk`) provides a guest-friendly interface displaying:

- **QR Code**: For easy network connection (if configured in [Environment Variables](#environment-variables))
- **Current Voucher**: The active rolling voucher code
- **Real-time Updates**: Automatically refreshes when the rolling voucher changes

### 🎨 Modern Interface

- **Touch-Friendly** – Optimized for tablet, mobile, and desktop
- **Dark/Light Mode** – Follows system preference, with manual override
- **Responsive Design** - Works seamlessly across all screen sizes
- **Smooth Animations** – Semantic transitions for polished UX
- **Real-time Notifications** - Instant feedback for all operations
- **Custom SVG Logo** - Display your own logo on the main page

### 🔧 Technical Features

- **Docker Ready** - Easy deployment with Docker Compose and included healthcheck
- **UniFi Integration** - Direct API connection to UniFi controllers
- **Secure Architecture** - Next.js (TypeScript + Tailwind CSS) frontend with an Axum-based Rust backend that handles all UniFi Controller communication, keeping credentials isolated from the user-facing UI

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Create the configuration files**
   ```bash
   # Download the compose file
   curl -o compose.yaml https://raw.githubusercontent.com/etiennecollin/unifi-voucher-manager/main/compose.yaml
   ```
2. **Configure your environment**
   - Set the required environment variables (see [Environment Variables](#environment-variables)) in the `compose.yaml` file.
3. **Start the application**
   ```bash
   docker compose up -d --force-recreate
   ```
4. **Access the interface**
   - Open your browser to `http://localhost:3000`.

### Without Docker

1. **Install the dependencies**
   - `rust >= 1.88.0`
   - `nodejs >= 24.3.0`
   - `npm >= 11.4.2`
2. **Clone the repository**
   ```bash
   git clone https://github.com/etiennecollin/unifi-voucher-manager
   ```
3. **Configure your environment**
   - In your shell, set the required environment variables (see [Environment Variables](#environment-variables))
     or set them in a `.env` file at the root of the repository and use the `dotenv` feature of the rust backend.
4. **Start the frontend and backend**

   ```bash
   # Backend (without using a .env file)
   cd backend && cargo run --release

   # Backend (using a .env file)
   cd backend && cargo run --release --features dotenv

   # Frontend (development)
   cd frontend && npm install && npm run dev

   # Frontend (release)
   cd frontend && npm ci && npm run build && npm run start
   ```

5. **Access the interface**
   - Open your browser to `http://localhost:3000`.

## ⚙️ Configuration

### Getting UniFi API Credentials

1. **Access your UniFi Controller**
2. **Navigate to Settings -> Control Plane -> Integration**
3. **Create a new API key** by giving it a name and an expiration.
4. **Find your Site ID** in the controller URL or on [unifi.ui.com](https://unifi.ui.com)

### Rolling Vouchers and Kiosk Page

Rolling vouchers provide a seamless way to automatically generate guest network access codes. When one voucher is used, a new one is automatically created for the next guest.

> [!IMPORTANT]
> **Setup Required**
>
> For rolling vouchers to work properly, you **must** configure your UniFi Hotspot:
>
> 1. Go to your UniFi Controller -> Insights -> Hotspot
> 2. Set the **Success Landing Page** to: `https://your-uvm-domain.com/welcome`, the `/welcome` page of UVM
>
> Without this configuration, vouchers **will not** automatically roll when guests connect.

> [!CAUTION]
> To restrict UVM access to the guest subnetwork users while still allowing access to `/welcome` page, set the `GUEST_SUBNETWORK` environment variable. This makes sure guests do not have access to other UVM pages, such as the voucher management interface (the root `/` page).
>
> Without this configuration, guests **will be able** to access the voucher management interface of UVM. This means they will be able to both create and delete vouchers by themselves.

#### How Rolling Vouchers Work

1. **Initial Setup**: Rolling vouchers are generated automatically when needed
2. **Guest Connection**: When a guest connects to your network, they're redirected to the `/welcome` page
3. **Automatic Rolling**: The welcome page triggers the creation of a new voucher for the next guest
   - Rolling vouchers are created with special naming conventions to distinguish them from manually created vouchers, making them easy to identify in your voucher management interface
4. **IP-Based Uniqueness**: Each IP address can only generate one voucher per session (prevents abuse from page reloads)
5. **Daily Maintenance**: To prevent clutter, expired rolling vouchers are automatically deleted at midnight (based on your configured `TIMEZONE` in [Environment Variables](#environment-variables))

### Custom SVG Logo

To display your own custom logo:

- If you are using docker, simply mount the SVG file in the container at `/app/frontend/public/logo.svg`. An example is in `./compose.yaml`.
  - The mount destination (including the file name) **CANNOT BE CHANGED**.
- If you are **not** using docker, place the SVG file in `./frontend/public/logo.svg`.
  - The path to the logo (including the file name) **CANNOT BE CHANGED**.

### Environment Variables

Make sure to configure the required variables. The optional variables generally have default values that you should not have to change.

> [!TIP]
>
> - To configure the WiFi QR code, you are required to configure the `WIFI_SSID` and `WIFI_PASSWORD` variables.
> - For proper timezone, make sure to set the `TIMEZONE` variable.

> [!IMPORTANT]
> Make sure to expand this section and read what the environment variables are doing. Some variables are **required**, they are placed at the top of the list.

- **`UNIFI_CONTROLLER_URL`: `string`** (_Required_)
  - **Description**: URL to your UniFi controller with protocol (`http://` or `https://`).
  - **Example**: `https://unifi.example.com` or `https://192.168.8.1:443`
- **`UNIFI_API_KEY`: `string`** (_Required_)
  - **Description**: API Key for your UniFi controller.
  - **Example**: `abc123...`

> [!WARNING]
> Improperly setting the `UNIFI_HAS_VALID_CERT` variable **will** prevent UVM from communicating with the UniFi controller.

- **`UNIFI_HAS_VALID_CERT`: `bool`** (_Optional_)
  - **Description**: Whether your UniFi controller uses a valid SSL certificate. This should normally be set to `true`, especially if you access the controller through a reverse proxy or another setup that provides trusted certificates (e.g., Let's Encrypt). **If you connect directly to the controller’s IP address (which usually serves a self-signed certificate), you may need to set this to `false`.**
  - **Example**: `true` (default)
- **`UNIFI_SITE_ID`: `string`** (_Optional_)
  - **Description**: Site ID of your UniFi controller. Using the value `default`, the backend will try to fetch the ID of the default site.
  - **Example**: `default` (default)

> [!CAUTION]
> To restrict UVM access to the guest subnetwork users while still allowing access to `/welcome` page, set the `GUEST_SUBNETWORK` variable. This makes sure guests do not have access to other UVM pages, such as the voucher management interface (the root `/` page).
>
> Without this configuration, guests **will be able** to access the voucher management interface of UVM. This means they will be able to both create and delete vouchers by themselves.

- **`GUEST_SUBNETWORK`: `IPv4 CIDR`** (_Optional_)
  - **Description**: Restrict guest subnetwork access to UVM while still permitting access to the `/welcome` page, which users are redirected to from the UniFi captive portal. For more details, see [Rolling Vouchers and Kiosk Page](#rolling-vouchers-and-kiosk-page).
  - **Example**: `10.0.5.0/24`
- **`FRONTEND_BIND_HOST`: `IPv4`** (_Optional_)
  - **Description**: Address on which the frontend server binds.
  - **Example**: `0.0.0.0` (default)
- **`FRONTEND_BIND_PORT`: `u16`** (_Optional_)
  - **Description**: Port on which the frontend server binds.
  - **Example**: `3000` (default)
- **`FRONTEND_TO_BACKEND_URL`: `URL`** (_Optional_)
  - **Description**: URL where the frontend will make its API requests to the backend.
  - **Example**: `http://127.0.0.1` (default)
- **`BACKEND_BIND_HOST`: `IPv4`** (_Optional_)
  - **Description**: Address on which the server binds.
  - **Example**: `127.0.0.1` (default)
- **`BACKEND_BIND_PORT`: `u16`** (_Optional_)
  - **Description**: Port on which the backend server binds.
  - **Example**: `8080` (default)
- **`BACKEND_LOG_LEVEL`: `trace|debug|info|warn|error`** (_Optional_)
  - **Description**: Log level of the Rust backend.
  - **Example**: `info`(default)
- **`TIMEZONE`: [`timezone identifier`](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)** (_Optional_)
  - **Description**: [Timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List) used to format dates and time.
  - **Example**: `UTC` (default)
- **`ROLLING_VOUCHER_DURATION_MINUTES`: `minutes`** (_Optional_)
  - **Description**: Number of minutes a rolling voucher will be valid for once activated.
  - **Example**: `480` (default)
- **`PURGE_ALL_EXPIRED_VOUCHERS`: `bool`** (_Optional_)
  - **Description**: When `true`, periodically purge all expired vouchers. When `false`, periodically only purge expired rolling vouchers.
  - **Example**: `false` (default)
- **`WIFI_SSID`: `string`** (_Optional_)
  - **Description**: WiFi SSID used for the QR code. (required for QR code to be generated)
  - **Example**: `My WiFi SSID`
- **`WIFI_PASSWORD`: `string`** (_Optional_)
  - **Description**: WiFi password used for the QR code. If the WiFi network does not have a password, set to an empty string `""`. (required for QR code to be generated)
  - **Example**: `My WiFi Password`
- **`WIFI_TYPE`: `WPA|WEP|nopass`** (_Optional_)
  - **Description**: WiFi security type used. Defaults to `WPA` if a password is provided and `nopass` otherwise.
  - **Example**: `WPA`
- **`WIFI_HIDDEN`: `bool`** (_Optional_)
  - **Description**: Whether the WiFi SSID is hidden or broadcasted.
  - **Example**: `false` (default)

## 🐛 Troubleshooting

### Common Issues

- **Vouchers not appearing or connection issue to UniFi controller**
  - Verify `UNIFI_CONTROLLER_URL` is correct and accessible
  - Verify `UNIFI_SITE_ID` matches your controller's site
  - Verify `UNIFI_HAS_VALID_CERT` is correct (depending on whether your `UNIFI_CONTROLLER_URL` has a valid SSL certificate or not)
  - Check if the UniFi controller is running and reachable (DNS issues?)
  - Ensure API key is valid
  - Ensure the site has the hotspot/guest portal enabled
- **Application won't start**
  - Check all environment variables are set
  - Verify Docker container has network access to UniFi controller
  - Check logs: `docker logs unifi-voucher-manager`
- **The WiFi QR code button is disabled**
  - Check the [Environment Variables](#environment-variables) section and make sure you configured the variables required for the WiFi QR code
  - Check the browser console for variable configuration errors (generally by hitting `F12` and going to the 'console' tab)

### Getting Help

- Check the [Issues](https://github.com/etiennecollin/unifi-voucher-manager/issues) page
- Create a new issue with detailed information about your problem
- Include relevant logs and environment details (redact sensitive information)
  - Run the container/backend with `BACKEND_LOG_LEVEL="debug"`
  - Include Docker logs: `docker logs unifi-voucher-manager`
  - Include browser logs: generally by hitting `F12` and going to the 'console' tab of your browser

---

**⭐ If this project helped you, please consider giving it a star!**
