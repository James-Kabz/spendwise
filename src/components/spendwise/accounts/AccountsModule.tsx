"use client";

import * as React from "react";
import { CraftButton } from "@jameskabz/nextcraft-ui";
import AccountDrawer from "@/components/spendwise/accounts/AccountDrawer";
import AccountForm, {
  type AccountFormValues,
} from "@/components/spendwise/accounts/AccountForm";
import AccountsTable from "@/components/spendwise/accounts/AccountsTable";
import TotalBalanceCard from "@/components/spendwise/accounts/TotalBalanceCard";
import type { Account } from "@/components/spendwise/accounts/types";

const initialAccounts: Account[] = [
  {
    id: "acc_cash",
    name: "Daily cash",
    institution: "Personal",
    type: "Cash",
    openingBalance: 1200,
    currentBalance: 1200,
    isActive: true,
    lastUpdated: "2026-01-12",
  },
  {
    id: "acc_mpesa",
    name: "M-Pesa",
    institution: "Safaricom",
    type: "M-Pesa",
    openingBalance: 8420,
    currentBalance: 7650,
    isActive: true,
    lastUpdated: "2026-01-20",
  },
  {
    id: "acc_bank",
    name: "Equity main",
    institution: "Equity Bank",
    type: "Bank",
    openingBalance: 153000,
    currentBalance: 148500,
    isActive: true,
    lastUpdated: "2026-01-24",
  },
  {
    id: "acc_savings",
    name: "Emergency savings",
    institution: "KCB",
    type: "Savings",
    openingBalance: 82000,
    currentBalance: 82000,
    isActive: false,
    lastUpdated: "2026-01-02",
  },
];

const toAccount = (values: AccountFormValues, base?: Account): Account => {
  const openingBalance = Number(values.openingBalance || 0);
  return {
    id: base?.id ?? crypto.randomUUID(),
    name: values.name,
    institution: values.institution || "",
    type: values.type,
    openingBalance,
    currentBalance: base?.currentBalance ?? openingBalance,
    isActive: values.isActive,
    lastUpdated: new Date().toISOString().split("T")[0] ?? "",
  };
};

export default function AccountsModule() {
  const [accounts, setAccounts] = React.useState<Account[]>(initialAccounts);
  const [editingAccountId, setEditingAccountId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const editingAccount = React.useMemo(
    () => accounts.find((account) => account.id === editingAccountId) ?? null,
    [accounts, editingAccountId]
  );

  const activeAccounts = React.useMemo(
    () => accounts.filter((account) => account.isActive),
    [accounts]
  );

  const totalBalance = React.useMemo(
    () =>
      activeAccounts.reduce((total, account) => total + account.currentBalance, 0),
    [activeAccounts]
  );

  const handleCreateAccount = React.useCallback((values: AccountFormValues) => {
    setAccounts((prev) => [toAccount(values), ...prev]);
  }, []);

  const handleEditAccount = React.useCallback(
    (values: AccountFormValues) => {
      if (!editingAccountId) return;
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === editingAccountId ? toAccount(values, account) : account
        )
      );
    },
    [editingAccountId]
  );

  const handleDeactivate = React.useCallback((accountId: string) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId ? { ...account, isActive: false } : account
      )
    );
  }, []);

  const handleReactivate = React.useCallback((accountId: string) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId ? { ...account, isActive: true } : account
      )
    );
  }, []);

  const handleEditRequest = React.useCallback((account: Account) => {
    setEditingAccountId(account.id);
    setDrawerOpen(true);
  }, []);

  const handleDrawerChange = React.useCallback(
    (open: boolean) => {
      setDrawerOpen(open);
      if (!open) {
        setEditingAccountId(null);
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <TotalBalanceCard
          totalBalance={totalBalance}
          activeCount={activeAccounts.length}
          totalCount={accounts.length}
        />
      </div>

      <AccountsTable
        accounts={accounts}
        onEdit={handleEditRequest}
        createAction={
          <AccountForm
            onSubmit={handleCreateAccount}
            trigger={<CraftButton variant="outline">New account</CraftButton>}
          />
        }
      />

      <AccountDrawer
        account={editingAccount}
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        onSubmit={handleEditAccount}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
      />
    </div>
  );
}
