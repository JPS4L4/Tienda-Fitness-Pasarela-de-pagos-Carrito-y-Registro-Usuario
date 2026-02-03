import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput, validateName, validatePhone } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      weightKg: true,
      heightCm: true,
      age: true,
      trainingTime: true,
      goal: true,
      equipmentAvailability: true,
      healthCondition: true,
      fitnessProfileCompleted: true,
    },
  });

  return NextResponse.json({ success: true, user });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  let body: {
    name?: string;
    phone?: string | null;
    weightKg?: number | null;
    heightCm?: number | null;
    age?: number | null;
    trainingTime?: string | null;
    goal?: string | null;
    equipmentAvailability?: string | null;
    healthCondition?: string | null;
    fitnessProfileCompleted?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "JSON inválido" }, { status: 400 });
  }

  const name = body.name ? sanitizeInput(body.name) : undefined;
  const phoneRaw = body.phone ? sanitizeInput(body.phone) : null;
  const phone = phoneRaw ? phoneRaw.replace(/[\s-]/g, "") : null;

  const weightKg = typeof body.weightKg === "number" ? body.weightKg : body.weightKg === null ? null : undefined;
  const heightCm = typeof body.heightCm === "number" ? body.heightCm : body.heightCm === null ? null : undefined;
  const age = typeof body.age === "number" ? body.age : body.age === null ? null : undefined;

  const trainingTime = body.trainingTime ? sanitizeInput(body.trainingTime) : body.trainingTime === null ? null : undefined;
  const goal = body.goal ? sanitizeInput(body.goal) : body.goal === null ? null : undefined;
  const equipmentAvailability = body.equipmentAvailability
    ? sanitizeInput(body.equipmentAvailability)
    : body.equipmentAvailability === null
      ? null
      : undefined;
  const healthCondition = body.healthCondition
    ? sanitizeInput(body.healthCondition)
    : body.healthCondition === null
      ? null
      : undefined;

  const fitnessProfileCompleted =
    typeof body.fitnessProfileCompleted === "boolean" ? body.fitnessProfileCompleted : undefined;

  if (name) {
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json({ success: false, message: nameValidation.error }, { status: 400 });
    }
  }

  if (phone) {
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json({ success: false, message: phoneValidation.error }, { status: 400 });
    }
  }

  if (weightKg !== undefined && weightKg !== null) {
    if (weightKg < 20 || weightKg > 400) {
      return NextResponse.json({ success: false, message: "El peso debe estar entre 20 y 400 kg" }, { status: 400 });
    }
  }

  if (heightCm !== undefined && heightCm !== null) {
    if (heightCm < 120 || heightCm > 250) {
      return NextResponse.json({ success: false, message: "La altura debe estar entre 120 y 250 cm" }, { status: 400 });
    }
  }

  if (age !== undefined && age !== null) {
    if (age < 10 || age > 100) {
      return NextResponse.json({ success: false, message: "La edad debe estar entre 10 y 100" }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        phone,
        ...(weightKg !== undefined ? { weightKg } : {}),
        ...(heightCm !== undefined ? { heightCm } : {}),
        ...(age !== undefined ? { age } : {}),
        ...(trainingTime !== undefined ? { trainingTime } : {}),
        ...(goal !== undefined ? { goal } : {}),
        ...(equipmentAvailability !== undefined ? { equipmentAvailability } : {}),
        ...(healthCondition !== undefined ? { healthCondition } : {}),
        ...(fitnessProfileCompleted !== undefined ? { fitnessProfileCompleted } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        weightKg: true,
        heightCm: true,
        age: true,
        trainingTime: true,
        goal: true,
        equipmentAvailability: true,
        healthCondition: true,
        fitnessProfileCompleted: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, message: "El teléfono ya está registrado" }, { status: 409 });
    }

    return NextResponse.json(
      { success: false, message: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
