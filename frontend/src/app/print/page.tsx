import { getRuntimeConfig } from "@/utils/config";
import PrintClient from "./PrintClient";

export default function PrintPage() {
  const { PRINT_CONFIG } = getRuntimeConfig();

  return <PrintClient config={PRINT_CONFIG} />;
}
