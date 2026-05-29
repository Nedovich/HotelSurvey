import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  Mail,
  MessageSquareQuote,
  Pencil,
  ShieldCheck,
  Star,
  Wifi,
} from "lucide-react";

import { AdminPageHeaderSlot } from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { CopyPublicLinkButton } from "@/features/forms/components/copy-public-link-button";
import {
  buildPublicSurveyUrl,
  resolvePublicSlug,
} from "@/features/forms/publication";
import { formatAppDate } from "@/lib/datetime";
import { getFormById, getResponses } from "@/server/data";

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 60) {
    return `${Math.max(minutes, 1)} mins ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function getStatusBadge(status: string) {
  if (status === "published") {
    return {
      label: "Published",
      className: "bg-[#cde5ff] text-[#001d31]",
    };
  }

  if (status === "draft") {
    return {
      label: "Draft",
      className: "bg-[#ffeadf] text-[#5e2a00]",
    };
  }

  return {
    label: "Archived",
    className: "bg-[#f1f5f9] text-[#475569]",
  };
}

function getScorePill(score: number) {
  if (score >= 4.5) {
    return "bg-[#cde5ff] text-[#001d31]";
  }

  if (score >= 3) {
    return "bg-[#ffdbc8] text-[#311300]";
  }

  return "bg-[#ffdada] text-[#93000a]";
}

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const [form, responses] = await Promise.all([getFormById(formId), getResponses()]);

  if (!form) {
    return <div>Form not found.</div>;
  }

  const filteredResponses = responses
    .filter((response) => {
      if ("form" in response && response.form) {
        return response.form.id === form.id;
      }

      if ("surveyName" in response) {
        return response.surveyName === form.name;
      }

      return false;
    })
    .map((response) => ({
      id: response.id,
      guest:
        "respondentName" in response
          ? (response.respondentName ?? "Guest")
          : ("guestName" in response ? response.guestName : "Guest"),
      room:
        "roomNumber" in response
          ? (response.roomNumber ?? "-")
          : ("room" in response ? response.room : "-"),
      score:
        "scoreSummary" in response
          ? (response.scoreSummary ?? 0)
          : ("score" in response ? response.score : 0),
      status: response.status,
      createdAt: response.createdAt,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const totalResponses = filteredResponses.length;
  const completedResponses = filteredResponses.filter(
    (response) => response.status === "completed",
  ).length;
  const completionRate =
    totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;
  const averageScore =
    totalResponses > 0
      ? (
          filteredResponses.reduce((sum, response) => sum + response.score, 0) /
          totalResponses
        ).toFixed(1)
      : "0.0";
  const lastResponseAt = filteredResponses[0]?.createdAt ?? form.updatedAt;
  const publication =
    "publications" in form && Array.isArray(form.publications)
      ? form.publications[0]
      : null;
  const publicSlug = resolvePublicSlug(
    form.name,
    form.id,
    publication?.publicSlug,
  );
  const publicUrl = buildPublicSurveyUrl(publicSlug);
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 220,
    color: {
      dark: "#3f2a19",
      light: "#fff7f2",
    },
  });
  const statusBadge = getStatusBadge(form.status);
  const accessSummary =
    publication?.mode === "captive_portal"
      ? "Captive portal access is active for hotel Wi‑Fi guests."
      : "Room number + birth date validation is active for direct guest access.";
  const expirySummary =
    publication?.endsAt
      ? `Active until ${formatAppDate(publication.endsAt)}.`
      : "No expiration date. Survey remains live until you disable it.";

  return (
    <div className="space-y-12">
      <AdminPageHeaderSlot>
        <div className="flex min-w-0 items-center gap-4">
          <Link
            aria-label="Back to forms"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#584235] transition-colors hover:bg-[#f5ded2]/60"
            href="/forms"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#251912]">
              {form.name}
            </h1>
          </div>
        </div>
      </AdminPageHeaderSlot>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.className}`}
        >
          <CheckCircle2 className="size-[11px]" />
          {statusBadge.label}
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/forms/${form.id}/settings`}>
            <Button
              className="rounded-lg border-[#8b7263] text-[#974800] hover:bg-[#fff8f5]"
              type="button"
              variant="outline"
            >
              <Pencil className="size-[13.5px]" />
              Edit Form
            </Button>
          </Link>
          <Link href={`/forms/${form.id}/publish`}>
            <Button className="rounded-lg bg-[#974800] text-white hover:bg-[#824000]" type="button">
              <BarChart3 className="size-3.5" />
              View Analytics
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between border-b border-[#f5ded2] pb-2">
            <p className="text-xs font-medium tracking-[0.6px] uppercase text-[#584235]">
              Total Responses
            </p>
            <MessageSquareQuote className="size-5 text-[#974800]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
              {totalResponses.toLocaleString()}
            </span>
            <span className="pb-1 text-xs font-medium text-[#fdab77]">+12%</span>
          </div>
        </article>

        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between border-b border-[#f5ded2] pb-2">
            <p className="text-xs font-medium tracking-[0.6px] uppercase text-[#584235]">
              Completion Rate
            </p>
            <CheckCircle2 className="size-5 text-[#974800]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
              {completionRate}%
            </span>
            <span className="pb-1 text-xs font-medium text-[#584235]">Avg 2m 14s</span>
          </div>
        </article>

        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between border-b border-[#f5ded2] pb-2">
            <p className="text-xs font-medium tracking-[0.6px] uppercase text-[#584235]">
              Average Score
            </p>
            <Star className="size-5 text-[#974800]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
              {averageScore}
            </span>
            <span className="pb-1 text-xs font-medium text-[#584235]">/ 5.0</span>
          </div>
        </article>

        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex items-center justify-between border-b border-[#f5ded2] pb-2">
            <p className="text-xs font-medium tracking-[0.6px] uppercase text-[#584235]">
              Last Response
            </p>
            <Clock3 className="size-5 text-[#974800]" />
          </div>
          <span className="font-heading text-[24px] font-semibold leading-8 text-[#251912]">
            {formatRelativeTime(lastResponseAt)}
          </span>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_376px]">
        <div className="space-y-6">
          <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
            Distribution & Sharing
          </h2>

          <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fe7f03] text-[#5d2a00]">
                <Link2 className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-[0.14px] text-[#251912]">
                    Public Link
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-[#584235]">
                    Share this link directly with guests via your own channels.
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-lg border border-[#f5ded2] bg-[#fff1ea] p-1 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 px-3 py-2 text-sm text-[#251912]">
                    <p className="truncate">{publicUrl}</p>
                  </div>
                  <div className="pr-1">
                    <CopyPublicLinkButton url={publicUrl} />
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-6 md:grid-cols-[252px_minmax(0,1fr)]">
            <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="border-b border-[#f5ded2] pb-2 text-sm font-semibold tracking-[0.14px] text-[#251912]">
                QR Code
              </h3>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex size-32 items-center justify-center rounded-lg border border-[#f5ded2] bg-[#ffeadf] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Survey QR"
                    className="size-full rounded-md object-cover mix-blend-multiply"
                    src={qrDataUrl}
                  />
                </div>
                <div className="flex gap-2">
                  <a download={`${publicSlug}.png`} href={qrDataUrl}>
                    <Button
                      className="h-[30px] rounded-md border-[#dfc0af] px-3 text-xs font-medium text-[#584235] hover:bg-[#fff8f5]"
                      type="button"
                      variant="outline"
                    >
                      PNG
                    </Button>
                  </a>
                  <a download={`${publicSlug}.svg`} href={qrDataUrl}>
                    <Button
                      className="h-[30px] rounded-md border-[#dfc0af] px-3 text-xs font-medium text-[#584235] hover:bg-[#fff8f5]"
                      type="button"
                      variant="outline"
                    >
                      SVG
                    </Button>
                  </a>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="border-b border-[#f5ded2] pb-2 text-sm font-semibold tracking-[0.14px] text-[#251912]">
                Active Channels
              </h3>
              <div className="space-y-4 pt-4">
                {[
                  { icon: Mail, label: "E-mail Campaigns", active: true },
                  { icon: Copy, label: "SMS Notifications", active: false },
                  { icon: Wifi, label: "Captive Portal", active: true },
                ].map((channel) => {
                  const Icon = channel.icon;

                  return (
                    <div
                      className={`flex items-center justify-between ${channel.active ? "" : "opacity-50"}`}
                      key={channel.label}
                    >
                      <div className="flex items-center gap-3 text-[#251912]">
                        <Icon className="size-5 text-[#584235]" />
                        <span className="text-[14px] leading-5">{channel.label}</span>
                      </div>
                      <span
                        className={`size-2 rounded-full ${channel.active ? "bg-[#08aaff] shadow-[0px_0px_8px_rgba(8,170,255,0.5)]" : "bg-[#f5ded2]"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
            Form Summary
          </h2>

          <article className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f5ded2] bg-[#fff1ea] px-6 py-3">
              <p className="text-sm font-semibold tracking-[0.14px] text-[#251912]">
                Quick Preview
              </p>
              <Link
                className="text-[#974800] transition-colors hover:text-[#7d3c00]"
                href={`/forms/${form.id}/preview`}
              >
                <ExternalLink className="size-4" />
              </Link>
            </div>
            <div className="space-y-4 bg-[#fff8f5] px-6 py-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-[#584235]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-[0.14px] text-[#251912]">
                    Access Control
                  </p>
                  <p className="text-sm leading-5 text-[#584235]">{accessSummary}</p>
                </div>
              </div>
              <div className="border-t border-[#f5ded2]" />
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 text-[#584235]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-[0.14px] text-[#251912]">
                    Availability Window
                  </p>
                  <p className="text-sm leading-5 text-[#584235]">{expirySummary}</p>
                </div>
              </div>
              <div className="border-t border-[#f5ded2]" />
              <div className="flex gap-3">
                <Globe2 className="mt-0.5 size-4 text-[#584235]" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-[0.14px] text-[#251912]">
                    Supported Languages (4)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["TR", "EN", "DE", "RU"].map((locale) => (
                      <span
                        className="rounded bg-[#ffeadf] px-2 py-0.5 text-xs font-medium text-[#251912]"
                        key={locale}
                      >
                        {locale}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
            Recent Responses
          </h2>
          <Link
            className="inline-flex items-center gap-1 text-sm font-semibold tracking-[0.14px] text-[#974800] hover:text-[#7d3c00]"
            href="/responses"
          >
            View all
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5ded2] bg-[#fff1ea] text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Guest
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Room
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Score
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.slice(0, 3).map((response, index) => (
                <tr
                  className={index === 0 ? "" : "border-t border-[#f5ded2]"}
                  key={response.id}
                >
                  <td className="px-4 py-6 text-[14px] font-medium text-[#251912]">
                    {response.guest}
                  </td>
                  <td className="px-4 py-6 text-[14px] text-[#584235]">{response.room}</td>
                  <td className="px-4 py-6">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${getScorePill(
                        response.score,
                      )}`}
                    >
                      {response.score.toFixed(1)}
                      <Star className="size-3" />
                    </span>
                  </td>
                  <td className="px-4 py-6 text-[14px] text-[#584235]">
                    {formatRelativeTime(response.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      className="inline-flex size-8 items-center justify-center rounded-md text-[#974800] transition-colors hover:bg-[#fff1ea]"
                      href={`/responses/${response.id}`}
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
