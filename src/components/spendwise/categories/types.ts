export const CATEGORY_KINDS = ["expense", "income", "savings"] as const;

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  color?: string | null;
  icon?: string | null;
  isActive: boolean;
};

export type CategoryFormValues = {
  name: string;
  kind: CategoryKind;
  color?: string;
  icon?: string;
};
