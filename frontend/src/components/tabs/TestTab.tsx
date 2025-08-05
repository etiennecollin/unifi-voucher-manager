"use client";

import { notify } from "@/utils/notifications";
import Spinner from "@/components/utils/Spinner";

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
    </div>
  );
}
