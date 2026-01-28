import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";

export default function AccountsPage() {
  return (
    <>
      <SpendwisePageHeader
        title="Accounts"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Accounts", href: "/accounts" },
        ]}
      />
      {/* page content */}
    </>
  );
}
