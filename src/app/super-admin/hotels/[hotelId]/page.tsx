import { notFound } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  Link2,
  ShieldUser,
} from "lucide-react";

import {
  setHotelAdminPasswordAction,
  setHotelDefaultFormAction,
  startHotelImpersonationAction,
  toggleHotelStatusAction,
  updateHotelStableLinkAction,
  updateHotelProfileAction,
} from "@/features/super-admin/actions";
import { formatAppDateTime } from "@/lib/datetime";
import { getManagedHotelById } from "@/server/data";

const noticeMap: Record<string, string> = {
  hotel_created: "Hotel account created successfully.",
  hotel_updated: "Hotel profile updated.",
  hotel_activated: "Hotel access has been re-enabled.",
  hotel_deactivated: "Hotel access has been suspended.",
  password_updated: "Primary admin password updated.",
  default_link_updated: "Stable default link target updated.",
  default_link_unchanged: "No changes were made to the stable default link target.",
  stable_link_updated: "Stable link address updated.",
  stable_link_unchanged: "No changes were made to the stable link address.",
};

const errorMap: Record<string, string> = {
  invalid_hotel_payload: "Please review the hotel profile fields.",
  hotel_slug_exists: "Another hotel is already using this slug.",
  invalid_password: "Password must be at least 8 characters.",
  owner_not_found: "No primary admin user was found for this hotel.",
  default_form_must_be_published: "Only published forms can be selected as the stable default link target.",
  hotel_not_found: "This hotel could not be found.",
  invalid_stable_link_slug: "Use at least 3 characters with lowercase letters, numbers, and hyphens only.",
};

