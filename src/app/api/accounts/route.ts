import { NextResponse } from "next/server";
import { Prisma, FinancialAccount, FinancialAccountType } from "@prisma/client";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  computeBalance,
  decimalToString,
  getBalanceMaps,
} from "@/lib/account-balances";

const parseActiveFilter = (value: string | null) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const activeFilter = parseActiveFilter(searchParams.get("active"));

  const accounts: FinancialAccount[] = await prisma.financialAccount.findMany({
    where: {
      userId: user.id,
      ...(typeof activeFilter === "boolean" ? { isActive: activeFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const accountIds = accounts.map((account) => account.id);
  const balanceMaps = await getBalanceMaps(user.id, accountIds);

  const accountsWithBalances = accounts.map((account) => {
    const balance = computeBalance(account.openingBalance, balanceMaps, account.id);
    return {
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
    };
  });

  return NextResponse.json({
    success: true,
    data: { accounts: accountsWithBalances },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type : null;
  const currency = typeof body.currency === "string" ? body.currency.toUpperCase() : "KES";
  const openingBalanceRaw = body.openingBalance ?? "0";
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const institutionRaw = typeof body.institution === "string" ? body.institution : "";
  const institution = institutionRaw.trim();

  if (!name) {
    return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
  }

  if (!type || !Object.values(FinancialAccountType).includes(type)) {
    return NextResponse.json({ success: false, error: "Invalid account type" }, { status: 400 });
  }

  const openingBalance = new Prisma.Decimal(openingBalanceRaw || 0);

  const account = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name,
      institution: institution || null,
      type,
      currency,
      openingBalance,
      isActive,
    },
  });

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
      balance: decimalToString(account.openingBalance),
      isActive: account.isActive,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    },
  },
  });
}
