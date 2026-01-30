export const ACCOUNT_TYPES = ["Cash", "Bank", "M-Pesa", "Savings"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_TO_API = {
  Cash: "cash",
  Bank: "bank",
  "M-Pesa": "mobile_money",
  Savings: "savings",
} as const;

export type ApiAccountType = (typeof ACCOUNT_TYPE_TO_API)[AccountType];

export const ACCOUNT_TYPE_FROM_API: Record<string, AccountType> = {
  cash: "Cash",
  bank: "Bank",
  mobile_money: "M-Pesa",
  savings: "Savings",
};

export type Account = {
  id: string;
  name: string;
  institution?: string;
  type: AccountType;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  lastUpdated: string;
};

export type AccountFormValues = {
  name: string;
  institution: string;
  type: AccountType;
  openingBalance: number;
  isActive: boolean;
};
