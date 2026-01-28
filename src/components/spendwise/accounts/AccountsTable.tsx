"use client";

import * as React from "react";
import {
  CraftBadge,
  CraftButton,
  CraftDataTable,
  CraftEmptyState,
  CraftFilterBar,
  CraftPagination,
  CraftSelect,
  CraftSkeleton,
} from "@jameskabz/nextcraft-ui";

import AccountTypeBadge from "@/components/spendwise/accounts/AccountTypeBadge";
import { ACCOUNT_TYPES, type Account } from "@/components/spendwise/accounts/types";
import { formatCurrency } from "@/components/spendwise/accounts/utils";

const STATUS_OPTIONS = ["all", "active", "inactive"] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];

type AccountsTableProps = {
  accounts: Account[];
  loading?: boolean;
  onEdit: (account: Account) => void;
  createAction?: React.ReactNode;
};

export default function AccountsTable({
  accounts,
  loading = false,
  onEdit,
  createAction,
}: AccountsTableProps) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);

  const filteredAccounts = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch = normalizedSearch
        ? [account.name, account.institution]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedSearch))
        : true;
      const matchesType = typeFilter === "all" ? true : account.type === typeFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? account.isActive
            : !account.isActive;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accounts, search, statusFilter, typeFilter]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [search, statusFilter, typeFilter, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const paginatedAccounts = filteredAccounts.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  React.useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageCount, pageIndex]);

  const columns = React.useMemo(
    () => [
      {
        id: "name",
        header: "Account",
        cell: (row: Account) => (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
              {row.name}
            </p>
            <p className="text-xs text-[rgb(var(--nc-fg-muted))]">
              {row.institution || "No institution"}
            </p>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: (row: Account) => <AccountTypeBadge type={row.type} />,
      },
      {
        id: "openingBalance",
        header: "Opening",
        align: "right" as const,
        cell: (row: Account) => (
          <span className="text-sm text-[rgb(var(--nc-fg))]">
            {formatCurrency(row.openingBalance)}
          </span>
        ),
      },
      {
        id: "balance",
        header: "Balance",
        align: "right" as const,
        cell: (row: Account) => (
          <span className="text-sm font-semibold text-[rgb(var(--nc-fg))]">
            {formatCurrency(row.currentBalance)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row: Account) => (
          <CraftBadge
            variant="soft"
            tone={row.isActive ? "ocean" : "midnight"}
          >
            {row.isActive ? "Active" : "Inactive"}
          </CraftBadge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row: Account) => (
          <div className="flex flex-wrap items-center gap-2">
            <CraftButton size="sm" variant="ghost" onClick={() => onEdit(row)}>
              Edit
            </CraftButton>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <div className="space-y-4">
      <CraftFilterBar
        title="Accounts"
        description="Manage cash, banks, and mobile money containers."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search accounts"
        actions={createAction}
        filters={
          <div className="flex flex-wrap items-center gap-3">
            <CraftSelect
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All types</option>
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </CraftSelect>
            <CraftSelect
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all"
                    ? "All statuses"
                    : option === "active"
                      ? "Active"
                      : "Inactive"}
                </option>
              ))}
            </CraftSelect>
          </div>
        }
      />

      <CraftDataTable
        data={paginatedAccounts}
        columns={columns}
        loading={loading}
        emptyState={
          <CraftEmptyState
            title="No accounts yet"
            description="Create your first account to start tracking balances."
            action={createAction}
          />
        }
      />

      {loading ? (
        <CraftSkeleton className="h-12 w-full" />
      ) : (
        <CraftPagination
          pageIndex={safePageIndex}
          pageCount={pageCount}
          onPageChange={setPageIndex}
          canPrevious={safePageIndex > 0}
          canNext={safePageIndex < pageCount - 1}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
