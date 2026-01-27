import { CraftLink, GlassCard, ThemeSwitcher } from "@jameskabz/nextcraft-ui";

const signInUrl = "/api/auth/signin/google?callbackUrl=/dashboard";

export default function LoginPage() {
  return (
    <GlassCard intensity="strong" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em]">Spendwise</p>
          <h2 className="text-xl font-semibold">Sign in with Google</h2>
        </div>
        <ThemeSwitcher />
      </div>
      <p className="text-sm text-[rgb(var(--nc-fg-muted))]">
        Use your Google account to sync sessions securely.
      </p>
      <CraftLink variant="button" href={signInUrl} className="w-full justify-center">
        Continue with Google
      </CraftLink>
    </GlassCard>
  );
}
