"use client";

import { AppTemplate, type LayoutConfig } from "@jameskabz/nextcraft-ui";
import { usePathname } from "next/navigation";
import * as React from "react";

export type SpendwiseAppLayoutProps = {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: NonNullable<LayoutConfig["header"]> extends {
    breadcrumb?: infer B;
  }
    ? B
    : never;
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
};

type SidebarItems =
  NonNullable<LayoutConfig["sidebar"]> extends { items?: infer Items }
    ? Items
    : never;

type HeaderOverride = {
  title?: string;
  breadcrumb?: NonNullable<LayoutConfig["header"]> extends {
    breadcrumb?: infer B;
  }
    ? B
    : never;
};

type HeaderOverrideContextValue = {
  setOverride: (override: HeaderOverride) => void;
  clearOverride: () => void;
};

const HeaderOverrideContext =
  React.createContext<HeaderOverrideContextValue | null>(null);

export function useSpendwiseHeader() {
  const context = React.useContext(HeaderOverrideContext);
  if (!context) {
    throw new Error("useSpendwiseHeader must be used within SpendwiseAppLayout");
  }
  return context;
}

const sidebarItems: SidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Accounts", href: "/accounts", icon: "wallet" },
  { label: "Transactions", href: "/transactions", icon: "arrow-left-right" },
  { label: "Categories", href: "/categories", icon: "tag" },
  { label: "Budgets", href: "/budgets", icon: "pie-chart" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

const routeMeta = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/accounts", title: "Accounts" },
  { path: "/transactions", title: "Transactions" },
  { path: "/categories", title: "Categories" },
  { path: "/budgets", title: "Budgets" },
  { path: "/settings", title: "Settings" },
];

function resolveRouteMeta(pathname: string | null) {
  if (!pathname) return null;
  const match = routeMeta.find((route) =>
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
  return match ?? null;
}

export default function SpendwiseAppLayout({
  children,
  title,
  breadcrumb,
  headerActions,
  sidebarFooter,
}: SpendwiseAppLayoutProps) {
  const pathname = usePathname();
  const [override, setOverride] = React.useState<HeaderOverride | null>(null);
  const resolvedMeta = resolveRouteMeta(pathname);
  const resolvedTitle =
    override?.title ?? title ?? resolvedMeta?.title ?? "Spendwise";
  const resolvedBreadcrumb =
    override?.breadcrumb ??
    breadcrumb ??
    (resolvedMeta?.title
      ? [
          { label: "Spendwise", href: "/dashboard" },
          { label: resolvedMeta.title },
        ]
      : [{ label: "Spendwise", href: "/dashboard" }]);

  const config: LayoutConfig = {
    sidebar: {
      title: "Spendwise",
      items: sidebarItems,
      footerText: "Spendwise v1",
    },
    header: {
      title: resolvedTitle,
      breadcrumb: resolvedBreadcrumb,
    },
  };

  const contextValue = React.useMemo<HeaderOverrideContextValue>(
    () => ({
      setOverride: (nextOverride) => setOverride(nextOverride),
      clearOverride: () => setOverride(null),
    }),
    []
  );

  return (
    <HeaderOverrideContext.Provider value={contextValue}>
      <AppTemplate
        config={config}
        headerActions={headerActions}
        sidebarFooter={sidebarFooter}
        activePath={pathname ?? undefined}
        lucideFallback
      >
        {children}
      </AppTemplate>
    </HeaderOverrideContext.Provider>
  );
}
