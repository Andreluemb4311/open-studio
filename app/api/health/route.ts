import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/storage/db";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "open-studio-daemon",
    mode: "local-next-daemon",
    storageDir: DATA_DIR,
    capabilities: ["text", "image", "package"],
    timestamp: new Date().toISOString(),
  });
}
