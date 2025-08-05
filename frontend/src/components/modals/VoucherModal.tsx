"use client";

import Modal from "@/components/modals/Modal";
import Spinner from "@/components/utils/Spinner";
import { api } from "@/utils/api";
import { useEffect, useRef, useState } from "react";
import {
  formatBytes,
  formatDate,
  formatDuration,
  formatGuestUsage,
  formatSpeed,
} from "@/utils/format";
import CopyCode from "@/components/utils/CopyCode";
import { Voucher } from "@/types/voucher";

type Props = {
  voucher: Voucher;
  onClose: () => void;
};

export default function VoucherModal({ voucher, onClose }: Props) {
  const [details, setDetails] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if we haven't already fetched this voucher's details
    if (voucher.id === lastFetchedId.current) {
      return;
    }

    (async () => {
      setLoading(true);
      setError(false);
      lastFetchedId.current = voucher.id;

      try {
        const res = await api.getVoucherDetails(voucher.id);
        setDetails(res);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [voucher.id]);

  const rawCode = details?.code ?? voucher.code;

  return (
    <Modal onClose={onClose}>
      <CopyCode rawCode={rawCode} contentClassName="mb-8" />
      {loading ? (
        <Spinner />
      ) : error || details == null ? (
        <div className="card text-status-danger text-center">
          Failed to load detailed information
        </div>
      ) : (
        <div className="space-y-4">
          {(
            [
              ["Status", details.expired ? "Expired" : "Active"],
              ["Name", details.name || "No note"],
              ["Created", formatDate(details.createdAt)],
              ...(details.activatedAt
                ? [["Activated", formatDate(details.activatedAt)]]
                : []),
              ...(details.expiresAt
                ? [["Expires", formatDate(details.expiresAt)]]
                : []),
              ["Duration", formatDuration(details.timeLimitMinutes)],
              [
                "Guest Usage",
                formatGuestUsage(
                  details.authorizedGuestCount,
                  details.authorizedGuestLimit,
                ),
              ],
              [
                "Data Limit",
                details.dataUsageLimitMBytes
                  ? formatBytes(details.dataUsageLimitMBytes * 1024 * 1024)
                  : "Unlimited",
              ],
              ["Download Speed", formatSpeed(details.rxRateLimitKbps)],
              ["Upload Speed", formatSpeed(details.txRateLimitKbps)],
              ["ID", details.id],
            ] as [string, any][]
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between items-center p-4 bg-interactive border border-subtle rounded-xl space-x-4"
            >
              <span className="font-semibold text-primary">{label}:</span>
              <span className="text-secondary">{value}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
