"use client";

import { AppTemplate, type LayoutConfig } from "@jameskabz/nextcraft-ui";
import { usePathname } from "next/navigation";

export type SpendwiseAppLayoutProps = {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: LayoutConfig["header"] extends { breadcrumb?: infer B } ? B : never;
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
};

type SidebarItems = LayoutConfig["sidebar"] extends { items: infer Items }
  ? Items
  : never;

const sidebarItems: SidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Accounts", href: "/accounts", icon: "wallet" },
  { label: "Transactions", href: "/transactions", icon: "arrow-left-right" },
  { label: "Categories", href: "/categories", icon: "tag" },
  { label: "Budgets", href: "/budgets", icon: "pie-chart" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export default function SpendwiseAppLayout({
  children,
  title,
  breadcrumb,
  headerActions,
  sidebarFooter,
}: SpendwiseAppLayoutProps) {
  const pathname = usePathname();
  const resolvedTitle = title ?? "Dashboard";

  const config: LayoutConfig = {
    sidebar: {
      title: "Spendwise",
      items: sidebarItems,
      footerText: "Spendwise v1",
    },
    header: {
      title: resolvedTitle,
      breadcrumb:
        breadcrumb ?? [
          { label: "Spendwise", href: "/dashboard" },
          { label: resolvedTitle },
        ],
    },
  };

  return (
    <AppTemplate
      config={config}
      headerActions={headerActions}
      sidebarFooter={sidebarFooter}
      activePath={pathname ?? undefined}
      lucideFallback
    >
      {children}
    </AppTemplate>
  );
}
