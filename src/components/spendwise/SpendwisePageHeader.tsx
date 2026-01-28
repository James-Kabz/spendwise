"use client";

import * as React from "react";
import type { LayoutConfig } from "@jameskabz/nextcraft-ui";

import { useSpendwiseHeader } from "./SpendwiseAppLayout";

export type SpendwisePageHeaderProps = {
  title?: string;
  breadcrumb?: NonNullable<LayoutConfig["header"]> extends {
    breadcrumb?: infer B;
  }
    ? B
    : never;
};

export default function SpendwisePageHeader({
  title,
  breadcrumb,
}: SpendwisePageHeaderProps) {
  const { setOverride, clearOverride } = useSpendwiseHeader();

  React.useEffect(() => {
    setOverride({ title, breadcrumb });
    return () => clearOverride();
  }, [title, breadcrumb, setOverride, clearOverride]);

  return null;
}
