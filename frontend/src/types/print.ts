import { Voucher } from "./voucher";

export type PrintMode = "list" | "grid";

export type PrintJob = {
  vouchers: Voucher[];
  mode: PrintMode;
  createdAt: number;
};

export type PrintConfig = {
  duration: boolean;
  maxGuests: boolean;
  dataUsageLimit: boolean;
  rxRateLimit: boolean;
  txRateLimit: boolean;
  id: boolean;
  printTime: boolean;
};
