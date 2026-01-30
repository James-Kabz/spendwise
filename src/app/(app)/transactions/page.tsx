"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CraftButton,
  CraftConfirmDialog,
  CraftDataTable,
  CraftDataTableFilters,
  CraftFormModal,
} from "@jameskabz/nextcraft-ui";
import { toast } from "@jameskabz/nextcraft-ui";

import { formatCurrency } from "@/components/spendwise/accounts/utils";
import QuickAddTransactionDrawer from "@/components/spendwise/transactions/QuickAddTransactionDrawer";
import TransactionTypeBadge from "@/components/spendwise/transactions/TransactionTypeBadge";
import {
  TRANSACTION_DIRECTIONS,
  type Transaction,
  type TransactionDirection,
  type TransactionFormValues,
} from "@/components/spendwise/transactions/types";
import { useAccountsStore } from "@/stores/useAccountsStore";
import { useCategoriesStore } from "@/stores/useCategoriesStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });

export default function TransactionsPage() {
  const accounts = useAccountsStore((state) => state.accounts);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const categories = useCategoriesStore((state) => state.categories);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const transactions = useTransactionsStore((state) => state.transactions);
  const loading = useTransactionsStore((state) => state.loading);
  const fetchTransactions = useTransactionsStore((state) => state.fetchTransactions);
  const createTransaction = useTransactionsStore((state) => state.createTransaction);
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction);
  const deleteTransaction = useTransactionsStore((state) => state.deleteTransaction);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDirection, setFormDirection] = useState<TransactionDirection>("expense");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTransaction, setConfirmTransaction] = useState<Transaction | null>(null);

  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    void fetchAccounts();
    void fetchCategories({ active: "true" });
    void fetchTransactions({
      page: "1",
      pageSize: "25",
      sort: "occurredAt",
      order: "desc",
    });
  }, [fetchAccounts, fetchCategories, fetchTransactions]);

  const filteredParams = useMemo(() => {
    const params: Record<string, string> = {
      page: "1",
      pageSize: "25",
      sort: "occurredAt",
      order: "desc",
    };
    if (search) params.search = search;
    if (accountFilter) params.accountId = accountFilter;
    if (categoryFilter) params.categoryId = categoryFilter;
    if (directionFilter) params.direction = directionFilter;
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    return params;
  }, [accountFilter, categoryFilter, directionFilter, fromDate, search, toDate]);

  useEffect(() => {
    void fetchTransactions(filteredParams);
  }, [fetchTransactions, filteredParams]);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditingId(null);
    setFormDirection("expense");
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((tx: Transaction) => {
    setFormMode("edit");
    setEditingId(tx.id);
    setFormDirection(tx.direction);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: TransactionFormValues) => {
      if (values.direction === "transfer") {
        if (!values.transferToAccountId) {
          toast.error("Transfer account is required");
          return;
        }
        const payload = {
          ...values,
          categoryId: undefined,
        };
        if (formMode === "create") {
          await createTransaction(payload);
        } else if (editingId) {
          await updateTransaction(editingId, payload);
        }
        return;
      }

      if (!values.categoryId) {
        toast.error("Category is required");
        return;
      }

      const payload = {
        ...values,
        transferToAccountId: undefined,
      };
      if (formMode === "create") {
        await createTransaction(payload);
      } else if (editingId) {
        await updateTransaction(editingId, payload);
      }
    },
    [createTransaction, editingId, formMode, updateTransaction]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmTransaction) return;
    await deleteTransaction(confirmTransaction.id);
    setConfirmOpen(false);
    setConfirmTransaction(null);
  }, [confirmTransaction, deleteTransaction]);

  const formInitialData = useMemo(() => {
    if (formMode === "edit" && editingId) {
      const tx = transactions.find((item) => item.id === editingId);
      if (!tx) return null;
      return {
        direction: tx.direction,
        amount: tx.amount,
        currency: tx.currency,
        occurredAt: tx.occurredAt.slice(0, 16),
        accountId: tx.account?.id ?? "",
        categoryId: tx.category?.id ?? "",
        transferToAccountId: tx.transferToAccount?.id ?? "",
        note: tx.note ?? "",
      };
    }
      return {
        direction: "expense",
        amount: 0,
        currency: "KES",
        occurredAt: new Date().toISOString().slice(0, 16),
        accountId: "",
        categoryId: "",
        transferToAccountId: "",
        note: "",
      };
  }, [editingId, formMode, transactions]);

  const formFields = useMemo(() => {
    const fields = [
      {
        name: "direction",
        label: "Direction",
        type: "select",
        required: true,
        placeholder: "Select direction",
        options: TRANSACTION_DIRECTIONS.map((value) => ({
          label:
            value === "expense"
              ? "Expense"
              : value === "income"
                ? "Income"
                : "Transfer",
          value,
        })),
        rules: {
          onChange: (event: ChangeEvent<HTMLSelectElement>) =>
            setFormDirection(event.target.value as TransactionDirection),
        },
      },
      {
        name: "amount",
        label: "Amount",
        type: "currency",
        required: true,
      },
      {
        name: "occurredAt",
        label: "Occurred at",
        type: "datetime-local",
        required: true,
      },
      {
        name: "accountId",
        label: "Account",
        type: "select",
        required: true,
        placeholder: "Select account",
        options: accounts.map((account) => ({
          label: account.name,
          value: account.id,
        })),
      },
    ];

    if (formDirection === "transfer") {
      fields.push({
        name: "transferToAccountId",
        label: "Transfer to",
        type: "select",
        required: true,
        placeholder: "Select account",
        options: accounts.map((account) => ({
          label: account.name,
          value: account.id,
        })),
      });
    } else {
      fields.push({
        name: "categoryId",
        label: "Category",
        type: "select",
        required: true,
        placeholder: "Select category",
        options: categories.map((category) => ({
          label: category.name,
          value: category.id,
        })),
      });
    }

    fields.push({
      name: "note",
      label: "Note",
      type: "text",
    });

    return fields;
  }, [accounts, categories, formDirection]);

  const columns = useMemo(
    () => [
      {
        id: "occurredAt",
        header: "When",
        accessor: "occurredAt",
        formatter: (value: string) => formatDateTime(value),
      },
      {
        id: "direction",
        header: "Type",
        accessor: "direction",
        formatter: (value: TransactionDirection) => (
          <TransactionTypeBadge direction={value} />
        ),
      },
      {
        id: "account",
        header: "Account",
        accessor: (row: Transaction) => row.account?.name ?? "—",
      },
      {
        id: "category",
        header: "Category / Transfer",
        accessor: (row: Transaction) =>
          row.direction === "transfer"
            ? row.transferToAccount?.name ?? "—"
            : row.category?.name ?? "—",
      },
      {
        id: "amount",
        header: "Amount",
        align: "right" as const,
        accessor: (row: Transaction) => row.amount,
        formatter: (_value: number, row: Transaction) =>
          formatCurrency(row.amount, row.currency),
      },
      {
        id: "note",
        header: "Note",
        accessor: (row: Transaction) => row.note ?? "—",
      },
    ],
    []
  );

  const tableActions = useMemo(
    () => [
      {
        key: "edit",
        icon: "edit",
        tooltip: "Edit transaction",
        variant: "ghost",
        onClick: (row: Transaction) => openEdit(row),
      },
      {
        key: "delete",
        icon: "trash",
        tooltip: "Delete transaction",
        variant: "outline",
        onClick: (row: Transaction) => {
          setConfirmTransaction(row);
          setConfirmOpen(true);
        },
      },
    ],
    [openEdit]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <CraftDataTableFilters
          title="Transactions"
          description="Track inflows, expenses, and transfers."
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search transactions"
          addButton={{
            label: "New transaction",
            variant: "outline",
            onClick: openCreate,
          }}
          selectFilters={[
            {
              key: "accountId",
              label: "Account",
              value: accountFilter,
              placeholder: "All accounts",
              options: accounts.map((account) => ({
                label: account.name,
                value: account.id,
              })),
            },
            {
              key: "categoryId",
              label: "Category",
              value: categoryFilter,
              placeholder: "All categories",
              options: categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            },
            {
              key: "direction",
              label: "Direction",
              value: directionFilter,
              placeholder: "All directions",
              options: TRANSACTION_DIRECTIONS.map((direction) => ({
                label:
                  direction === "expense"
                    ? "Expense"
                    : direction === "income"
                      ? "Income"
                      : "Transfer",
                value: direction,
              })),
            },
          ]}
          onSelectFiltersChange={(next) => {
            setAccountFilter(next.find((f) => f.key === "accountId")?.value ?? "");
            setCategoryFilter(next.find((f) => f.key === "categoryId")?.value ?? "");
            setDirectionFilter(next.find((f) => f.key === "direction")?.value ?? "");
          }}
          dateFilters={[
            { key: "from", label: "From", from: fromDate, to: toDate },
          ]}
          onDateFiltersChange={(next) => {
            setFromDate(next[0]?.from ?? "");
            setToDate(next[0]?.to ?? "");
          }}
          totalItems={transactions.length}
          itemLabel="transactions"
        />

        <div className="flex items-center gap-3">
          <QuickAddTransactionDrawer
            accounts={accounts.map((account) => ({
              id: account.id,
              name: account.name,
            }))}
            categories={categories}
            onSubmit={handleSubmit}
          />
        </div>

        <CraftDataTable
          data={transactions}
          columns={columns}
          actions={tableActions}
          showActionsColumn
          loading={loading}
          emptyState="No transactions found"
        />
      </div>

      <CraftFormModal
        title={formMode === "create" ? "Create transaction" : "Edit transaction"}
        description="Log income, expenses, or transfers."
        fields={formFields}
        initialData={formInitialData}
        open={formOpen}
        onOpenChange={setFormOpen}
        submitLabel={formMode === "create" ? "Create transaction" : "Save changes"}
        closeOnSubmit
        showReset={false}
        onSubmit={handleSubmit}
      />

      <CraftConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="outline"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
