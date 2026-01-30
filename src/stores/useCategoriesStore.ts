"use client";

"use client";

import { create } from "zustand";
import { toast } from "@jameskabz/nextcraft-ui";

import { fetchWrapper } from "@/lib/fetchWrapper";
import type {
  Category,
  CategoryFormValues,
} from "@/components/spendwise/categories/types";

type CategoryApiResponse = {
  id: string;
  name: string;
  kind: string;
  color?: string | null;
  icon?: string | null;
  isActive: boolean;
};

type CategoriesListResponse = {
  success: boolean;
  data?: { categories: CategoryApiResponse[] };
};

type CategoryResponse = {
  success: boolean;
  data?: { category: CategoryApiResponse };
};

const mapApiCategory = (category: CategoryApiResponse): Category => ({
  id: category.id,
  name: category.name,
  kind: category.kind as Category["kind"],
  color: category.color ?? null,
  icon: category.icon ?? null,
  isActive: category.isActive,
});

type CategoriesState = {
  categories: Category[];
  loading: boolean;
  fetchCategories: (params?: Record<string, string>) => Promise<void>;
  createCategory: (values: CategoryFormValues) => Promise<void>;
  updateCategory: (id: string, values: CategoryFormValues) => Promise<void>;
  deactivateCategory: (id: string) => Promise<void>;
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  fetchCategories: async (params = {}) => {
    set({ loading: true });
    try {
      const query = new URLSearchParams(params).toString();
      const payload = await fetchWrapper.get<CategoriesListResponse>(
        `/api/categories${query ? `?${query}` : ""}`
      );
      if (payload.success && payload.data) {
        set({
          categories: payload.data.categories.map(mapApiCategory),
        });
      }
    } finally {
      set({ loading: false });
    }
  },
  createCategory: async (values) => {
    await fetchWrapper.post<CategoryResponse>("/api/categories", values);
    await get().fetchCategories({ active: "true" });
    toast.success("Category created", {
      description: "Your category has been saved.",
    });
  },
  updateCategory: async (id, values) => {
    await fetchWrapper.patch<CategoryResponse>(`/api/categories/${id}`, values);
    await get().fetchCategories({ active: "true" });
    toast.success("Category updated", {
      description: "Your category changes have been saved.",
    });
  },
  deactivateCategory: async (id) => {
    await fetchWrapper.delete(`/api/categories/${id}`);
    await get().fetchCategories({ active: "true" });
    toast.success("Category deactivated");
  },
}));
