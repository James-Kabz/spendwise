import ProtectedRoute from "@/components/spendwise/ProtectedRoute";
import SpendwiseAppLayout from "@/components/spendwise/SpendwiseAppLayout";
import UserMenu from "@/components/spendwise/UserMenu";
import { ThemeSwitcher } from "@jameskabz/nextcraft-ui";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <ProtectedRoute user={user}>
      <SpendwiseAppLayout
        headerActions={
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <UserMenu user={user} />
          </div>
        }
      >
        {children}
      </SpendwiseAppLayout>
    </ProtectedRoute>
  );
}
