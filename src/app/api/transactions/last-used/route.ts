import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const last = await prisma.transaction.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { accountId: true, categoryId: true },
  });

  return NextResponse.json({
    success: true,
    data: {
      accountId: last?.accountId ?? null,
      categoryId: last?.categoryId ?? null,
    },
  });
}
