"use client";

import { notify } from "@/utils/notifications";
import Spinner from "@/components/utils/Spinner";
import VoucherCard from "../VoucherCard";

export default function TestTab() {
  const sendInfo = () => notify("This is an info notification", "info");
  const sendSuccess = () => notify("Operation succeeded!", "success");
  const sendError = () => notify("Something went wrong!", "error");
  const sendMultiple = () => {
    notify("First message", "info");
    setTimeout(() => notify("Second message", "success"), 500);
    setTimeout(() => notify("Third message", "error"), 1000);
  };

  return (
    <div className="flex-center flex-col space-y-6">
      <div className="card max-w-lg space-y-4">
        <h2 className="text-lg font-semibold text-primary">
          Notification Tester
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={sendInfo} className="btn-primary">
            Send Info
          </button>
          <button onClick={sendSuccess} className="btn-success">
            Send Success
          </button>
          <button onClick={sendError} className="btn-danger">
            Send Error
          </button>
          <button onClick={sendMultiple} className="btn-primary">
            Send Multiple
          </button>
        </div>
      </div>
      <div className="card max-w-lg">
        <h2 className="text-lg font-semibold text-primary">Spinner Example</h2>
        <Spinner />
      </div>

      <div className="flex-center flex-row gap-4 w-full">
        <VoucherCard
          key={123}
          voucher={{
            id: "abc123",
            createdAt: "2025-12-31",
            name: "test voucher",
            code: "1234567890",
            authorizedGuestCount: 0,
            expired: false,
            timeLimitMinutes: 1440,
          }}
          editMode={false}
          selected={false}
        />
        <VoucherCard
          key={456}
          voucher={{
            id: "abc123",
            createdAt: "2025-12-31",
            name: "test voucher",
            code: "1234567890",
            authorizedGuestCount: 0,
            expired: false,
            timeLimitMinutes: 1440,
          }}
          editMode={true}
          selected={true}
        />
        <VoucherCard
          key={789}
          voucher={{
            id: "abc123",
            createdAt: "2025-12-31",
            name: "test voucher",
            code: "1234567890",
            authorizedGuestCount: 1,
            expired: true,
            timeLimitMinutes: 1440,
            expiresAt: "2025-12-31",
          }}
          editMode={true}
          selected={false}
        />
      </div>
    </div>
  );
}
