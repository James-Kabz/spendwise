"use client";

import { create } from "zustand";
import { toast } from "@jameskabz/nextcraft-ui";

import { fetchWrapper } from "@/lib/fetchWrapper";
import type {
  Transaction,
  TransactionFormValues,
} from "@/components/spendwise/transactions/types";

type TransactionApiResponse = {
  id: string;
  direction: string;
  amount: string;
  currency: string;
  occurredAt: string;
  note?: string | null;
  account?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  transferToAccount?: { id: string; name: string } | null;
};

type TransactionsListResponse = {
  success: boolean;
  data?: {
    transactions: TransactionApiResponse[];
    page: number;
    pageSize: number;
    total: number;
  };
};

type TransactionResponse = {
  success: boolean;
  data?: { transaction: TransactionApiResponse };
};

const mapApiTransaction = (tx: TransactionApiResponse): Transaction => ({
  id: tx.id,
  direction: tx.direction as Transaction["direction"],
  amount: Number(tx.amount ?? 0),
  currency: tx.currency ?? "KES",
  occurredAt: tx.occurredAt,
  note: tx.note ?? "",
  account: tx.account ?? null,
  category: tx.category ?? null,
  transferToAccount: tx.transferToAccount ?? null,
});

type TransactionsState = {
  transactions: Transaction[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  fetchTransactions: (params?: Record<string, string>) => Promise<void>;
  createTransaction: (values: TransactionFormValues) => Promise<void>;
  updateTransaction: (id: string, values: TransactionFormValues) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  loading: true,
  page: 1,
  pageSize: 25,
  total: 0,
  fetchTransactions: async (params = {}) => {
    set({ loading: true });
    try {
      const query = new URLSearchParams(params).toString();
      const payload = await fetchWrapper.get<TransactionsListResponse>(
        `/api/transactions${query ? `?${query}` : ""}`
      );
      if (payload.success && payload.data) {
        set({
          transactions: payload.data.transactions.map(mapApiTransaction),
          page: payload.data.page,
          pageSize: payload.data.pageSize,
          total: payload.data.total,
        });
      }
    } finally {
      set({ loading: false });
    }
  },
  createTransaction: async (values) => {
    await fetchWrapper.post<TransactionResponse>("/api/transactions", {
      ...values,
      amount: String(values.amount ?? 0),
    });
    await get().fetchTransactions({
      page: String(get().page),
      pageSize: String(get().pageSize),
      sort: "occurredAt",
      order: "desc",
    });
    toast.success("Transaction added", {
      description: "Your transaction has been saved.",
    });
  },
  updateTransaction: async (id, values) => {
    await fetchWrapper.patch<TransactionResponse>(`/api/transactions/${id}`, {
      ...values,
      amount: String(values.amount ?? 0),
    });
    await get().fetchTransactions({
      page: String(get().page),
      pageSize: String(get().pageSize),
      sort: "occurredAt",
      order: "desc",
    });
    toast.success("Transaction updated", {
      description: "Your changes have been saved.",
    });
  },
  deleteTransaction: async (id) => {
    await fetchWrapper.delete(`/api/transactions/${id}`);
    await get().fetchTransactions({
      page: String(get().page),
      pageSize: String(get().pageSize),
      sort: "occurredAt",
      order: "desc",
    });
    toast.success("Transaction deleted");
  },
}));
