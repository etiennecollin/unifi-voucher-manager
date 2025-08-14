import { getRuntimeConfig } from "@/utils/runtimeConfig";

// Derive the type from the array
const validWifiTypes = ["WPA", "WEP", "nopass"] as const;
type WifiType = (typeof validWifiTypes)[number];

export interface WifiConfig {
  ssid: string;
  password: string;
  type: WifiType;
  hidden?: boolean;
}

export function generateWifiConfig(): WifiConfig {
  const {
    WIFI_SSID: ssid,
    WIFI_PASSWORD: password,
    WIFI_TYPE: type,
    WIFI_HIDDEN: hidden,
  } = getRuntimeConfig();

  if (ssid == null) {
    throw "No SSID provided, use the environment variable WIFI_SSID to set one";
  }

  if (password == null) {
    throw 'No password provided, use the environment variable WIFI_PASSWORD to set one. If your network does not have a password, use WIFI_PASSWORD=""';
  }

  let type_parsed: WifiType;
  if (type == null) {
    if (password) {
      type_parsed = "WPA";
      console.log(
        `WiFi Configuration: type not provided, but password provided. Defaulting to 'type=${type_parsed}' `,
      );
    } else {
      type_parsed = "nopass";
      console.log(
        `WiFi Configuration: type and password not provided. Defaulting to 'type=${type_parsed}' `,
      );
    }
  } else {
    switch (type.trim().toLowerCase()) {
      case "wpa":
        type_parsed = "WPA";
        break;
      case "wep":
        type_parsed = "WEP";
        break;
      case "nopass":
        type_parsed = "nopass";
        break;
      default:
        throw `Invalid WiFi type provided: ${type}. Valid types: ${validWifiTypes.join(
          " | ",
        )}`;
    }
  }

  if (password && type_parsed === "nopass") {
    throw "Incoherent WiFi configuration: password provided, but type set to 'nopass'";
  } else if (!password && type_parsed !== "nopass") {
    throw "Incoherent WiFi configuration: password not provided, but type implies a password";
  }

  let hidden_parsed: boolean;
  if (hidden == null) {
    hidden_parsed = false;
    console.log(
      `WiFi Configuration: hidden state not provided, defaulting to 'hidden=${hidden_parsed}' `,
    );
  } else {
    switch (hidden.trim().toLowerCase()) {
      case "true":
      case "1":
        hidden_parsed = true;
        break;
      case "false":
      case "0":
        hidden_parsed = false;
        break;
      default:
        throw `Invalid WiFi hidden state provided: ${hidden}`;
    }
  }

  const config: WifiConfig = {
    ssid: ssid,
    password: password,
    type: type_parsed,
    hidden: hidden_parsed,
  };
  return config;
}

export function generateWiFiQRString(config: WifiConfig): string {
  const { ssid, password, type, hidden = false } = config;

  const encodedSSID = escapeWiFiString(ssid);
  const encodedPassword = escapeWiFiString(password);

  // Format: WIFI:[T:security;][S:ssid;][P:password;][H:hidden;];
  let qrString = "WIFI:";

  if (type !== "nopass") {
    qrString += `T:${type};`;
  }

  qrString += `S:${encodedSSID};`;

  if (type !== "nopass" && password) {
    qrString += `P:${encodedPassword};`;
  }

  qrString += `H:${hidden};`;

  qrString += ";";

  return qrString;
}

function escapeWiFiString(str: string): string {
  return str.replace(/([\\;:,"])/g, "\\$1");
}
