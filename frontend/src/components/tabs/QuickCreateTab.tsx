"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { VoucherCreateData } from "@/types/voucher";
import { api } from "@/utils/api";
import { notify } from "@/utils/notifications";
import { useCallback, useState, FormEvent } from "react";

export default function QuickCreateTab() {
  const [loading, setLoading] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: VoucherCreateData = {
      count: 1,
      name: String(data.get("name")),
      timeLimitMinutes: Number(data.get("duration")),
      authorizedGuestLimit: 1,
    };

    try {
      const res = await api.createVoucher(payload);
      const code = res.vouchers?.[0]?.code;
      if (code) {
        setNewCode(code);
        form.reset();
      } else {
        notify("Voucher created, but code not found in response", "warning");
      }
    } catch {
      notify("Failed to create voucher", "error");
    }
    setLoading(false);
  };

  const closeModal = useCallback(() => {
    setNewCode(null);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit} className="card max-w-lg mx-auto space-y-6">
        <label className="block font-medium mb-1">Duration</label>
        <select name="duration" defaultValue="1440" required>
          <option value={60}>1 Hour</option>
          <option value={240}>4 Hours</option>
          <option value={1440}>24 Hours</option>
          <option value={4320}>3 Days</option>
          <option value={10080}>1 Week</option>
        </select>

        <label className="block font-medium mb-1">Name</label>
        <input name="name" defaultValue="Quick Voucher" required />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create Voucher"}
        </button>
      </form>

      {newCode && <SuccessModal code={newCode} onClose={closeModal} />}
    </div>
  );
}
