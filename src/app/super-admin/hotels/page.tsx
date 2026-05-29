import Link from "next/link";
import { ArrowRight, Building2, Link2, Plus } from "lucide-react";

import {
  startHotelImpersonationAction,
  toggleHotelStatusAction,
} from "@/features/super-admin/actions";
import { getManagedHotels } from "@/server/data";

const noticeMap: Record<string, string> = {
  demo_mode_only: "This action is not available while the app is running without a database.",
};

const errorMap: Record<string, string> = {
  invalid_impersonation: "Unable to open that hotel context.",
};

export default async function SuperAdminHotelsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const notice = Array.isArray(resolvedSearchParams.notice)
    ? resolvedSearchParams.notice[0]
    : resolvedSearchParams.notice;
  const error = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;
  const hotels = await getManagedHotels();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#251912]">
            Hotels
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Create hotel accounts, manage primary admins, and control stable survey links.
          </p>
        </div>

        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
          href="/super-admin/hotels/new"
        >
          <Plus className="size-4" />
          Create Hotel
        </Link>
      </section>

      {notice && noticeMap[notice] ? (
        <div className="rounded-xl border border-[#cbe7d0] bg-[#f2fbf4] px-4 py-3 text-sm text-[#256e35]">
          {noticeMap[notice]}
        </div>
      ) : null}
      {error && errorMap[error] ? (
        <div className="rounded-xl border border-[#f5c8c5] bg-[#fff4f3] px-4 py-3 text-sm text-[#a02820]">
          {errorMap[error]}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {hotels.map((hotel) => (
          <article
            className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            key={hotel.id}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff1ea] text-[#974800]">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
                        {hotel.name}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          hotel.isActive
                            ? "bg-[#e8f5e9] text-[#2e7d32]"
                            : "bg-[#fff1ea] text-[#974800]"
                        }`}
                      >
                        {hotel.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                    <p className="text-sm text-[#584235]">/{hotel.slug}</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-[#584235]">
                  <p>
                    Primary admin:{" "}
                    <span className="font-medium text-[#251912]">
                      {hotel.primaryAdmin?.email ?? "Not assigned"}
                    </span>
                  </p>
                  <p>
                    Stable link:{" "}
                    <span className="font-medium text-[#251912]">{hotel.stableLinkUrl}</span>
                  </p>
                  <p>
                    Default target:{" "}
                    <span className="font-medium text-[#251912]">
                      {hotel.defaultForm?.name ?? "No published default form"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid min-w-[180px] gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-4 text-sm font-semibold text-[#974800] transition-colors hover:bg-[#fff8f5]"
                  href={`/super-admin/hotels/${hotel.id}`}
                >
                  View / Manage
                  <ArrowRight className="size-4" />
                </Link>

                <form action={startHotelImpersonationAction}>
                  <input
                    name="hotelId"
                    type="hidden"
                    value={hotel.id}
                  />
                  <button
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
                    type="submit"
                  >
                    Open Admin Panel
                  </button>
                </form>

                <form action={toggleHotelStatusAction}>
                  <input
                    name="hotelId"
                    type="hidden"
                    value={hotel.id}
                  />
                  <input
                    name="nextStatus"
                    type="hidden"
                    value={hotel.isActive ? "inactive" : "active"}
                  />
                  <button
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-semibold text-[#584235] transition-colors hover:bg-[#fff1ea]"
                    type="submit"
                  >
                    {hotel.isActive ? "Suspend Hotel" : "Reactivate Hotel"}
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-[#fff8f5] p-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#8b7263]">
                  Forms
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-[#251912]">
                  {hotel.formsCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#8b7263]">
                  Responses
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-[#251912]">
                  {hotel.responsesCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#8b7263]">
                  Link Type
                </p>
                <p className="mt-1 inline-flex items-center gap-1 font-medium text-[#974800]">
                  <Link2 className="size-4" />
                  Stable
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
