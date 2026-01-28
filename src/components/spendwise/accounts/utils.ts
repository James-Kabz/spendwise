import { ACCOUNT_TYPE_FROM_API, ACCOUNT_TYPE_TO_API, type AccountType, type ApiAccountType } from "@/components/spendwise/accounts/types";

const DEFAULT_CURRENCY = "KES";

export const formatCurrency = (value: number, currency: string = DEFAULT_CURRENCY) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const toApiAccountType = (type: AccountType): ApiAccountType =>
  ACCOUNT_TYPE_TO_API[type];

export const fromApiAccountType = (type: string): AccountType =>
  ACCOUNT_TYPE_FROM_API[type] ?? "Cash";
