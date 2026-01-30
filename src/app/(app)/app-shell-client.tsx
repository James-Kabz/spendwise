"use client";

import * as React from "react";
import { AppTemplate } from "@jameskabz/nextcraft-ui";
import { usePathname } from "next/navigation";

type AppShellClientProps = {
  children: React.ReactNode;
  headerActions: React.ReactNode;
};

const routeMeta = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/accounts", title: "Accounts" },
  { path: "/transactions", title: "Transactions" },
  { path: "/categories", title: "Categories" },
  { path: "/budgets", title: "Budgets" },
  { path: "/settings", title: "Settings" },
];

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: "gauge" },
  { label: "Accounts", href: "/accounts", icon: "wallet" },
  { label: "Transactions", href: "/transactions", icon: "arrow-right" },
  { label: "Categories", href: "/categories", icon: "tag" },
  { label: "Budgets", href: "/budgets", icon: "pie-chart" },
  { label: "Settings", href: "/settings", icon: "cog" },
];

function resolveRouteMeta(pathname: string | null) {
  if (!pathname) return null;
  return (
    routeMeta.find(
      (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
    ) ?? null
  );
}

export default function AppShellClient({
  children,
  headerActions,
}: AppShellClientProps) {
  const pathname = usePathname();
  const resolvedMeta = resolveRouteMeta(pathname);
  const resolvedTitle = resolvedMeta?.title ?? "Spendwise";
  const resolvedBreadcrumb = resolvedMeta?.title
    ? [
        { label: "Spendwise", href: "/dashboard" },
        { label: resolvedMeta.title },
      ]
    : [{ label: "Spendwise", href: "/dashboard" }];

  return (
    <AppTemplate
      config={{
        sidebar: {
          title: "Spendwise",
          items: sidebarItems,
          footerText: "Spendwise v1",
        },
        header: {
          title: resolvedTitle,
          breadcrumb: resolvedBreadcrumb,
        },
      }}
      headerActions={headerActions}
      activePath={pathname ?? undefined}
    >
      {children}
    </AppTemplate>
  );
}
