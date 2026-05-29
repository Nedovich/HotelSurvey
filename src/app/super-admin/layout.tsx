import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { SuperAdminSignOutButton } from "@/features/super-admin/components/super-admin-sign-out-button";
import { requireSuperAdmin } from "@/lib/session";

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session } = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#251912]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] flex-col justify-between bg-white px-4 py-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] lg:flex">
          <div>
            <div className="flex items-center gap-3 px-3 pb-8">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#974800] text-white">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="font-heading text-[20px] font-bold leading-7 text-[#974800]">
                  Super Admin
                </p>
                <p className="text-xs font-medium text-[#584235]">Platform Control</p>
              </div>
            </div>

            <nav className="space-y-2 px-2">
              <Link
                className="flex h-11 items-center gap-3 rounded-lg bg-[#fff1ea] px-4 text-sm font-semibold text-[#974800]"
                href="/super-admin/hotels"
              >
                <Building2 className="size-4" />
                Hotels
              </Link>
              <Link
                className="flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-semibold text-[#584235] transition-colors hover:bg-[#fff1ea]/60 hover:text-[#974800]"
                href="/super-admin/hotels/new"
              >
                <Plus className="size-4" />
                Create Hotel
              </Link>
            </nav>
          </div>

          <div className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#8b7263]">
              Signed in
            </p>
            <p className="mt-2 text-sm font-semibold text-[#251912]">
              {session.user.name}
            </p>
            <p className="text-sm text-[#584235]">{session.user.email}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-[#f5ded2] bg-[#fff8f5] px-4 sm:px-8">
            <div>
              <p className="text-sm font-medium text-[#8b7263]">Platform Administration</p>
              <p className="font-heading text-lg font-semibold text-[#251912]">
                Hotel Account Management
              </p>
            </div>
            <SuperAdminSignOutButton />
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
