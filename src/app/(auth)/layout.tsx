import { AuthLayout } from "@jameskabz/nextcraft-ui";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to track spending, habits, and meals."
      footer="Need access? Ask for an invite."
    >
      {children}
    </AuthLayout>
  );
}
