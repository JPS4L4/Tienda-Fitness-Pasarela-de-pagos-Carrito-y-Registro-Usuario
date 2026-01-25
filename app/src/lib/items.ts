// app/src/lib/products.ts
import { prisma } from "@/lib/prisma"
import { adaptItemToItemUI } from "../adapters/itemAdapter"
import { ItemUI } from "../types/item";

export async function getItemsForUI() {
  const items = await prisma.item.findMany()

  return items.map(adaptItemToItemUI)
}

export async function getItemBySlug(slug: string): Promise<ItemUI | null> {
  const item = await prisma.item.findUnique({
    where: { slug },
  });

  if (!item) return null;

  return adaptItemToItemUI(item);
}