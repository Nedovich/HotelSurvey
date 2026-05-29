import Link from "next/link";
import {
  ArrowUpDown,
  FileText,
  Filter,
  Heart,
  Link2,
  Plus,
  Search,
  UtensilsCrossed,
} from "lucide-react";

import { AdminPageHeaderSlot } from "@/components/admin-page-header";
import { DeleteFormButton } from "@/features/forms/components/delete-form-button";
import { formatAppDate } from "@/lib/datetime";
import { requireHotelContext } from "@/lib/session";
import { getForms } from "@/server/data";

const statusMap = {
  published: {
    label: "Published",
    className: "bg-[#fff1ea] text-[#974800]",
  },
  draft: {
    label: "Draft",
    className: "bg-[#f7ede7] text-[#8d6f5b]",
  },
  archived: {
    label: "Archived",
    className: "bg-[#f1f5f9] text-[#64748b]",
  },
} as const;

function getFormIcon(name: string) {
  if (name.toLowerCase().includes("restaurant")) {
    return UtensilsCrossed;
  }

  if (name.toLowerCase().includes("spa")) {
    return Heart;
  }

  return FileText;
}

function getFormIconColors(name: string) {
  if (name.toLowerCase().includes("restaurant")) {
    return "bg-[#eef6ff] text-[#2f7dc1]";
  }

  if (name.toLowerCase().includes("spa")) {
    return "bg-[#fff1ea] text-[#9a6a47]";
  }

  return "bg-[#fff1ea] text-[#c07535]";
}

export default async function FormsPage() {
  const context = await requireHotelContext();
  const forms = await getForms();
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(forms.length / pageSize));
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="space-y-6">
      <AdminPageHeaderSlot>
        <div className="space-y-1">
          <h1 className="font-heading text-[32px] leading-10 font-semibold tracking-[-0.64px] text-[#251912]">
            Survey Forms
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Manage and distribute your guest feedback surveys.
          </p>
        </div>
      </AdminPageHeaderSlot>

      <div className="flex justify-end">
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#974800] px-4 text-[14px] font-semibold leading-4 tracking-[0.14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#7d3c00]"
          href="/forms/new"
        >
          <Plus className="size-[12px]" />
          Create New Survey
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 border-b border-[#f5ded2] bg-[rgba(255,248,245,0.5)] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-[13.5px] -translate-y-1/2 text-[#584235]" />
            <input
              className="h-[38px] w-full rounded-lg border border-[#dfc0af] bg-white pl-9 pr-4 text-[14px] text-[#251912] placeholder:text-[#6b7280] outline-none transition-colors focus:border-[#d8b39b]"
              placeholder="Search forms..."
              type="search"
            />
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              className="inline-flex h-[34px] items-center justify-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-3 text-xs font-medium text-[#251912] transition-colors hover:bg-[#fff8f5]"
              type="button"
            >
              <Filter className="size-3.5" />
              Filter
            </button>
            <button
              className="inline-flex h-[34px] items-center justify-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-3 text-xs font-medium text-[#251912] transition-colors hover:bg-[#fff8f5]"
              type="button"
            >
              <ArrowUpDown className="size-3.5" />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[rgba(255,241,234,0.5)] text-left">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Form Name
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Responses
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form, index) => {
                const Icon = getFormIcon(form.name);
                const responseCount =
                  "responses" in form && Array.isArray(form.responses)
                    ? form.responses.length.toLocaleString()
                    : "-";
                const isArchived = form.status === "archived";
                const isDefaultLinkTarget = context.hotel.defaultFormId === form.id;

                return (
                  <tr
                    className={index === 0 ? "" : "border-t border-[#f5ded2]"}
                    key={form.id}
                  >
                    <td className="px-6 py-4">
                      <Link className="flex items-center gap-3" href={`/forms/${form.id}`}>
                        <div
                          className={`flex size-10 items-center justify-center rounded-lg ${getFormIconColors(
                            form.name,
                          )} ${isArchived ? "opacity-75" : ""}`}
                        >
                          <Icon className="size-[16px]" />
                        </div>
                        <div className={isArchived ? "opacity-75" : ""}>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#251912] transition-colors hover:text-[#974800]">
                              {form.name}
                            </p>
                            {isDefaultLinkTarget ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(151,72,0,0.18)] bg-[rgba(151,72,0,0.08)] px-2 py-0.5 text-[11px] font-medium leading-4 text-[#974800]">
                                <Link2 className="size-3" />
                                Default link
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[14px] leading-5 text-[#584235]">
                            {form.description}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          form.status === "published"
                            ? "border-[rgba(151,72,0,0.2)] bg-[rgba(151,72,0,0.1)] text-[#974800]"
                            : form.status === "draft"
                              ? "border-[#dfc0af] bg-[#f5ded2] text-[#584235]"
                              : "border-[#f5ded2] bg-[#ffeadf] text-[#584235] opacity-75"
                        }`}
                      >
                        {statusMap[form.status].label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-[14px] leading-5 text-[#584235] ${isArchived ? "opacity-75" : ""}`}>
                      {formatAppDate(form.createdAt)}
                    </td>
                    <td className={`px-6 py-4 text-right text-[14px] font-medium leading-5 text-[#251912] ${isArchived ? "opacity-75" : ""}`}>
                      {responseCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          className="text-sm font-medium text-[#584235] transition-colors hover:text-[#974800]"
                          href={`/forms/${form.id}/settings`}
                        >
                          Edit
                        </Link>
                        <Link
                          className="text-sm font-medium text-[#974800] transition-colors hover:text-[#7d3c00]"
                          href={`/forms/${form.id}/publish`}
                        >
                          Publish
                        </Link>
                        <DeleteFormButton formId={form.id} formName={form.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#f5ded2] bg-[rgba(255,248,245,0.5)] px-4 py-4 text-xs font-medium text-[#584235] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing 1 to {forms.length} of {forms.length} forms
          </p>

          <div className="flex items-center gap-1">
            <button
              className="inline-flex h-[18px] w-[14px] items-center justify-center rounded-md text-[#584235] opacity-50"
              disabled
              type="button"
            >
              ‹
            </button>
            {visiblePages.map((page) => (
              <button
                className={
                  page === 1
                    ? "inline-flex size-8 items-center justify-center rounded-md bg-[rgba(151,72,0,0.1)] text-xs font-medium text-[#974800]"
                    : "inline-flex size-8 items-center justify-center rounded-md text-xs font-medium text-[#584235]"
                }
                disabled={page === 1}
                key={page}
                type="button"
              >
                {page}
              </button>
            ))}
            <button
              className={`inline-flex h-[18px] w-[14px] items-center justify-center rounded-md text-[#584235] ${
                totalPages === 1 ? "opacity-50" : ""
              }`}
              disabled={totalPages === 1}
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
