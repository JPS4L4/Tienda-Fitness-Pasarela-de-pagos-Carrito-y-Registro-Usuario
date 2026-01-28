import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adaptPlanToPlanUI } from "@/app/src/adapters/planAdapter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    // Buscar plan por ID numérico
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(planId) },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      );
    }

    // Adaptar el plan al formato UI
    const planUI = adaptPlanToPlanUI(plan);

    return NextResponse.json(planUI);
  } catch (error) {
    console.error("Error al obtener el plan:", error);
    return NextResponse.json(
      { error: "Error al obtener el plan" },
      { status: 500 }
    );
  }
}
