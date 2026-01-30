"use client";

import { CraftBadge } from "@jameskabz/nextcraft-ui";
import type { TransactionDirection } from "@/components/spendwise/transactions/types";

const toneForDirection = (direction: TransactionDirection) => {
  switch (direction) {
    case "income":
      return "ocean";
    case "expense":
      return "midnight";
    case "transfer":
      return "aurora";
    default:
      return "ocean";
  }
};

const labelForDirection = (direction: TransactionDirection) => {
  switch (direction) {
    case "income":
      return "Income";
    case "expense":
      return "Expense";
    case "transfer":
      return "Transfer";
    default:
      return direction;
  }
};

export default function TransactionTypeBadge({
  direction,
}: {
  direction: TransactionDirection;
}) {
  return (
    <CraftBadge variant="soft" tone={toneForDirection(direction)}>
      {labelForDirection(direction)}
    </CraftBadge>
  );
}
