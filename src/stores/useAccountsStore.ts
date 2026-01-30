"use client";

import { create } from "zustand";
import { toast } from "@jameskabz/nextcraft-ui";

import type {
  Account,
  AccountFormValues,
} from "@/components/spendwise/accounts/types";
import {
  fromApiAccountType,
  toApiAccountType,
} from "@/components/spendwise/accounts/utils";
import { fetchWrapper } from "@/lib/fetchWrapper";

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

type AccountSummary = {
  totalBalance: number;
  currency: string;
};

type AccountsState = {
  accounts: Account[];
  summary: AccountSummary | null;
  loading: boolean;
  summaryLoading: boolean;
  fetchAccounts: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchAll: () => Promise<void>;
  createAccount: (values: AccountFormValues) => Promise<void>;
  editAccount: (accountId: string, values: AccountFormValues) => Promise<void>;
  deactivateAccount: (accountId: string) => Promise<void>;
  reactivateAccount: (accountId: string) => Promise<void>;
};

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

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  summary: null,
  loading: true,
  summaryLoading: true,
  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const payload = await fetchWrapper.get<AccountsListResponse>("/api/accounts");
      if (payload.success && payload.data) {
        set({ accounts: payload.data.accounts.map(mapApiAccount) });
      }
    } finally {
      set({ loading: false });
    }
  },
  fetchSummary: async () => {
    set({ summaryLoading: true });
    try {
      const payload = await fetchWrapper.get<SummaryResponse>(
        "/api/accounts/summary?active=true"
      );
      if (payload.success && payload.data) {
        set({
          summary: {
            totalBalance: Number(payload.data.totalBalance ?? 0),
            currency: payload.data.currency ?? "KES",
          },
        });
      }
    } finally {
      set({ summaryLoading: false });
    }
  },
  fetchAll: async () => {
    const { fetchAccounts, fetchSummary } = get();
    await Promise.all([fetchAccounts(), fetchSummary()]);
  },
  createAccount: async (values) => {
    await fetchWrapper.post("/api/accounts", {
      name: values.name,
      institution: values.institution,
      type: toApiAccountType(values.type),
      currency: "KES",
      openingBalance: String(values.openingBalance ?? 0),
      isActive: values.isActive,
    });
    await get().fetchAll();
    toast.success("Account created", {
      description: "Your account has been created successfully.",
    });
  },
  editAccount: async (accountId, values) => {
    await fetchWrapper.patch(`/api/accounts/${accountId}`, {
      name: values.name,
      institution: values.institution,
      type: toApiAccountType(values.type),
      openingBalance: String(values.openingBalance ?? 0),
    });
    await get().fetchAll();
    toast.success("Account updated", {
      description: "Your account changes have been saved.",
    });
  },
  deactivateAccount: async (accountId) => {
    await fetchWrapper.delete(`/api/accounts/${accountId}`);
    await get().fetchAll();
    toast.success("Account deactivated", {
      description: "The account is now inactive.",
    });
  },
  reactivateAccount: async (accountId) => {
    await fetchWrapper.patch(`/api/accounts/${accountId}`, { isActive: true });
    await get().fetchAll();
    toast.success("Account reactivated", {
      description: "The account is active again.",
    });
  },
}));
