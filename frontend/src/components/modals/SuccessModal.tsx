"use client";

import Modal from "@/components/modals/Modal";
import VoucherCode from "@/components/utils/VoucherCode";
import { Voucher } from "@/types/voucher";

type Props = {
  voucher: Voucher;
  onClose: () => void;
};

export default function SuccessModal({ voucher, onClose }: Props) {
  return (
    <Modal onClose={onClose} contentClassName="max-w-sm">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">
        Voucher Created!
      </h2>
      <VoucherCode voucher={voucher} />
    </Modal>
  );
}
