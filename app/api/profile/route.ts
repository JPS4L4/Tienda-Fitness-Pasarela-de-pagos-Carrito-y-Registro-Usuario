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
    },
  });

  return NextResponse.json({ success: true, user });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  let body: { name?: string; phone?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "JSON inválido" }, { status: 400 });
  }

  const name = body.name ? sanitizeInput(body.name) : undefined;
  const phoneRaw = body.phone ? sanitizeInput(body.phone) : null;
  const phone = phoneRaw ? phoneRaw.replace(/[\s-]/g, "") : null;

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

  try {
    const updated = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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
