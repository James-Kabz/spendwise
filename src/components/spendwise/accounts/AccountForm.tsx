"use client";

import * as React from "react";
import { useForm, useFormContext } from "react-hook-form";
import {
  CraftCurrencyInput,
  CraftForm,
  CraftFormField,
  CraftInput,
  CraftSelect,
  CraftSwitch,
} from "@jameskabz/nextcraft-ui";

import { ACCOUNT_TYPES, type AccountType } from "@/components/spendwise/accounts/types";

export type AccountFormValues = {
  name: string;
  institution: string;
  type: AccountType;
  openingBalance: number;
  isActive: boolean;
};

type AccountFormFieldsProps = {
  showStatusToggle?: boolean;
};

export function AccountFormFields({ showStatusToggle = true }: AccountFormFieldsProps) {
  const { register } = useFormContext<AccountFormValues>();

  return (
    <div className="grid gap-4">
      <CraftFormField
        name="name"
        label="Account name"
        placeholder="e.g., Daily cash"
        rules={{
          required: "Account name is required",
        }}
      />

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
          Institution / Provider
        </label>
        <CraftInput
          placeholder="e.g., Equity Bank"
          {...register("institution")}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
          Account type
        </label>
        <CraftSelect {...register("type")}>
          <option value="" disabled>
            Select a type
          </option>
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </CraftSelect>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
          Opening balance
        </label>
        <CraftCurrencyInput
          placeholder="0"
          {...register("openingBalance", {
            setValueAs: (value) => (value === "" ? 0 : Number(value)),
          })}
        />
      </div>

      {showStatusToggle ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgb(var(--nc-border)/0.4)] bg-[rgb(var(--nc-surface)/0.08)] p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
              Active account
            </p>
            <p className="text-xs text-[rgb(var(--nc-fg-muted))]">
              Active accounts are included in totals.
            </p>
          </div>
          <CraftSwitch {...register("isActive")} />
        </div>
      ) : null}
    </div>
  );
}

type AccountFormProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  submitLabel?: React.ReactNode;
  onSubmit: (values: AccountFormValues) => void | Promise<void>;
  defaultValues?: Partial<AccountFormValues>;
};

const defaultFormValues: AccountFormValues = {
  name: "",
  institution: "",
  type: ACCOUNT_TYPES[0],
  openingBalance: 0,
  isActive: true,
};

export default function AccountForm({
  trigger,
  open,
  onOpenChange,
  title = "Create account",
  description = "Track cash, banks, and mobile money balances.",
  submitLabel = "Create account",
  onSubmit,
  defaultValues,
}: AccountFormProps) {
  const resolvedDefaults = React.useMemo(
    () => ({ ...defaultFormValues, ...defaultValues }),
    [defaultValues]
  );
  const form = useForm<AccountFormValues>({
    defaultValues: resolvedDefaults,
    mode: "onChange",
  });
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
      if (nextOpen) {
        form.reset(resolvedDefaults);
      }
    },
    [form, isControlled, onOpenChange, resolvedDefaults]
  );

  const handleSubmit = React.useCallback(
    async (values: AccountFormValues) => {
      await onSubmit(values);
      form.reset(resolvedDefaults);
    },
    [form, onSubmit, resolvedDefaults]
  );

  return (
    <CraftForm
      form={form}
      onSubmit={handleSubmit}
      open={isOpen}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      description={description}
      submitLabel={submitLabel}
      closeOnSubmit
      formClassName="space-y-5"
    >
      <AccountFormFields />
    </CraftForm>
  );
}
