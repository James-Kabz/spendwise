import { NextResponse } from "next/server";
import { CategoryKind } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.category.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    data.name = trimmed;
  }

  if (typeof body.kind === "string") {
    if (!Object.values(CategoryKind).includes(body.kind as CategoryKind)) {
      return NextResponse.json({ success: false, error: "Invalid kind" }, { status: 400 });
    }
    data.kind = body.kind;
  }

  if (typeof body.color === "string") {
    data.color = body.color;
  }

  if (typeof body.icon === "string") {
    data.icon = body.icon;
  }

  const category = await prisma.category.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({
    success: true,
    data: {
      category: {
        id: category.id,
        name: category.name,
        kind: category.kind,
        color: category.color,
        icon: category.icon,
        isActive: category.isActive,
      },
    },
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.category.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const category = await prisma.category.update({
    where: { id: existing.id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    data: {
      category: {
        id: category.id,
        isActive: category.isActive,
      },
    },
  });
}
