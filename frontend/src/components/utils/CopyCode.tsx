"use client";

import { copyText } from "@/utils/clipboard";
import { formatCode } from "@/utils/format";
import { notify } from "@/utils/notifications";
import { useState } from "react";

type Props = {
  rawCode: string;
  contentClassName?: string;
};

export default function CopyCode({ rawCode, contentClassName = "" }: Props) {
  const code = formatCode(rawCode);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyText(rawCode)) {
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

      <button onClick={handleCopy} className="btn-success w-2/3">
        {copied ? "Copied" : "Copy Code"}
      </button>
    </div>
  );
}
