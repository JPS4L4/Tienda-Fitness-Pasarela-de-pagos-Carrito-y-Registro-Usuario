import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/nextAuth";

type FavoritePayload = {
  id: number | string;
  type: "item" | "plan";
};

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null;

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        item: true,
        plan: true,
      },
    });

    const mapped = favorites.map((fav) => {
      if (fav.item) {
        return {
          id: fav.item.id,
          type: "item" as const,
          title: fav.item.title,
          image: fav.item.images?.[0] ?? undefined,
          slug: fav.item.slug,
        };
      }
      if (fav.plan) {
        return {
          id: fav.plan.id,
          type: "plan" as const,
          title: fav.plan.title,
          image: fav.plan.image ?? undefined,
          slug: fav.plan.slug,
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ favorites: mapped });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return NextResponse.json({ error: "Error obteniendo favoritos" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : null;

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const incoming = Array.isArray(body?.favorites) ? body.favorites : [];
    const merge = request.nextUrl.searchParams.get("merge") === "true";

    const sanitized = incoming
      .map((fav: FavoritePayload) => ({
        id: Number(fav.id),
        type: fav.type,
      }))
      .filter((fav: { id: number; type: "item" | "plan" }) => fav.id && fav.type);

    let allFavorites = sanitized;

    if (merge) {
      const existing = await prisma.favorite.findMany({
        where: { userId },
        select: { productId: true, planId: true },
      });
      const mergedMap = new Map<string, FavoritePayload>();

      for (const fav of existing) {
        if (fav.productId) mergedMap.set(`item-${fav.productId}`, { id: fav.productId, type: "item" });
        if (fav.planId) mergedMap.set(`plan-${fav.planId}`, { id: fav.planId, type: "plan" });
      }

      for (const fav of sanitized) {
        mergedMap.set(`${fav.type}-${fav.id}`, fav);
      }

      allFavorites = Array.from(mergedMap.values());
    }

    await prisma.$transaction([
      prisma.favorite.deleteMany({ where: { userId } }),
      ...(allFavorites.length
        ? [
            prisma.favorite.createMany({
              data: allFavorites.map((fav: any) => ({
                userId,
                productId: fav.type === "item" ? Number(fav.id) : null,
                planId: fav.type === "plan" ? Number(fav.id) : null,
              })),
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando favoritos:", error);
    return NextResponse.json({ error: "Error actualizando favoritos" }, { status: 500 });
  }
}
