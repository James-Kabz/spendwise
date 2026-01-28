import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";

export default function BudgetsPage() {
  return (
    <>
      <SpendwisePageHeader
        title="Budgets"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Budgets", href: "/budgets" },
        ]}
      />
      {/* page content */}
    </>
  );
}
