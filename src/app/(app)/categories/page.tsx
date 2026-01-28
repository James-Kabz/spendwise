import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";

export default function CategoriesPage() {
  return (
    <>
      <SpendwisePageHeader
        title="Categories"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Categories", href: "/categories" },
        ]}
      />
      {/* page content */}
    </>
  );
}
