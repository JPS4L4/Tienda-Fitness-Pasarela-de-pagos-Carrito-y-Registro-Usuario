// app/src/lib/products.ts
import { prisma } from "@/lib/prisma"
import { adaptProductToItemUI } from "../adapters/productAdapter"
import { ItemUI } from "../types/item";

export async function getProductsForUI() {
  const products = await prisma.product.findMany()

  return products.map(adaptProductToItemUI)
}

export async function getItemBySlug(slug: string): Promise<ItemUI | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) return null;

  return adaptProductToItemUI(product);
}