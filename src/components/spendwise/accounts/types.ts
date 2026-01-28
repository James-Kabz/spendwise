export const ACCOUNT_TYPES = ["Cash", "Bank", "M-Pesa", "Savings"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type Account = {
  id: string;
  name: string;
  institution?: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  lastUpdated: string;
};
