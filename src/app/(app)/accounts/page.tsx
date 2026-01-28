import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";
import AccountsModule from "@/components/spendwise/accounts/AccountsModule";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <SpendwisePageHeader
        title="Accounts"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Accounts", href: "/accounts" },
        ]}
      />
      <AccountsModule />
    </div>
  );
}
