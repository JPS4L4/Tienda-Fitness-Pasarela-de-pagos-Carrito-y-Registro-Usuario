import { NextResponse } from "next/server"
import { getProductsForUI } from "../../src/lib/products";

export async function GET() {
  const products = await getProductsForUI()
  return NextResponse.json(products)
}
