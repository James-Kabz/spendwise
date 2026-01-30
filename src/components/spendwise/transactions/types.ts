export const TRANSACTION_DIRECTIONS = ["income", "expense", "transfer"] as const;

export type TransactionDirection = (typeof TRANSACTION_DIRECTIONS)[number];

export type Transaction = {
  id: string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  occurredAt: string;
  note?: string | null;
  account?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  transferToAccount?: { id: string; name: string } | null;
};

export type TransactionFormValues = {
  direction: TransactionDirection;
  amount: number;
  currency: string;
  occurredAt: string;
  accountId: string;
  categoryId?: string;
  transferToAccountId?: string;
  note?: string;
};
