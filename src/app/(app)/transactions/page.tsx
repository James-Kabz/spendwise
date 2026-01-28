import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";

export default function TransactionsPage() {
  return (
    <>
      <SpendwisePageHeader
        title="Recent Transactions"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Transactions", href: "/transactions" },
          { label: "Recent" },
        ]}
      />
      {/* page content */}
    </>
  );
}
