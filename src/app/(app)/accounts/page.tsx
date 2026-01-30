"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CraftBadge,
  CraftConfirmDialog,
  CraftDataTable,
  CraftDataTableFilters,
  CraftFormModal,
} from "@jameskabz/nextcraft-ui";

import TotalBalanceCard from "@/components/spendwise/accounts/TotalBalanceCard";
import {
  ACCOUNT_TYPES,
  type Account,
  type AccountFormValues,
} from "@/components/spendwise/accounts/types";
import { formatCurrency } from "@/components/spendwise/accounts/utils";
import { useAccountsStore } from "@/stores/useAccountsStore";
import Loading from "./loading";
import type {
  CraftDataTableAction,
  CraftDataTableColumn,
  CraftDataTableFilterSelect,
  CraftFormModalField,
} from "@jameskabz/nextcraft-ui";
import AccountTypeBadge from "@/components/spendwise/accounts/AccountTypeBadge";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type StatusFilter = "all" | "active" | "inactive";

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_OPTIONS = ["all", "active", "inactive"] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
  const accounts = useAccountsStore((state) => state.accounts);
  const summary = useAccountsStore((state) => state.summary);
  const loading = useAccountsStore((state) => state.loading);
  const summaryLoading = useAccountsStore((state) => state.summaryLoading);
  const fetchAll = useAccountsStore((state) => state.fetchAll);
  const createAccount = useAccountsStore((state) => state.createAccount);
  const editAccount = useAccountsStore((state) => state.editAccount);
  const deactivateAccount = useAccountsStore((state) => state.deactivateAccount);
  const reactivateAccount = useAccountsStore((state) => state.reactivateAccount);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Loading state
  const [saving, setSaving] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);
  const [confirmAccount, setConfirmAccount] = useState<Account | null>(null);

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
        align: "center",
        formatter: (value) => (
          <span className="text-lg font-extrabold text-[rgb(var(--nc-fg))]">
            {String(value ?? "")}
          </span>
        ),
    },
    {
      id: "institution",
      header: "Institution",
      accessor: "institution",
      align: "left"
    },
    {
      id: "type",
      header: "Type",
      accessor: "type",
      formatter: (_value, row) => (
        <AccountTypeBadge type={row.type} />
      ),
      align: "left"
    },
    {
      id: "openingBalance",
      header: "Opening",
      align: "center",
      accessor: "openingBalance",
      formatter: (value, row) =>
        formatCurrency(Number(value ?? 0), row.currency),
    },
    {
      id: "balance",
      header: "Balance",
      align: "center",
      accessor: "currentBalance",
      formatter: (value, row) =>
        formatCurrency(Number(value ?? 0), row.currency),
    },
    {
      id: "status",
      header: "Status",
      accessor: "isActive",
      align: "left",
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
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  const handleDeactivate = useCallback(
    async (accountId: string) => {
      await deactivateAccount(accountId);
    },
    [deactivateAccount]
  );

  const handleReactivate = useCallback(
    async (accountId: string) => {
      await reactivateAccount(accountId);
    },
    [reactivateAccount]
  );

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditingAccountId(null);
    setFormKey((prev) => prev + 1);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((account: Account) => {
    setFormMode("edit");
    setEditingAccountId(account.id);
    setFormKey((prev) => prev + 1);
    setFormOpen(true);
  }, []);

  const openStatusConfirm = useCallback(
    (action: "deactivate" | "reactivate", account: Account) => {
      setConfirmAction(action);
      setConfirmAccount(account);
      setConfirmOpen(true);
    },
    []
  );

  const handleConfirmStatusChange = useCallback(async () => {
    if (!confirmAccount || !confirmAction) return;
    if (confirmAction === "deactivate") {
      await handleDeactivate(confirmAccount.id);
    } else {
      await handleReactivate(confirmAccount.id);
    }
    setConfirmOpen(false);
    setConfirmAccount(null);
    setConfirmAction(null);
  }, [confirmAction, confirmAccount, handleDeactivate, handleReactivate]);

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
        onClick: (row) => openStatusConfirm("deactivate", row),
      },
      {
        key: "reactivate",
        icon: "refresh",
        tooltip: "Reactivate account",
        variant: "outline",
        visible: (row) => !row.isActive,
        onClick: (row) => openStatusConfirm("reactivate", row),
      },
    ],
    [openEdit, openStatusConfirm]
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);
    if (open) {
      setFormKey((prev) => prev + 1);
    }
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
          await createAccount(values);
        } else {
          if (!editingAccountId) return;
          await editAccount(editingAccountId, values);
        }
      } finally {
        setSaving(false);
      }
    },
    [createAccount, editAccount, editingAccountId, formMode]
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }, []);

  // --------------------------------------------------------------------------
  // LIFECYCLE
  // --------------------------------------------------------------------------

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}

      {/* Loading Overlay */}
      {(loading || summaryLoading) && <Loading />}

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
        key={formKey}
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

      <CraftConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmAction === "deactivate"
            ? "Deactivate account?"
            : "Reactivate account?"
        }
        description={
          confirmAction === "deactivate"
            ? "Inactive accounts are excluded from totals, but history stays intact."
            : "This account will be included in totals again."
        }
        confirmLabel={
          confirmAction === "deactivate" ? "Deactivate" : "Reactivate"
        }
        confirmVariant="outline"
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
