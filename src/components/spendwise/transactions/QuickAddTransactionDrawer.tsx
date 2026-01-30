"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  CraftButton,
  CraftCreateEditDrawer,
  CraftFormField,
  CraftSelect,
} from "@jameskabz/nextcraft-ui";

import { fetchWrapper } from "@/lib/fetchWrapper";
import {
  TRANSACTION_DIRECTIONS,
  type TransactionDirection,
  type TransactionFormValues,
} from "@/components/spendwise/transactions/types";

type QuickAddTransactionDrawerProps = {
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
};

type LastUsedResponse = {
  success: boolean;
  data?: { accountId?: string | null; categoryId?: string | null };
};

export default function QuickAddTransactionDrawer({
  accounts,
  categories,
  onSubmit,
}: QuickAddTransactionDrawerProps) {
  const form = useForm<TransactionFormValues>({
    mode: "onChange",
    defaultValues: {
      direction: "expense",
      amount: 0,
      currency: "KES",
      occurredAt: new Date().toISOString().slice(0, 16),
      accountId: "",
      categoryId: "",
      transferToAccountId: "",
      note: "",
    },
  });

  const direction = form.watch("direction") as TransactionDirection;

  const fetchDefaults = React.useCallback(async () => {
    const payload = await fetchWrapper.get<LastUsedResponse>(
      "/api/transactions/last-used"
    );
    if (payload.success && payload.data) {
      form.reset({
        ...form.getValues(),
        accountId: payload.data.accountId ?? "",
        categoryId: payload.data.categoryId ?? "",
      });
    }
  }, [form]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        void fetchDefaults();
      }
    },
    [fetchDefaults]
  );

  return (
    <CraftCreateEditDrawer
      mode="create"
      form={form}
      onSubmit={onSubmit}
      title="Quick add"
      description="Log a transaction in seconds."
      submitLabel="Save transaction"
      trigger={<CraftButton variant="outline">Quick add</CraftButton>}
      onOpenChange={handleOpenChange}
    >
      <div className="grid gap-4">
        <CraftFormField
          name="direction"
          label="Direction"
          type="select"
          required
          options={TRANSACTION_DIRECTIONS.map((value) => ({
            label: value,
            value,
          }))}
        />

        <CraftFormField
          name="amount"
          label="Amount"
          type="currency"
          required
        />

        <CraftFormField
          name="occurredAt"
          label="Occurred at"
          type="datetime-local"
          required
        />

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
            Account
          </label>
          <CraftSelect {...form.register("accountId", { required: true })}>
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </CraftSelect>
        </div>

        {direction === "transfer" ? (
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
              Transfer to
            </label>
            <CraftSelect {...form.register("transferToAccountId", { required: true })}>
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </CraftSelect>
          </div>
        ) : (
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
              Category
            </label>
            <CraftSelect {...form.register("categoryId", { required: true })}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </CraftSelect>
          </div>
        )}

        <CraftFormField name="note" label="Note" type="text" />
      </div>
    </CraftCreateEditDrawer>
  );
}
