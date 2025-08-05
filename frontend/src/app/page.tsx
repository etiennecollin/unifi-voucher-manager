import Header from "@/components/Header";
import NotificationContainer from "@/components/notifications/NotificationContainer";
import Tabs from "@/components/tabs/Tabs";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-page">
      <NotificationContainer />
      <Header />
      <Tabs />
    </div>
  );
}
