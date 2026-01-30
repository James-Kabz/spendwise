"use client";

import { CraftSelect } from "@jameskabz/nextcraft-ui";
import { CATEGORY_KINDS, type CategoryKind } from "./types";

type CategoryKindToggleProps = {
  value: CategoryKind;
  onChange: (value: CategoryKind) => void;
};

export default function CategoryKindToggle({
  value,
  onChange,
}: CategoryKindToggleProps) {
  return (
    <CraftSelect
      value={value}
      onChange={(event) => onChange(event.target.value as CategoryKind)}
    >
      {CATEGORY_KINDS.map((kind) => (
        <option key={kind} value={kind}>
          {kind === "expense"
            ? "Expense"
            : kind === "income"
              ? "Income"
              : "Savings"}
        </option>
      ))}
    </CraftSelect>
  );
}
