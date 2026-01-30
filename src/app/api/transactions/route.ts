import { NextResponse } from "next/server";
import { Prisma, TransactionDirection } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const parseDate = (value: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"));
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");
  const direction = searchParams.get("direction");
  const search = searchParams.get("search");
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.max(Number(searchParams.get("pageSize") ?? 25), 1);
  const sortParam = searchParams.get("sort") ?? "occurredAt";
  const order = searchParams.get("order") ?? "desc";
  const sort = ["occurredAt", "amount", "createdAt"].includes(sortParam)
    ? sortParam
    : "occurredAt";

  const where: Prisma.TransactionWhereInput = {
    userId: user.id,
    ...(from || to
      ? {
          occurredAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(accountId ? { accountId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(direction && Object.values(TransactionDirection).includes(direction as TransactionDirection)
      ? { direction: direction as TransactionDirection }
      : {}),
    ...(search
      ? {
          OR: [
            { note: { contains: search, mode: "insensitive" } },
            { account: { name: { contains: search, mode: "insensitive" } } },
            { category: { name: { contains: search, mode: "insensitive" } } },
            { transferToAccount: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const total = await prisma.transaction.count({ where });
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      transferToAccount: { select: { id: true, name: true } },
    },
    orderBy: { [sort]: order === "asc" ? "asc" : "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return NextResponse.json({
    success: true,
    data: {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        direction: tx.direction,
        amount: tx.amount.toString(),
        currency: tx.currency,
        occurredAt: tx.occurredAt.toISOString(),
        note: tx.note,
        account: tx.account,
        category: tx.category,
        transferToAccount: tx.transferToAccount,
      })),
      page,
      pageSize,
      total,
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const direction = typeof body.direction === "string" ? body.direction : null;
  if (!direction || !Object.values(TransactionDirection).includes(direction as TransactionDirection)) {
    return NextResponse.json({ success: false, error: "Invalid direction" }, { status: 400 });
  }

  const amount = new Prisma.Decimal(body.amount ?? 0);
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : "KES";
  const occurredAt = body.occurredAt ? new Date(body.occurredAt) : null;
  const accountId = typeof body.accountId === "string" ? body.accountId : null;
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : null;
  const transferToAccountId =
    typeof body.transferToAccountId === "string" ? body.transferToAccountId : null;
  const note = typeof body.note === "string" ? body.note : null;

  if (!occurredAt || Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ success: false, error: "Invalid occurredAt" }, { status: 400 });
  }

  if (!accountId) {
    return NextResponse.json({ success: false, error: "Account is required" }, { status: 400 });
  }

  if (direction === "transfer") {
    if (!transferToAccountId) {
      return NextResponse.json({ success: false, error: "Transfer account is required" }, { status: 400 });
    }
  } else if (!categoryId) {
    return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      direction: direction as TransactionDirection,
      amount,
      currency,
      occurredAt,
      accountId,
      categoryId: direction === "transfer" ? null : categoryId,
      transferToAccountId: direction === "transfer" ? transferToAccountId : null,
      note: note || null,
    },
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
