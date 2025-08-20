"use client";

import SuccessModal from "@/components/modals/SuccessModal";
import { Voucher, VoucherCreateData } from "@/types/voucher";
import { api } from "@/utils/api";
import { map } from "@/utils/functional";
import { notify } from "@/utils/notifications";
import { useCallback, useState, FormEvent } from "react";

export default function CustomCreateTab() {
  const [loading, setLoading] = useState(false);
  const [newVoucher, setNewVoucher] = useState<Voucher | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const parseNumber = (x: FormDataEntryValue) =>
      x !== "" ? Number(x) : null;

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: VoucherCreateData = {
      count: Number(data.get("count")),
      name: String(data.get("name")),
      timeLimitMinutes: Number(data.get("duration")),
      authorizedGuestLimit: map(data.get("guests"), parseNumber),
      dataUsageLimitMBytes: map(data.get("data"), parseNumber),
      rxRateLimitKbps: map(data.get("download"), parseNumber),
      txRateLimitKbps: map(data.get("upload"), parseNumber),
    };

    try {
      const res = await api.createVoucher(payload);
      const voucher = res.vouchers?.[0];
      if (voucher) {
        setNewVoucher(voucher);
        form.reset();
      } else {
        notify(
          "Voucher created, but its data was found in response",
          "warning",
        );
      }
    } catch {
      notify("Failed to create voucher", "error");
    }
    setLoading(false);
  };

  const closeModal = useCallback(() => {
    setNewVoucher(null);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit} className="card max-w-lg mx-auto space-y-6">
        {[
          {
            label: "Number",
            name: "count",
            type: "number",
            props: { required: true, min: 1, max: 10, defaultValue: 1 },
          },
          {
            label: "Name",
            name: "name",
            type: "text",
            props: { required: true, defaultValue: "Custom Voucher" },
          },
          {
            label: "Duration (min)",
            name: "duration",
            type: "number",
            props: { required: true, min: 1, max: 525600, defaultValue: 1440 },
          },
          {
            label: "Guest Limit",
            name: "guests",
            type: "number",
            props: { min: 1, max: 5, placeholder: "Unlimited" },
          },
          {
            label: "Data Limit (MB)",
            name: "data",
            type: "number",
            props: { min: 1, max: 1048576, placeholder: "Unlimited" },
          },
          {
            label: "Download Kbps",
            name: "download",
            type: "number",
            props: { min: 2, max: 100000, placeholder: "Unlimited" },
          },
          {
            label: "Upload Kbps",
            name: "upload",
            type: "number",
            props: { min: 2, max: 100000, placeholder: "Unlimited" },
          },
        ].map(({ label, name, type, props }) => (
          <div key={name}>
            <label className="block font-medium mb-1">{label}</label>
            <input name={name} type={type} {...(props as any)} />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create Custom Voucher"}
        </button>
      </form>
      {newVoucher && <SuccessModal voucher={newVoucher} onClose={closeModal} />}
    </div>
  );
}
