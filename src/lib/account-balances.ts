import { Prisma, TransactionDirection } from "@prisma/client";
import prisma from "@/lib/prisma";

type BalanceMaps = {
  income: Map<string, Prisma.Decimal>;
  expense: Map<string, Prisma.Decimal>;
  transferOut: Map<string, Prisma.Decimal>;
  transferIn: Map<string, Prisma.Decimal>;
};

const zero = new Prisma.Decimal(0);

const buildSumMap = <T extends { _sum: { amount: Prisma.Decimal | null } }>(
  rows: Array<T & { accountId?: string | null; transferToAccountId?: string | null }>,
  key: "accountId" | "transferToAccountId"
) => {
  const map = new Map<string, Prisma.Decimal>();
  rows.forEach((row) => {
    const id = row[key];
    if (!id) return;
    map.set(id, row._sum.amount ?? zero);
  });
  return map;
};

export async function getBalanceMaps(userId: string, accountIds: string[]): Promise<BalanceMaps> {
  if (accountIds.length === 0) {
    return {
      income: new Map(),
      expense: new Map(),
      transferOut: new Map(),
      transferIn: new Map(),
    };
  }

  const [incomeRows, expenseRows, transferOutRows, transferInRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: {
        userId,
        direction: TransactionDirection.income,
        accountId: { in: accountIds },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: {
        userId,
        direction: TransactionDirection.expense,
        accountId: { in: accountIds },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: {
        userId,
        direction: TransactionDirection.transfer,
        accountId: { in: accountIds },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["transferToAccountId"],
      where: {
        userId,
        direction: TransactionDirection.transfer,
        transferToAccountId: { in: accountIds },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    income: buildSumMap(incomeRows, "accountId"),
    expense: buildSumMap(expenseRows, "accountId"),
    transferOut: buildSumMap(transferOutRows, "accountId"),
    transferIn: buildSumMap(transferInRows, "transferToAccountId"),
  };
}

export function computeBalance(
  openingBalance: Prisma.Decimal,
  maps: BalanceMaps,
  accountId: string
) {
  const income = maps.income.get(accountId) ?? zero;
  const expense = maps.expense.get(accountId) ?? zero;
  const transferOut = maps.transferOut.get(accountId) ?? zero;
  const transferIn = maps.transferIn.get(accountId) ?? zero;

  return openingBalance
    .plus(income)
    .minus(expense)
    .minus(transferOut)
    .plus(transferIn);
}

export const decimalToString = (value: Prisma.Decimal | null) =>
  new Prisma.Decimal(value ?? 0).toFixed(2);

export const decimalToNumber = (value: Prisma.Decimal | null) =>
  Number(value ?? 0);
