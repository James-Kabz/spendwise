import { NextResponse } from "next/server";
import { FinancialAccount, Prisma } from "@prisma/client";
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

  const accounts : FinancialAccount[] = await prisma.financialAccount.findMany({
    where: {
      userId: user.id,
      ...(typeof activeFilter === "boolean" ? { isActive: activeFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const accountIds = accounts.map((account) => account.id);
  const balanceMaps = await getBalanceMaps(user.id, accountIds);

  const accountBalances = accounts.map((account) => {
    const balance = computeBalance(account.openingBalance, balanceMaps, account.id);
    return {
      id: account.id,
      name: account.name,
      balance,
      currency: account.currency,
    };
  });

  const totalBalance = accountBalances.reduce(
    (total, account) => total.plus(account.balance),
    new Prisma.Decimal(0)
  );

  const currency = accountBalances[0]?.currency ?? "KES";

  return NextResponse.json({
    success: true,
    data: {
      totalBalance: decimalToString(totalBalance),
      currency,
      accounts: accountBalances.map((account) => ({
        id: account.id,
        name: account.name,
        balance: decimalToString(account.balance),
      })),
    },
  });
}
