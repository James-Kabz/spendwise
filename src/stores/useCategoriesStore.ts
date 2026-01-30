"use client";

import { create } from "zustand";
import { fetchWrapper } from "@/lib/fetchWrapper";

type CategoryApiResponse = {
  id: string;
  name: string;
  kind?: string;
  color?: string | null;
  icon?: string | null;
};

type CategoriesListResponse = {
  success: boolean;
  data?: { categories: CategoryApiResponse[] };
};

type Category = {
  id: string;
  name: string;
};

type CategoriesState = {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const payload = await fetchWrapper.get<CategoriesListResponse>(
        "/api/categories"
      );
      if (payload.success && payload.data) {
        set({
          categories: payload.data.categories.map((category) => ({
            id: category.id,
            name: category.name,
          })),
        });
      }
    } finally {
      set({ loading: false });
    }
  },
}));
