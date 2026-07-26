import Modal from "@/components/modals/Modal";
import VoucherCode from "@/components/utils/VoucherCode";
import { PrintMode } from "@/types/print";
import { Voucher } from "@/types/voucher";
import { storePrintJob } from "@/utils/print";
import { useRouter } from "next/navigation";

type Props = {
  vouchers: Voucher[];
  onClose: () => void;
};

export default function SuccessModal({ vouchers, onClose }: Props) {
  const router = useRouter();

  const handlePrint = (mode: PrintMode) => {
    const batchId = storePrintJob(vouchers, mode);
    router.replace(`/print?batchId=${batchId}`);
  };

  if (vouchers.length == 0) {
    onClose();
  }

  const titleString =
    vouchers.length == 1
      ? "Voucher Created!"
      : `${vouchers.length} Vouchers Created!`;

  return (
    <Modal onClose={onClose} contentClassName="max-w-sm">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">
        {titleString}
      </h2>
      {vouchers.length == 1 && <VoucherCode voucher={vouchers[0]} />}
      {vouchers.length > 1 && (
        <div className="flex-center gap-3">
          <button onClick={() => handlePrint("grid")} className="btn-primary">
            Print New Vouchers (Grid)
          </button>
          <button onClick={() => handlePrint("list")} className="btn-primary">
            Print New Voucher (List)
          </button>
        </div>
      )}
    </Modal>
  );
}
