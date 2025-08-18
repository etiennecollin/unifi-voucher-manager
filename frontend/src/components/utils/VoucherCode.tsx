"use client";

import { copyText } from "@/utils/clipboard";
import { formatCode } from "@/utils/format";
import { notify } from "@/utils/notifications";
import { VoucherPrintWindow } from "@/components/utils/VoucherPrintContent";
import { useState } from "react";
import { Voucher } from "@/types/voucher";

type Props = {
  voucher: Voucher;
  contentClassName?: string;
};

export default function VoucherCode({ voucher, contentClassName = "" }: Props) {
  const code = formatCode(voucher.code);
  const [copied, setCopied] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handleCopy = async () => {
    if (await copyText(voucher.code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      notify("Code copied to clipboard!", "success");
    } else {
      notify("Failed to copy code", "error");
    }
  };

  return (
    <div className={`text-center ${contentClassName}`}>
      <div
        onClick={handleCopy}
        className="cursor-pointer mb-4 text-3xl voucher-code"
      >
        {code}
      </div>
      <div className="flex-center gap-3">
        <button onClick={handleCopy} className="btn-success">
          {copied ? "Copied" : "Copy Code"}
        </button>
        <button onClick={() => setPrinting(true)} className="btn-primary">
          Print Voucher
        </button>
        {printing && <VoucherPrintWindow voucher={voucher} />}
      </div>
    </div>
  );
}
