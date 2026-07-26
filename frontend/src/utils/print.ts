import { PrintJob, PrintMode } from "@/types/print";
import { Voucher } from "@/types/voucher";
import { generateUUID } from "./uuid";

export function storePrintJob(vouchers: Voucher[], mode: PrintMode): string {
  const printJob: PrintJob = {
    vouchers: vouchers,
    mode: mode,
    createdAt: Date.now(),
  };

  const batchId = generateUUID();
  const currentKey = `print-job-${batchId}`;

  localStorage.setItem(currentKey, JSON.stringify(printJob));

  cleanupOldPrintJobs(currentKey);

  return batchId;
}

function cleanupOldPrintJobs(currentKey: string) {
  const MAX_AGE = 1000 * 60 * 60; // 1 hour
  const now = Date.now();

  Object.keys(localStorage)
    .filter((key) => key.startsWith("print-job-"))
    .filter((key) => key !== currentKey)
    .forEach((key) => {
      try {
        const stored = localStorage.getItem(key);

        if (!stored) {
          return;
        }

        const job = JSON.parse(stored) as PrintJob;

        if (now - job.createdAt > MAX_AGE) {
          localStorage.removeItem(key);
        }
      } catch {
        // Remove malformed print jobs
        localStorage.removeItem(key);
      }
    });
}
