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
import {
  fromApiAccountType,
  toApiAccountType,
} from "@/components/spendwise/accounts/utils";

type AccountApiResponse = {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: string;
  balance: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
};

type AccountsListResponse = {
  success: boolean;
  data?: { accounts: AccountApiResponse[] };
};

type SummaryResponse = {
  success: boolean;
  data?: {
    totalBalance: string;
    currency: string;
    accounts: Array<{ id: string; name: string; balance: string }>;
  };
};

const mapApiAccount = (account: AccountApiResponse): Account => ({
  id: account.id,
  name: account.name,
  institution: "",
  type: fromApiAccountType(account.type),
  currency: account.currency ?? "KES",
  openingBalance: Number(account.openingBalance ?? 0),
  currentBalance: Number(account.balance ?? 0),
  isActive: account.isActive,
  lastUpdated: account.updatedAt ?? account.createdAt ?? "",
});

export default function AccountsModule() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [editingAccountId, setEditingAccountId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [summaryLoading, setSummaryLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<{
    totalBalance: number;
    currency: string;
  } | null>(null);

  const editingAccount = React.useMemo(
    () => accounts.find((account) => account.id === editingAccountId) ?? null,
    [accounts, editingAccountId]
  );

  const activeAccounts = React.useMemo(
    () => accounts.filter((account) => account.isActive),
    [accounts]
  );

  const refreshAccounts = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts", { cache: "no-store" });
      const payload = (await response.json()) as AccountsListResponse;
      if (payload.success && payload.data) {
        setAccounts(payload.data.accounts.map(mapApiAccount));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSummary = React.useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch("/api/accounts/summary?active=true", {
        cache: "no-store",
      });
      const payload = (await response.json()) as SummaryResponse;
      if (payload.success && payload.data) {
        setSummary({
          totalBalance: Number(payload.data.totalBalance ?? 0),
          currency: payload.data.currency ?? "KES",
        });
      }
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const refreshAll = React.useCallback(async () => {
    await Promise.all([refreshAccounts(), refreshSummary()]);
  }, [refreshAccounts, refreshSummary]);

  React.useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const handleCreateAccount = React.useCallback(
    async (values: AccountFormValues) => {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          type: toApiAccountType(values.type),
          currency: "KES",
          openingBalance: String(values.openingBalance ?? 0),
          isActive: values.isActive,
        }),
      });
      await refreshAll();
    },
    [refreshAll]
  );

  const handleEditAccount = React.useCallback(
    async (values: AccountFormValues) => {
      if (!editingAccountId) return;
      await fetch(`/api/accounts/${editingAccountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          type: toApiAccountType(values.type),
          openingBalance: String(values.openingBalance ?? 0),
        }),
      });
      await refreshAll();
    },
    [editingAccountId, refreshAll]
  );

  const handleDeactivate = React.useCallback(
    async (accountId: string) => {
      await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
      await refreshAll();
    },
    [refreshAll]
  );

  const handleReactivate = React.useCallback(
    async (accountId: string) => {
      await fetch(`/api/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      await refreshAll();
    },
    [refreshAll]
  );

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
          totalBalance={summary?.totalBalance ?? 0}
          currency={summary?.currency}
          activeCount={activeAccounts.length}
          totalCount={accounts.length}
          loading={summaryLoading}
        />
      </div>

      <AccountsTable
        accounts={accounts}
        onEdit={handleEditRequest}
        loading={loading}
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
