import { Voucher } from "@/types/voucher";
import { formatCode, formatDuration, formatGuestUsage } from "@/utils/format";
import { memo, useCallback } from "react";

type Props = {
  voucher: Voucher;
  selected: boolean;
  editMode: boolean;
  onClick?: (v: Voucher) => void;
};

const VoucherCard = ({ voucher, selected, editMode, onClick }: Props) => {
  const statusClass = voucher.expired
    ? "bg-status-danger text-status-danger"
    : "bg-status-success text-status-success";
  const onClickHandler = useCallback(
    () => onClick?.(voucher),
    [voucher, onClick],
  );

  return (
    <div
      onClick={onClickHandler}
      className={`card card-interactive
        ${selected ? "border-accent" : ""}
        ${editMode ? "relative" : ""}`}
    >
      {editMode && (
        <div className="absolute top-3 right-3 z-1000">
          <div
            className={`w-6 h-6 rounded-full border-2 flex-center
            ${selected ? "selected-accent" : "unselected-neutral"}`}
          >
            {selected && <div className="w-3 h-3 bg-white rounded-full" />}
          </div>
        </div>
      )}

      {/* Primary Information */}
      <div className="mb-2">
        <div className="text-xl voucher-code">{formatCode(voucher.code)}</div>
        <div className="text-lg font-semibold truncate">{voucher.name}</div>
      </div>

      <div className="space-y-1 text-sm text-secondary">
        <div className="flex justify-between">
          <span>Guests Used:</span>
          <span>
            {formatGuestUsage(
              voucher.authorizedGuestCount,
              voucher.authorizedGuestLimit,
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Session Time:</span>
          <span>{formatDuration(voucher.timeLimitMinutes)}</span>
        </div>

        {voucher.activatedAt && (
          <div className="flex justify-between">
            <span>First Used:</span>
            <span className="text-xs">{voucher.activatedAt}</span>
          </div>
        )}

        <div className="flex-center-between">
          <span
            className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase ${statusClass}`}
          >
            {voucher.expired ? "Expired" : "Active"}
          </span>
          {voucher.expiresAt && (
            <span className="text-xs">Expires: {voucher.expiresAt}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(VoucherCard);
