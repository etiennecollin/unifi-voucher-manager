import Header from "@/components/Header";
import NotificationContainer from "@/components/notifications/NotificationContainer";
import Tabs from "@/components/tabs/Tabs";

export default function Home() {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col">
      <NotificationContainer />
      <Header />
      <Tabs />
    </div>
  );
}
