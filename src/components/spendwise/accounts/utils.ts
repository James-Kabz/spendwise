const DEFAULT_CURRENCY = "KES";

export const formatCurrency = (value: number, currency: string = DEFAULT_CURRENCY) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};
