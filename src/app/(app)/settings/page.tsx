import SpendwisePageHeader from "@/components/spendwise/SpendwisePageHeader";

export default function SettingsPage() {
  return (
    <>
      <SpendwisePageHeader
        title="Settings"
        breadcrumb={[
          { label: "Spendwise", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
        ]}
      />
      {/* page content */}
    </>
  );
}
