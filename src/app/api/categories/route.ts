import { NextResponse } from "next/server";
import { Category, CategoryKind } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const parseActiveFilter = (value: string | null) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const activeFilter = parseActiveFilter(searchParams.get("active"));
  const search = searchParams.get("search");

  const categories : Category[] = await prisma.category.findMany({
    where: {
      userId: user.id,
      ...(kind && Object.values(CategoryKind).includes(kind as CategoryKind)
        ? { kind: kind as CategoryKind }
        : {}),
      ...(typeof activeFilter === "boolean" ? { isActive: activeFilter } : {}),
      ...(search
        ? {
            name: { contains: search, mode: "insensitive" },
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        kind: category.kind,
        color: category.color,
        icon: category.icon,
        isActive: category.isActive,
      })),
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const kind = typeof body.kind === "string" ? body.kind : null;
  const color = typeof body.color === "string" ? body.color : null;
  const icon = typeof body.icon === "string" ? body.icon : null;

  if (!name) {
    return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
  }

  if (!kind || !Object.values(CategoryKind).includes(kind as CategoryKind)) {
    return NextResponse.json({ success: false, error: "Invalid kind" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      userId: user.id,
      name,
      kind: kind as CategoryKind,
      color,
      icon,
    },
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
