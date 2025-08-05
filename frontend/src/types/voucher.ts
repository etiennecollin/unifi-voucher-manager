export interface Voucher {
  id: string;
  createdAt: string;
  name: string;
  code: string;
  authorizedGuestLimit?: number | null;
  authorizedGuestCount: number;
  activatedAt?: string | null;
  expiresAt?: string | null;
  expired: boolean;
  timeLimitMinutes: number;
  dataUsageLimitMBytes?: number | null;
  rxRateLimitKbps?: number | null;
  txRateLimitKbps?: number | null;
}

export interface VoucherCreateData
  extends Omit<
    Voucher,
    | "id"
    | "createdAt"
    | "code"
    | "authorizedGuestCount"
    | "activatedAt"
    | "expiresAt"
    | "expired"
  > {
  count: number;
}

export interface VoucherDeletedResponse {
  vouchersDeleted: number;
}

export interface VoucherCreatedResponse {
  vouchers: Voucher[];
}
