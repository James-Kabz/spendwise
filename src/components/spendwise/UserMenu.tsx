"use client";

import {
  CraftButton,
  CraftDropdownMenu,
  type CraftDropdownItem,
} from "@jameskabz/nextcraft-ui";
import { signOut } from "next-auth/react";

export type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type UserMenuProps = {
  user?: UserMenuUser | null;
  onLogout?: () => void;
};

const fallbackLabel = "Account";

function getInitials(label: string) {
  const parts = label.trim().split(/\s+/).slice(0, 2);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const label = user?.name || user?.email || fallbackLabel;
  const initials = getInitials(label);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    void signOut({ callbackUrl: "/login" });
  };

  const items: CraftDropdownItem[] = [
    { id: "profile", label: "Profile", href: "/settings" },
    { id: "logout", label: "Sign out", onSelect: handleLogout },
  ];

  return (
    <CraftDropdownMenu
      align="end"
      items={items}
      trigger={
        <CraftButton variant="ghost" className="gap-3">
          {user?.image ? (
            <img
              src={user.image}
              alt={label}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--nc-surface)/0.4)] text-xs font-semibold">
              {initials}
            </span>
          )}
          <span className="text-sm font-semibold">{label}</span>
        </CraftButton>
      }
    />
  );
}
