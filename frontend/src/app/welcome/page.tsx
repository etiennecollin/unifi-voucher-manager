import { getRuntimeConfig } from "@/utils/runtimeConfig";
import WelcomeClient from "./WelcomeClient";

export default function WelcomePage() {
  const { WIFI_SSID } = getRuntimeConfig();

  return <WelcomeClient ssid={WIFI_SSID} />;
}
