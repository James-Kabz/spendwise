import ProtectedRoute from "@/components/spendwise/ProtectedRoute";
import UserMenu from "@/components/spendwise/UserMenu";
import { ThemeSwitcher } from "@jameskabz/nextcraft-ui";
import { getCurrentUser } from "@/lib/auth";
import { Suspense } from "react";
import Loading from "./loading";
import AppShellClient from "./app-shell-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <ProtectedRoute user={user}>
      <AppShellClient
        headerActions={
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <UserMenu user={user} />
          </div>
        }
      >
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </AppShellClient>
    </ProtectedRoute>
  );
}
