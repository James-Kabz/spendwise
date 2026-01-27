export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  // TODO: Replace with NextAuth or custom session lookup.
  return null;
}
