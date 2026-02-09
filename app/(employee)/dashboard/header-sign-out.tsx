"use client";

import { signOut } from "next-auth/react";

export function HeaderSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
    >
      Sign out
    </button>
  );
}
