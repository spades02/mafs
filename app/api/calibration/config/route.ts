import { NextResponse } from "next/server";
import { getActiveCalibrationConfig } from "@/lib/calibration/get-active-config";

export async function GET() {
  try {
    const config = await getActiveCalibrationConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("[CalibrationConfig] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch config" },
      { status: 500 }
    );
  }
}
