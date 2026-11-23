"use client";

import Modal from "@/components/modals/Modal";
import Spinner from "@/components/utils/Spinner";
import { api } from "@/utils/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatBytes,
  formatDuration,
  formatGuestUsage,
  formatSpeed,
  formatStatus,
} from "@/utils/format";
import VoucherCode from "@/components/utils/VoucherCode";
import { Voucher } from "@/types/voucher";
import { TriState } from "@/types/state";

type Props = {
  voucher: Voucher;
  onClose: () => void;
};

export default function VoucherModal({ voucher, onClose }: Props) {
  const [details, setDetails] = useState<Voucher | null>(null);
  const [state, setState] = useState<TriState>("loading");
  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if we haven't already fetched this voucher's details
    if (voucher.id === lastFetchedId.current) {
      return;
    }

    (async () => {
      setState("loading");
      lastFetchedId.current = voucher.id;

      try {
        const res = await api.getVoucherDetails(voucher.id);
        setDetails(res);
        setState("ok");
      } catch {
        setState("error");
      }
    })();
  }, [voucher.id]);

  const renderContent = useCallback(() => {
    switch (state) {
      case "loading":
        return <Spinner />;
      case "error":
        return (
          <div className="card text-status-danger text-center">
            Failed to load detailed information
          </div>
        );
      case "ok":
        if (details == null) {
          return;
        }
        return (
          <div className="space-y-4">
            {(
              [
                ["Status", formatStatus(details.expired, details.activatedAt)],
                ["Name", details.name || "No note"],
                ["Created", details.createdAt],
                ...(details.activatedAt
                  ? [["Activated", details.activatedAt]]
                  : []),
                ...(details.expiresAt ? [["Expires", details.expiresAt]] : []),
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
                className="flex-center-between p-4 bg-interactive border border-subtle rounded-xl space-x-4"
              >
                <span className="font-semibold text-primary">{label}:</span>
                <span className="text-secondary">{value}</span>
              </div>
            ))}
          </div>
        );
    }
  }, [state, details]);

  return (
    <Modal onClose={onClose}>
      <VoucherCode voucher={voucher} contentClassName="mb-8" />
      {renderContent()}
    </Modal>
  );
}