export default async function SuperAdminHotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hotelId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { hotelId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const notice = Array.isArray(resolvedSearchParams.notice)
    ? resolvedSearchParams.notice[0]
    : resolvedSearchParams.notice;
  const error = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;

  const hotel = await getManagedHotelById(hotelId);

  if (!hotel) {
    notFound();
  }

  const publishedForms = hotel.forms.filter((form) => form.status === "published");

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-[#f5ded2] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#8b7263]">Hotel Management</p>
          <h1 className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#251912]">
            {hotel.name}
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Default link address: /{hotel.slug}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form action={startHotelImpersonationAction}>
            <input
              name="hotelId"
              type="hidden"
              value={hotel.id}
            />
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
              type="submit"
            >
              Open Admin Panel
              <ExternalLink className="size-4" />
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
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfc0af] bg-white px-4 text-sm font-semibold text-[#584235] transition-colors hover:bg-[#fff8f5]"
              type="submit"
            >
              {hotel.isActive ? "Suspend Hotel" : "Reactivate Hotel"}
            </button>
          </form>
        </div>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="space-y-6">
          <form
            action={updateHotelProfileAction}
            className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
          >
            <input
              name="hotelId"
              type="hidden"
              value={hotel.id}
            />
            <div className="border-b border-[#f5ded2] pb-3">
              <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
                Hotel Profile
              </h2>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-[#251912]">
                Hotel Name
                <input
                  className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal outline-none transition-colors focus:border-[#c99674]"
                  defaultValue={hotel.name}
                  name="hotelName"
                  required
                  type="text"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#251912]">
                Brand Color
                <input
                  className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal outline-none transition-colors focus:border-[#c99674]"
                  defaultValue={hotel.brandColor ?? ""}
                  name="brandColor"
                  type="text"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-[#251912]">
                Default Locale
                <select
                  className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal outline-none transition-colors focus:border-[#c99674]"
                  defaultValue={hotel.defaultLocale}
                  name="defaultLocale"
                >
                  <option value="en">English</option>
                  <option value="tr">Turkish</option>
                  <option value="de">German</option>
                  <option value="ru">Russian</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <button
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#974800] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
                type="submit"
              >
                Save Hotel Profile
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f5ded2] pb-3">
              <div>
                <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
                  Stable Default Link
                </h2>
                <p className="mt-1 text-sm text-[#584235]">{hotel.stableLinkUrl}</p>
              </div>
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  hotel.defaultForm
                    ? "bg-[#e8f5e9] text-[#2e7d32]"
                    : "bg-[#fff1ea] text-[#974800]"
                }`}
              >
                {hotel.defaultForm ? "Assigned" : "Not assigned"}
              </div>
            </div>

            <form
              action={updateHotelStableLinkAction}
              className="mt-5 space-y-4 border-b border-[#f5ded2] pb-5"
            >
              <input
                name="hotelId"
                type="hidden"
                value={hotel.id}
              />
              <label className="space-y-2 text-sm font-semibold text-[#251912]">
                Default link address
                <div className="flex items-center overflow-hidden rounded-lg border border-[#dfc0af] bg-[#fff8f5]">
                  <span className="inline-flex h-11 items-center border-r border-[#f5ded2] bg-white px-4 text-sm text-[#8b7263]">
                    /s/
                  </span>
                  <input
                    className="h-11 w-full bg-transparent px-4 text-sm font-normal outline-none"
                    defaultValue={hotel.slug}
                    name="stableLinkSlug"
                    placeholder="portobello"
                    required
                    type="text"
                  />
                </div>
              </label>
              <div className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] px-4 py-3 text-sm text-[#584235]">
                This changes the public stable link address. Example: <span className="font-semibold text-[#251912]">/s/portobello</span>
              </div>
              <div className="flex items-center justify-end">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-5 text-sm font-semibold text-[#974800] transition-colors hover:bg-[#fffdfa]"
                  type="submit"
                >
                  Update Link Address
                  <Link2 className="size-4" />
                </button>
              </div>
            </form>

            <form
              action={setHotelDefaultFormAction}
              className="mt-5 space-y-4"
            >
              <input
                name="hotelId"
                type="hidden"
                value={hotel.id}
              />
              <label className="space-y-2 text-sm font-semibold text-[#251912]">
                Select the published form this stable link should open
              </label>

              {publishedForms.length > 0 ? (
                <div className="space-y-3">
                  {publishedForms.map((form) => {
                    const isCurrent = hotel.defaultFormId === form.id;

                    return (
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition-colors ${
                          isCurrent
                            ? "border-[#c99674] bg-[#fff8f5]"
                            : "border-[#f5ded2] bg-white hover:bg-[#fffdfa]"
                        }`}
                        key={form.id}
                      >
                        <input
                          className="mt-1 size-4 accent-[#974800]"
                          defaultChecked={isCurrent}
                          name="defaultFormId"
                          type="radio"
                          value={form.id}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-[#251912]">
                              {form.name}
                            </span>
                            {isCurrent ? (
                              <span className="inline-flex rounded-full bg-[#e8f5e9] px-2.5 py-1 text-[11px] font-semibold text-[#2e7d32]">
                                Current target
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-[#584235]">
                            Published form
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {publishedForms.length === 0 ? (
                <div className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] px-4 py-3 text-sm text-[#584235]">
                  This hotel does not have any published forms yet. Publish a form first, then
                  assign the stable link target.
                </div>
              ) : (
                <div className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] px-4 py-3 text-sm text-[#584235]">
                  The stable link will always stay the same, but it will open whichever published form
                  you select here.
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-5 text-sm font-semibold text-[#974800] transition-colors hover:bg-[#fff8f5] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={publishedForms.length === 0}
                  type="submit"
                >
                  Update Default Link
                  <Link2 className="size-4" />
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 border-b border-[#f5ded2] pb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#fff1ea] text-[#974800]">
                <ShieldUser className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
                  Primary Admin
                </h2>
                <p className="text-sm text-[#584235]">
                  {hotel.primaryAdmin?.email ?? "No owner membership found"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-[#fff8f5] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#8b7263]">
                  Full name
                </p>
                <p className="mt-1 text-sm font-semibold text-[#251912]">
                  {hotel.primaryAdmin?.name ?? "Unassigned"}
                </p>
              </div>

              <form
                action={setHotelAdminPasswordAction}
                className="space-y-3"
              >
                <input
                  name="hotelId"
                  type="hidden"
                  value={hotel.id}
                />
                <label className="space-y-2 text-sm font-semibold text-[#251912]">
                  Set new password
                  <input
                    className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal outline-none transition-colors focus:border-[#c99674]"
                    name="newPassword"
                    placeholder="Minimum 8 characters"
                    required
                    type="password"
                  />
                </label>
                <button
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
                  type="submit"
                >
                  Update Admin Password
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f5ded2] pb-3">
              <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
                Audit Snapshot
              </h2>
              <span className="text-xs font-medium uppercase tracking-[0.6px] text-[#8b7263]">
                Recent activity
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {hotel.auditLogs.length > 0 ? (
                hotel.auditLogs.map((entry) => (
                  <div
                    className="rounded-xl bg-[#fff8f5] p-4"
                    key={entry.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#251912]">{entry.action}</p>
                        <p className="mt-1 text-xs text-[#584235]">
                          {entry.user?.email ?? "System"}
                        </p>
                      </div>
                      <p className="text-xs text-[#8b7263]">
                        {formatAppDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#584235]">No audit activity recorded yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="space-y-2">
              <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
                Enter Hotel Admin
              </h2>
              <p className="text-sm leading-6 text-[#584235]">
                Open the live hotel admin experience using a secure super admin impersonation
                context. All changes stay attributable to your platform account.
              </p>
            </div>

            <form
              action={startHotelImpersonationAction}
              className="mt-5"
            >
              <input
                name="hotelId"
                type="hidden"
                value={hotel.id}
              />
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
                type="submit"
              >
                Open Admin Panel
                <ArrowRight className="size-4" />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
