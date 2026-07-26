import Header from "@/components/Header";
import NotificationContainer from "@/components/notifications/NotificationContainer";
import Tabs from "@/components/tabs/Tabs";
import { getRuntimeConfig } from "@/utils/config";

export default function Home() {
  const { IS_LOGO_INVERTIBLE } = getRuntimeConfig();
  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      <NotificationContainer />
      <Header isLogoInvertible={IS_LOGO_INVERTIBLE} />
      <Tabs />
    </div>
  );
}
