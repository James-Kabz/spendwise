"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CraftBadge,
  CraftButton,
  CraftConfirmDialog,
  CraftDataTable,
  CraftDataTableFilters,
  CraftFormModal,
} from "@jameskabz/nextcraft-ui";

import CategoryKindToggle from "@/components/spendwise/categories/CategoryKindToggle";
import {
  CATEGORY_KINDS,
  type Category,
  type CategoryFormValues,
  type CategoryKind,
} from "@/components/spendwise/categories/types";
import { useCategoriesStore } from "@/stores/useCategoriesStore";

export default function CategoriesPage() {
  const categories = useCategoriesStore((state) => state.categories);
  const loading = useCategoriesStore((state) => state.loading);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const createCategory = useCategoriesStore((state) => state.createCategory);
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  const deactivateCategory = useCategoriesStore((state) => state.deactivateCategory);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formKind, setFormKind] = useState<CategoryKind>("expense");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCategory, setConfirmCategory] = useState<Category | null>(null);

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<CategoryKind>("expense");
  const [activeFilter, setActiveFilter] = useState("true");

  useEffect(() => {
    void fetchCategories({ kind: kindFilter, active: activeFilter, search });
  }, [activeFilter, fetchCategories, kindFilter, search]);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditingCategoryId(null);
    setFormKind(kindFilter);
    setFormOpen(true);
  }, [kindFilter]);

  const openEdit = useCallback((category: Category) => {
    setFormMode("edit");
    setEditingCategoryId(category.id);
    setFormKind(category.kind);
    setFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      if (formMode === "create") {
        await createCategory(values);
      } else if (editingCategoryId) {
        await updateCategory(editingCategoryId, values);
      }
    },
    [createCategory, editingCategoryId, formMode, updateCategory]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmCategory) return;
    await deactivateCategory(confirmCategory.id);
    setConfirmOpen(false);
    setConfirmCategory(null);
  }, [confirmCategory, deactivateCategory]);

  const formInitialData = useMemo(() => {
    if (formMode === "edit" && editingCategoryId) {
      const category = categories.find((item) => item.id === editingCategoryId);
      if (!category) return null;
      return {
        name: category.name,
        kind: category.kind,
        color: category.color ?? "",
        icon: category.icon ?? "",
      };
    }
    return {
      name: "",
      kind: kindFilter,
      color: "",
      icon: "",
    };
  }, [categories, editingCategoryId, formMode, kindFilter]);

  const formFields = useMemo(() => {
    return [
      {
        name: "name",
        label: "Category name",
        type: "text",
        required: true,
      },
      {
        name: "kind",
        label: "Kind",
        type: "select",
        required: true,
        options: CATEGORY_KINDS.map((kind) => ({
          label:
            kind === "expense" ? "Expense" : kind === "income" ? "Income" : "Savings",
          value: kind,
        })),
        fieldProps: {
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
            setFormKind(event.target.value as CategoryKind),
        },
      },
      {
        name: "color",
        label: "Color",
        type: "color",
      },
      {
        name: "icon",
        label: "Icon",
        type: "text",
        placeholder: "e.g. shopping-cart",
      },
    ];
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Category",
        accessor: (row: Category) => row.name,
        formatter: (value: string) => (
          <span className="text-base font-semibold text-[rgb(var(--nc-fg))]">
            {value}
          </span>
        ),
      },
      {
        id: "kind",
        header: "Kind",
        accessor: (row: Category) => row.kind,
        formatter: (value: CategoryKind) => (
          <CraftBadge
            variant="soft"
            tone={value === "expense" ? "midnight" : value === "income" ? "ocean" : "aurora"}
          >
            {value === "expense" ? "Expense" : value === "income" ? "Income" : "Savings"}
          </CraftBadge>
        ),
      },
      {
        id: "color",
        header: "Color",
        accessor: (row: Category) => row.color ?? "",
        formatter: (value: string) =>
          value ? (
            <span
              className="inline-block h-5 w-5 rounded-full border border-[rgb(var(--nc-border)/0.4)]"
              style={{ backgroundColor: value }}
            />
          ) : (
            "—"
          ),
      },
      {
        id: "icon",
        header: "Icon",
        accessor: (row: Category) => row.icon ?? "—",
      },
    ],
    []
  );

  const tableActions = useMemo(
    () => [
      {
        key: "edit",
        icon: "edit",
        tooltip: "Edit category",
        variant: "ghost",
        onClick: (row: Category) => openEdit(row),
      },
      {
        key: "delete",
        icon: "trash",
        tooltip: "Deactivate category",
        variant: "outline",
        onClick: (row: Category) => {
          setConfirmCategory(row);
          setConfirmOpen(true);
        },
      },
    ],
    [openEdit]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CategoryKindToggle value={kindFilter} onChange={setKindFilter} />
      </div>

      <CraftDataTableFilters
        title="Categories"
        description="Organize income and expense labels."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories"
        addButton={{
          label: "New category",
          variant: "outline",
          onClick: openCreate,
        }}
        selectFilters={[
          {
            key: "active",
            label: "Status",
            value: activeFilter,
            placeholder: "Active only",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ],
          },
        ]}
        onSelectFiltersChange={(next) => {
          setActiveFilter(next.find((f) => f.key === "active")?.value ?? "true");
        }}
        totalItems={categories.length}
        itemLabel="categories"
      />

      <CraftDataTable
        data={categories}
        columns={columns}
        actions={tableActions}
        showActionsColumn
        loading={loading}
        emptyState="No categories found"
      />

      <CraftFormModal
        title={formMode === "create" ? "Create category" : "Edit category"}
        description="Assign labels for income or expense tracking."
        fields={formFields}
        initialData={formInitialData}
        open={formOpen}
        onOpenChange={setFormOpen}
        submitLabel={formMode === "create" ? "Create category" : "Save changes"}
        closeOnSubmit
        showReset={false}
        onSubmit={handleSubmit}
      />

      <CraftConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Deactivate category?"
        description="Inactive categories won't appear in new transactions."
        confirmLabel="Deactivate"
        confirmVariant="outline"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
