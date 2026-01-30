import { NextResponse } from "next/server";
import { Prisma, FinancialAccountType } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  computeBalance,
  decimalToString,
  getBalanceMaps,
} from "@/lib/account-balances";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.financialAccount.findFirst({
    where: { id, userId: user.id },
  });

  if (!account) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const balanceMaps = await getBalanceMaps(user.id, [account.id]);
  const balance = computeBalance(account.openingBalance, balanceMaps, account.id);

  return NextResponse.json({
    success: true,
    data: {
      account: {
        id: account.id,
        name: account.name,
        institution: account.institution,
        type: account.type,
        currency: account.currency,
        openingBalance: decimalToString(account.openingBalance),
        balance: decimalToString(balance),
        isActive: account.isActive,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      },
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId: user.id },
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

  if (typeof body.type === "string") {
    if (!Object.values(FinancialAccountType).includes(body.type)) {
      return NextResponse.json({ success: false, error: "Invalid account type" }, { status: 400 });
    }
    data.type = body.type;
  }

  if (typeof body.currency === "string") {
    data.currency = body.currency.toUpperCase();
  }

  if (typeof body.institution === "string") {
    const trimmed = body.institution.trim();
    data.institution = trimmed ? trimmed : null;
  }

  if (body.openingBalance !== undefined) {
    data.openingBalance = new Prisma.Decimal(body.openingBalance || 0);
  }

  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  const account = await prisma.financialAccount.update({
    where: { id: existing.id },
    data,
  });

  const balanceMaps = await getBalanceMaps(user.id, [account.id]);
  const balance = computeBalance(account.openingBalance, balanceMaps, account.id);

  return NextResponse.json({
    success: true,
    data: {
      account: {
        id: account.id,
        name: account.name,
        institution: account.institution,
        type: account.type,
        currency: account.currency,
        openingBalance: decimalToString(account.openingBalance),
        balance: decimalToString(balance),
        isActive: account.isActive,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      },
    },
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.financialAccount.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const account = await prisma.financialAccount.update({
    where: { id: existing.id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    data: {
      account: {
        id: account.id,
        isActive: account.isActive,
      },
    },
  });
}
