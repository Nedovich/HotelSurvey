import Link from "next/link";

import { createHotelAccountAction } from "@/features/super-admin/actions";

const errorMap: Record<string, string> = {
  invalid_hotel_payload: "Please complete the required hotel and primary admin fields.",
  hotel_slug_exists: "This hotel slug is already in use.",
  admin_email_exists: "That admin email already belongs to an existing user.",
};

export default async function SuperAdminCreateHotelPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const error = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#8b7263]">Super Admin</p>
        <h1 className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#251912]">
          Create Hotel Account
        </h1>
        <p className="text-base leading-6 text-[#584235]">
          Set up the hotel record, primary admin login, and the hotel’s stable public link in one step.
        </p>
      </div>

      {error && errorMap[error] ? (
        <div className="rounded-xl border border-[#f5c8c5] bg-[#fff4f3] px-4 py-3 text-sm text-[#a02820]">
          {errorMap[error]}
        </div>
      ) : null}

      <form
        action={createHotelAccountAction}
        className="space-y-6 rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
      >
        <section className="space-y-4">
          <div className="border-b border-[#f5ded2] pb-3">
            <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
              Hotel Details
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-[#251912]">
              Hotel Name
              <input
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                name="hotelName"
                placeholder="Hospita Bodrum"
                required
                type="text"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#251912]">
              Default Link Address
              <input
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                name="hotelSlug"
                placeholder="portobello"
                required
                type="text"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#251912]">
              Brand Color
              <input
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                name="brandColor"
                placeholder="#974800"
                type="text"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#251912]">
              Default Locale
              <select
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                defaultValue="en"
                name="defaultLocale"
              >
                <option value="en">English</option>
                <option value="tr">Turkish</option>
                <option value="de">German</option>
                <option value="ru">Russian</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="border-b border-[#f5ded2] pb-3">
            <h2 className="font-heading text-[22px] font-semibold text-[#251912]">
              Primary Admin
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-[#251912]">
              Full Name
              <input
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                name="adminName"
                placeholder="Property Admin"
                required
                type="text"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#251912]">
              Email
              <input
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                name="adminEmail"
                placeholder="admin@hotel.com"
                required
                type="email"
              />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#251912] md:col-span-2">
              Initial Password
              <input
                className="h-11 w-full rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-sm font-normal text-[#251912] outline-none transition-colors focus:border-[#c99674]"
                name="initialPassword"
                placeholder="Minimum 8 characters"
                required
                type="password"
              />
            </label>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 border-t border-[#f5ded2] pt-5">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#dfc0af] px-4 text-sm font-semibold text-[#584235] transition-colors hover:bg-[#fff8f5]"
            href="/super-admin/hotels"
          >
            Cancel
          </Link>
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#974800] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
            type="submit"
          >
            Create Hotel Account
          </button>
        </div>
      </form>
    </div>
  );
}
