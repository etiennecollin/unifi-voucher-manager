import { getRuntimeConfig } from "@/utils/config";
import WelcomeClient from "./WelcomeClient";

export default function WelcomePage() {
  const { WIFI_SSID } = getRuntimeConfig();

  return <WelcomeClient ssid={WIFI_SSID} />;
}
