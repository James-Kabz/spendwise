"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  CraftButton,
  CraftConfirmDialog,
  CraftCreateEditDrawer,
} from "@jameskabz/nextcraft-ui";

import {
  AccountFormFields,
  type AccountFormValues,
} from "@/components/spendwise/accounts/AccountForm";
import type { Account } from "@/components/spendwise/accounts/types";

const mapAccountToFormValues = (account: Account): AccountFormValues => ({
  name: account.name,
  institution: account.institution ?? "",
  type: account.type,
  openingBalance: account.openingBalance,
  isActive: account.isActive,
});

type AccountDrawerProps = {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AccountFormValues) => void | Promise<void>;
  onDeactivate: (accountId: string) => void | Promise<void>;
  onReactivate: (accountId: string) => void | Promise<void>;
};

export default function AccountDrawer({
  account,
  open,
  onOpenChange,
  onSubmit,
  onDeactivate,
  onReactivate,
}: AccountDrawerProps) {
  const form = useForm<AccountFormValues>({
    defaultValues: account ? mapAccountToFormValues(account) : undefined,
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!account) return;
    form.reset(mapAccountToFormValues(account));
  }, [account, form]);

  if (!account) {
    return null;
  }

  return (
    <CraftCreateEditDrawer
      mode="edit"
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit ${account.name}`}
      description="Update details or pause an account from tracking."
      submitLabel="Save changes"
      onSubmit={onSubmit}
    >
      <AccountFormFields showStatusToggle={false} />

      <div className="space-y-3 rounded-2xl border border-[rgb(var(--nc-border)/0.4)] bg-[rgb(var(--nc-surface)/0.08)] p-4">
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
            Account status
          </p>
          <p className="text-xs text-[rgb(var(--nc-fg-muted))]">
            {account.isActive
              ? "Active accounts appear in totals and selectors."
              : "This account is currently inactive."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {account.isActive ? (
            <CraftConfirmDialog
              title="Deactivate account?"
              description="Inactive accounts are excluded from totals, but history stays intact."
              confirmLabel="Deactivate"
              confirmVariant="outline"
              onConfirm={() => onDeactivate(account.id)}
              trigger={
                <CraftButton variant="outline" type="button">
                  Deactivate account
                </CraftButton>
              }
            />
          ) : (
            <CraftButton
              type="button"
              variant="outline"
              onClick={() => onReactivate(account.id)}
            >
              Reactivate account
            </CraftButton>
          )}
        </div>
      </div>
    </CraftCreateEditDrawer>
  );
}
