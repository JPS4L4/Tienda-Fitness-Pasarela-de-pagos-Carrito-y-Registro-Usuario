import { NextResponse } from "next/server"
import { getPlansForUI } from "../../src/lib/plans";

export async function GET() {
  const plans = await getPlansForUI()
  return NextResponse.json(plans)
}
