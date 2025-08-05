"use client";

import Modal from "@/components/modals/Modal";
import CopyCode from "@/components/utils/CopyCode";

type Props = {
  code: string;
  onClose: () => void;
};

export default function SuccessModal({ code: rawCode, onClose }: Props) {
  return (
    <Modal onClose={onClose} contentClassName="max-w-sm">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">
        Voucher Created!
      </h2>
      <CopyCode rawCode={rawCode} />
    </Modal>
  );
}
