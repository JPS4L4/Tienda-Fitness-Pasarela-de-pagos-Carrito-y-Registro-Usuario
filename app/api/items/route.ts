import { NextResponse } from "next/server"
import { getItemsForUI } from "../../src/lib/items";

export async function GET() {
  const items = await getItemsForUI()
  return NextResponse.json(items)
}
