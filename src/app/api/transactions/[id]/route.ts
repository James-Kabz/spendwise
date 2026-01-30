import { NextResponse } from "next/server";
import { Prisma, TransactionDirection } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const transaction = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      transferToAccount: { select: { id: true, name: true } },
    },
  });

  if (!transaction) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      transaction: {
        id: transaction.id,
        direction: transaction.direction,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        occurredAt: transaction.occurredAt.toISOString(),
        note: transaction.note,
        account: transaction.account,
        category: transaction.category,
        transferToAccount: transaction.transferToAccount,
      },
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const direction = typeof body.direction === "string" ? body.direction : null;
  const amount = body.amount !== undefined ? new Prisma.Decimal(body.amount ?? 0) : undefined;
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : undefined;
  const occurredAt = body.occurredAt ? new Date(body.occurredAt) : undefined;
  const accountId = typeof body.accountId === "string" ? body.accountId : undefined;
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : undefined;
  const transferToAccountId =
    typeof body.transferToAccountId === "string" ? body.transferToAccountId : undefined;
  const note = typeof body.note === "string" ? body.note : undefined;

  const updateData: Prisma.TransactionUpdateInput = {
    ...(direction && Object.values(TransactionDirection).includes(direction as TransactionDirection)
      ? { direction: direction as TransactionDirection }
      : {}),
    ...(amount !== undefined ? { amount } : {}),
    ...(currency ? { currency } : {}),
    ...(occurredAt && !Number.isNaN(occurredAt.getTime()) ? { occurredAt } : {}),
    ...(accountId ? { accountId } : {}),
    ...(note !== undefined ? { note } : {}),
  };

  if (direction === "transfer") {
    updateData.categoryId = null;
    if (transferToAccountId) {
      updateData.transferToAccountId = transferToAccountId;
    }
  } else if (direction) {
    if (categoryId) {
      updateData.categoryId = categoryId;
    }
    updateData.transferToAccountId = null;
  } else {
    if (categoryId) {
      updateData.categoryId = categoryId;
    }
    if (transferToAccountId) {
      updateData.transferToAccountId = transferToAccountId;
    }
  }

  const transaction = await prisma.transaction.update({
    where: { id: existing.id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    data: {
      transaction: {
        id: transaction.id,
        direction: transaction.direction,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        occurredAt: transaction.occurredAt.toISOString(),
        note: transaction.note,
      },
    },
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id: existing.id } });

  return NextResponse.json({ success: true });
}
