import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const categories = await prisma.category.findMany({
    where: { userId: user.id, isActive: true },
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
      })),
    },
  });
}
