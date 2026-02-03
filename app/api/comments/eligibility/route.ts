import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ eligible: false, reason: "AUTH" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productIdParam = searchParams.get("productId");
    const planIdParam = searchParams.get("planId");

    if (!productIdParam && !planIdParam) {
      return NextResponse.json({ eligible: false, reason: "MISSING_TARGET" }, { status: 400 });
    }

    if (productIdParam && planIdParam) {
      return NextResponse.json({ eligible: false, reason: "INVALID_TARGET" }, { status: 400 });
    }

    const productId = productIdParam ? parseInt(productIdParam, 10) : null;
    const planId = planIdParam ? parseInt(planIdParam, 10) : null;
    if (productIdParam && !Number.isFinite(productId)) {
      return NextResponse.json({ eligible: false, reason: "INVALID_PRODUCT" }, { status: 400 });
    }
    if (planIdParam && !Number.isFinite(planId)) {
      return NextResponse.json({ eligible: false, reason: "INVALID_PLAN" }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        ...(productId ? { productId } : {}),
        ...(planId ? { planId } : {}),
      },
      select: { id: true },
    });

    if (existingReview) {
      return NextResponse.json({ eligible: false, reason: "ALREADY_REVIEWED" });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      select: { items: true, planId: true },
    });

    const hasPurchased = orders.some((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      if (productId) {
        return items.some((item: any) => {
          const itemProductId = item?.productId ?? item?.id;
          return Number(itemProductId) === productId;
        });
      }

      if (planId) {
        const directPlanMatch = Number(order.planId) === planId;
        if (directPlanMatch) return true;

        return items.some((item: any) => {
          const itemPlanId = item?.planId ?? item?.id;
          return Number(itemPlanId) === planId;
        });
      }

      return false;
    });

    if (!hasPurchased) {
      return NextResponse.json({ eligible: false, reason: "NOT_PURCHASED" });
    }

    return NextResponse.json({ eligible: true });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json({ eligible: false, reason: "SERVER" }, { status: 500 });
  }
}
