import { redirect } from "next/navigation";

import { getCurrentUser, type AuthUser } from "@/lib/auth";

export type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  user?: AuthUser | null;
};

export default async function ProtectedRoute({
  children,
  redirectTo = "/login",
  user,
}: ProtectedRouteProps) {
  const resolvedUser = user ?? (await getCurrentUser());
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

  if (!resolvedUser && !devBypass) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
