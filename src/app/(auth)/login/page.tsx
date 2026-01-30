"use client";

import { CraftButton, GlassCard, ThemeSwitcher } from "@jameskabz/nextcraft-ui";
import { signIn } from "next-auth/react";

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
      <CraftButton
        type="button"
        className="w-full justify-center"
        onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
      >
        Continue with Google
      </CraftButton>
    </GlassCard>
  );
}
