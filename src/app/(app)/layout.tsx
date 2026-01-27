import ProtectedRoute from "@/components/spendwise/ProtectedRoute";
import SpendwiseAppLayout from "@/components/spendwise/SpendwiseAppLayout";
import UserMenu from "@/components/spendwise/UserMenu";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <ProtectedRoute user={user}>
      <SpendwiseAppLayout headerActions={<UserMenu user={user} />}>
        {children}
      </SpendwiseAppLayout>
    </ProtectedRoute>
  );
}
