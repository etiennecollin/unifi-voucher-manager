import { getRuntimeConfig } from "@/utils/runtimeConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getRuntimeConfig());
}
