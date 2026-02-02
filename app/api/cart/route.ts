import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/nextAuth";
import { adaptItemToItemUI } from "@/app/src/adapters/itemAdapter";

const getUserId = (id?: string | null) => (id ? Number(id) : null);

export async function GET() {
  try {
    const session = await auth();
    const userId = getUserId(session?.user?.id as string | undefined);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
      where: { userId, status: "active" },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const items = cart.items.map((cartItem) => ({
      ...adaptItemToItemUI(cartItem.item),
      quantity: cartItem.quantity,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error obteniendo carrito:", error);
    return NextResponse.json({ error: "Error obteniendo carrito" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const userId = getUserId(session?.user?.id as string | undefined);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const incomingItems = Array.isArray(body?.items) ? body.items : [];

    const sanitizedItems = incomingItems
      .map((item: any) => ({
        id: Number(item.id),
        quantity: Number(item.quantity || 0),
      }))
      .filter((item: { id: number; quantity: number }) => item.id && item.quantity > 0);

    const merge = request.nextUrl.searchParams.get("merge") === "true";

    let cart = await prisma.cart.findFirst({
      where: { userId, status: "active" },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          status: "active",
        },
        include: { items: true },
      });
    }

    const quantityMap = new Map<number, number>();

    if (merge) {
      for (const existing of cart.items) {
        quantityMap.set(existing.productId, existing.quantity);
      }
    }

    for (const item of sanitizedItems) {
      const current = quantityMap.get(item.id) || 0;
      quantityMap.set(item.id, current + item.quantity);
    }

    const productIds = Array.from(quantityMap.keys());
    const products = await prisma.item.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    const priceMap = new Map<number, number>();
    for (const product of products) {
      const price = typeof product.price === "object" && "toNumber" in product.price
        ? product.price
        : Number(product.price);
      priceMap.set(product.id, price);
    }

    const itemsToSave = Array.from(quantityMap.entries())
      .filter(([productId]) => priceMap.has(productId))
      .map(([productId, quantity]) => ({
        cartId: cart.id,
        productId,
        quantity,
        price: priceMap.get(productId) || 0,
      }));

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      ...(itemsToSave.length
        ? [
            prisma.cartItem.createMany({
              data: itemsToSave,
            }),
          ]
        : []),
    ]);

    const updatedCart = await prisma.cart.findFirst({
      where: { id: cart.id },
      include: { items: { include: { item: true } } },
    });

    const responseItems = updatedCart?.items.map((cartItem) => ({
      ...adaptItemToItemUI(cartItem.item),
      quantity: cartItem.quantity,
    })) || [];

    return NextResponse.json({ items: responseItems });
  } catch (error) {
    console.error("Error actualizando carrito:", error);
    return NextResponse.json({ error: "Error actualizando carrito" }, { status: 500 });
  }
}
