import { CraftBadge } from "@jameskabz/nextcraft-ui";

import type { AccountType } from "@/components/spendwise/accounts/types";

const TYPE_TONES: Record<AccountType, "aurora" | "ember" | "ocean" | "midnight" | "cosmic"> = {
  Cash: "aurora",
  Bank: "ocean",
  "M-Pesa": "ember",
  Savings: "cosmic",
};

type AccountTypeBadgeProps = {
  type: AccountType;
};

export default function AccountTypeBadge({ type }: AccountTypeBadgeProps) {
  return (
    <CraftBadge variant="soft" tone={TYPE_TONES[type]}>
      {type}
    </CraftBadge>
  );
}
