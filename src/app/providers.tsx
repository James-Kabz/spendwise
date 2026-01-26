"use client";

import { ThemeProvider } from "@jameskabz/nextcraft-ui";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
