"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CraftBadge,
  CraftButton,
  CraftDataTable,
  CraftDataTableFilters,
  CraftFormModal,
  CraftLoader,
} from "@jameskabz/nextcraft-ui";

import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";
import TotalBalanceCard from "@/components/spendwise/accounts/TotalBalanceCard";
import {
  ACCOUNT_TYPES,
  type Account,
  type AccountType,
} from "@/components/spendwise/accounts/types";
import {
  formatCurrency,
  fromApiAccountType,
  toApiAccountType,
} from "@/components/spendwise/accounts/utils";
import type {
  CraftDataTableAction,
  CraftDataTableColumn,
  CraftDataTableFilterSelect,
  CraftFormModalField,
} from "@jameskabz/nextcraft-ui";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type AccountApiResponse = {
  id: string;
  name: string;
  institution?: string | null;
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

type AccountFormValues = {
  name: string;
  institution: string;
  type: AccountType;
  openingBalance: number;
  isActive: boolean;
};

type StatusFilter = "all" | "active" | "inactive";

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS = ["all", "active", "inactive"] as const;

const defaultFormValues: AccountFormValues = {
  name: "",
  institution: "",
  type: ACCOUNT_TYPES[0],
  openingBalance: 0,
  isActive: true,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const mapApiAccount = (account: AccountApiResponse): Account => ({
  id: account.id,
  name: account.name,
  institution: account.institution ?? "",
  type: fromApiAccountType(account.type),
  currency: account.currency ?? "KES",
  openingBalance: Number(account.openingBalance ?? 0),
  currentBalance: Number(account.balance ?? 0),
  isActive: account.isActive,
  lastUpdated: account.updatedAt ?? account.createdAt ?? "",
});

const mapAccountToFormValues = (account: Account): AccountFormValues => ({
  name: account.name,
  institution: account.institution ?? "",
  type: account.type,
  openingBalance: account.openingBalance,
  isActive: account.isActive,
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AccountsPage() {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  
  // Data state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<{
    totalBalance: number;
    currency: string;
  } | null>(null);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [reviewFrom, setReviewFrom] = useState("");
  const [reviewTo, setReviewTo] = useState("");

  // --------------------------------------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------------------------------------

  const editingAccount = useMemo(
    () => accounts.find((account) => account.id === editingAccountId) ?? null,
    [accounts, editingAccountId]
  );

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.isActive),
    [accounts]
  );

  const formInitialData = useMemo(() => {
    if (formMode === "edit" && editingAccount) {
      return mapAccountToFormValues(editingAccount);
    }
    return null;
  }, [editingAccount, formMode]);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    
    return accounts.filter((account) => {
      // Search filter
      const matchesSearch = normalizedSearch
        ? [account.name, account.institution]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedSearch))
        : true;

      // Type filter
      const matchesType = typeFilter === "all" ? true : account.type === typeFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? account.isActive
            : !account.isActive;

      if (!(matchesSearch && matchesType && matchesStatus)) return false;

      return true;
    });
  }, [
    accounts,
    search,
    typeFilter,
    statusFilter,
    reviewFrom,
    reviewTo,
  ]);

  // --------------------------------------------------------------------------
  // FORM CONFIGURATION
  // --------------------------------------------------------------------------

  const formFields = useMemo((): Array<CraftFormModalField<AccountFormValues>> => {
    const fields: Array<CraftFormModalField<AccountFormValues>> = [
      {
        name: "name",
        label: "Account name",
        type: "text",
        placeholder: "e.g., Daily cash",
        required: true,
      },
      {
        name: "institution",
        label: "Institution / Provider",
        type: "text",
        placeholder: "e.g., Equity Bank",
      },
      {
        name: "type",
        label: "Account type",
        type: "select",
        required: true,
        defaultValue: ACCOUNT_TYPES[0],
        options: ACCOUNT_TYPES.map((type) => ({ label: type, value: type })),
      },
      {
        name: "openingBalance",
        label: "Opening balance",
        type: "currency",
        placeholder: "0",
        defaultValue: 0,
      },
    ];

    if (formMode === "create") {
      fields.push({
        name: "isActive",
        label: "Active account",
        description: "Active accounts are included in totals.",
        type: "switch",
        defaultValue: true,
      });
    }

    return fields;
  }, [formMode]);

  // --------------------------------------------------------------------------
  // FILTER CONFIGURATION
  // --------------------------------------------------------------------------

  const selectFilters = useMemo(
    (): Array<CraftDataTableFilterSelect> => [
      {
        key: "type",
        label: "Type",
        value: typeFilter,
        placeholder: "All types",
        options: ACCOUNT_TYPES.map((type) => ({
          value: type,
          label: type,
        })),
      },
      {
        key: "status",
        label: "Status",
        value: statusFilter,
        options: STATUS_OPTIONS.map((status) => ({
          value: status,
          label:
            status === "all"
              ? "All status"
              : status === "active"
                ? "Active"
                : "Inactive",
        })),
      },
    ],
    [statusFilter, typeFilter]
  );

  // --------------------------------------------------------------------------
  // TABLE CONFIGURATION
  // --------------------------------------------------------------------------

  const columns = useMemo((): Array<CraftDataTableColumn<Account>> => [
      {
        id: "name",
        header: "Account",
        accessor: (row: Account) => row.name,
        formatter: (_value, row) =>
          row.institution ? `${row.name} • ${row.institution}` : row.name,
    },
    {
      id: "type",
      header: "Type",
      accessor: "type",
      formatter: (value) => (
        <CraftBadge variant="soft" tone="aurora">
          {String(value ?? "")}
        </CraftBadge>
      ),
    },
    {
      id: "openingBalance",
      header: "Opening",
      align: "right" as const,
      accessor: "openingBalance",
      formatter: (value, row) =>
        formatCurrency(Number(value ?? 0), row.currency),
    },
    {
      id: "balance",
      header: "Balance",
      align: "right" as const,
      accessor: "currentBalance",
      formatter: (value, row) =>
        formatCurrency(Number(value ?? 0), row.currency),
    },
    {
      id: "status",
      header: "Status",
      accessor: "isActive",
      formatter: (value) => {
        const isActive = Boolean(value);
        return (
          <CraftBadge variant="soft" tone={isActive ? "ocean" : "midnight"}>
            {isActive ? "Active" : "Inactive"}
          </CraftBadge>
        );
        },
      },
    ], []);


  // --------------------------------------------------------------------------
  // API FUNCTIONS
  // --------------------------------------------------------------------------

  const refreshAccounts = useCallback(async () => {
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

  const refreshSummary = useCallback(async () => {
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

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshAccounts(), refreshSummary()]);
  }, [refreshAccounts, refreshSummary]);

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  const handleCreateAccount = useCallback(
    async (values: AccountFormValues) => {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          institution: values.institution,
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

  const handleEditAccount = useCallback(
    async (values: AccountFormValues) => {
      if (!editingAccountId) return;
      await fetch(`/api/accounts/${editingAccountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          institution: values.institution,
          type: toApiAccountType(values.type),
          openingBalance: String(values.openingBalance ?? 0),
        }),
      });
      await refreshAll();
    },
    [editingAccountId, refreshAll]
  );

  const handleDeactivate = useCallback(
    async (accountId: string) => {
      await fetch(`/api/accounts/${accountId}`, { method: "DELETE" });
      await refreshAll();
    },
    [refreshAll]
  );

  const handleReactivate = useCallback(
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

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditingAccountId(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((account: Account) => {
    setFormMode("edit");
    setEditingAccountId(account.id);
    setFormOpen(true);
  }, []);

  const tableActions = useMemo(
    (): Array<CraftDataTableAction<Account>> => [
      {
        key: "edit",
        icon: "edit",
        tooltip: "Edit account",
        variant: "ghost",
        onClick: (row) => openEdit(row),
      },
      {
        key: "deactivate",
        icon: "archive",
        tooltip: "Deactivate account",
        variant: "outline",
        visible: (row) => row.isActive,
        onClick: (row) => handleDeactivate(row.id),
      },
      {
        key: "reactivate",
        icon: "refresh",
        tooltip: "Reactivate account",
        variant: "outline",
        visible: (row) => !row.isActive,
        onClick: (row) => handleReactivate(row.id),
      },
    ],
    [handleDeactivate, handleReactivate, openEdit]
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingAccountId(null);
      setFormMode("create");
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (values: AccountFormValues) => {
      setSaving(true);
      try {
        if (formMode === "create") {
          await handleCreateAccount(values);
        } else {
          await handleEditAccount(values);
        }
      } finally {
        setSaving(false);
      }
    },
    [formMode, handleCreateAccount, handleEditAccount]
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setReviewFrom("");
    setReviewTo("");
  }, []);

  // --------------------------------------------------------------------------
  // LIFECYCLE
  // --------------------------------------------------------------------------

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SpendwisePageHeader
        title="Accounts"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Accounts", href: "/accounts" },
        ]}
      />

      {/* Loading Overlay */}
      {(loading || summaryLoading) && (
        <div className="fixed inset-0 z-50">
          <CraftLoader
            loading
            overlay
            type="pulse"
            size="large"
            text="Loading"
            backgroundColor="rgb(var(--nc-accent-soft)/ 0.25)"
            tone="aurora"
          />
        </div>
      )}

      {/* Summary Card */}
      <div className="grid gap-4">
        <TotalBalanceCard
          totalBalance={summary?.totalBalance ?? 0}
          currency={summary?.currency}
          activeCount={activeAccounts.length}
          totalCount={accounts.length}
          loading={summaryLoading}
        />
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        {/* Filters */}
        <CraftDataTableFilters
          title="Accounts"
          description="Manage cash, banks, and mobile money containers."
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search accounts"
          addButton={{
            label: "New account",
            variant: "outline",
            onClick: openCreate,
          }}
          selectFilters={selectFilters}
          onSelectFiltersChange={(next) => {
            setTypeFilter(next.find((f) => f.key === "type")?.value ?? "all");
            setStatusFilter(
              (next.find((f) => f.key === "status")?.value ?? "all") as StatusFilter
            );
          }}
          showClear
          clearLabel="Clear filters"
          onClearFilters={handleClearFilters}
          totalItems={filteredAccounts.length}
          itemLabel="accounts"
        />

        {/* Table */}
        <CraftDataTable
          data={filteredAccounts}
          columns={columns}
          actions={tableActions}
          showActionsColumn
          loading={loading}
          emptyState="No accounts found"
        />
      </div>

      {/* Form Modal */}
      <CraftFormModal
        title={formMode === "create" ? "Create account" : "Edit account"}
        description={
          formMode === "create"
            ? "Track cash, banks, and mobile money balances."
            : "Update details for this account."
        }
        fields={formFields}
        initialData={formInitialData}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        submitLabel={formMode === "create" ? "Create account" : "Save changes"}
        loading={saving}
        closeOnSubmit
        showReset={false}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
