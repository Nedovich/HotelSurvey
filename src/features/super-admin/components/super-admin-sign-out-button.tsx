"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function SuperAdminSignOutButton() {
  const router = useRouter();

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-4 py-2 text-sm font-semibold text-[#584235] transition-colors hover:bg-[#fff8f5]"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
      type="button"
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}
