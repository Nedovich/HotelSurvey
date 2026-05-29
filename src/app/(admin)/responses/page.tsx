import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Download,
  SmilePlus,
  Star,
} from "lucide-react";

import { AdminPageHeaderSlot } from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { ResponsesFilterBar } from "@/features/responses/components/responses-filter-bar";
import { getResponses } from "@/server/data";
import type { ResponseReviewPriority } from "@/generated/prisma";
import { formatAppDate, formatAppTime } from "@/lib/datetime";

type ResponseRecord = Awaited<ReturnType<typeof getResponses>>[number];

type ResponseSearchParams = Promise<Record<string, string | string[] | undefined>>;
type RangeFilter = "7d" | "30d" | "90d" | "all";
type ScoreFilter = "any" | "high" | "medium" | "low";

const isDatabaseResponse = (
  response: ResponseRecord,
): response is Extract<ResponseRecord, { form: { name: string } }> =>
  "form" in response;

const rangeOptions: Array<{ value: RangeFilter; label: string }> = [
  { value: "30d", label: "Last 30 Days" },
  { value: "7d", label: "Last 7 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

const scoreOptions: Array<{ value: ScoreFilter; label: string }> = [
  { value: "any", label: "Any Score" },
  { value: "high", label: "4-5 Stars" },
  { value: "medium", label: "3 Stars" },
  { value: "low", label: "1-2 Stars" },
];

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(value);

const getResponseScore = (response: ResponseRecord) => {
  if ("score" in response && typeof response.score === "number") {
    return response.score;
  }

  if ("scoreSummary" in response && typeof response.scoreSummary === "number") {
    return response.scoreSummary;
  }

  return 0;
};

const getResponseGuestName = (response: ResponseRecord) => {
  if ("guestName" in response && response.guestName) {
    return response.guestName;
  }

  if (isDatabaseResponse(response)) {
    const fullName =
      [response.respondentName, response.respondentSurname]
        .filter(Boolean)
        .join(" ")
        .trim() || "Guest";

    return fullName;
  }

  return "Guest";
};

const getResponseRoomLabel = (response: ResponseRecord) => {
  if ("room" in response && response.room) {
    return response.room;
  }

  if (isDatabaseResponse(response)) {
    return response.roomNumber?.trim() || "-";
  }

  return "-";
};

const getResponseSurveyName = (response: ResponseRecord) => {
  if ("surveyName" in response && response.surveyName) {
    return response.surveyName;
  }

  if (isDatabaseResponse(response)) {
    return response.form.name;
  }

  return "Survey";
};

const getResponseSourceLabel = (response: ResponseRecord) => {
  if (response.source === "captive_portal") {
    return "QR Code scan";
  }

  return "Standard flow";
};

const getGuestInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getInitialsTone = (name: string) => {
  const palette = [
    "bg-[#FDAC77] text-[#773E12]",
    "bg-[#FF7E00] text-[#5E2A00]",
    "bg-[#08AAFF] text-[#003C5E]",
    "bg-[#CDE5FF] text-[#0F3B66]",
    "bg-[#F8D7A8] text-[#73430E]",
  ];

  const seed = name
    .split("")
    .reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return palette[seed % palette.length];
};

const getDisplayStatus = (response: ResponseRecord) => {
  if (response.status === "rejected") {
    return {
      label: "Flagged",
      className: "bg-[#ffd8d3] text-[#b3261e]",
      dotClassName: "bg-[#ba1a1a]",
    };
  }

  return null;
};

const getResponsePriority = (response: ResponseRecord): ResponseReviewPriority => {
  if ("reviewPriority" in response && typeof response.reviewPriority === "string") {
    return response.reviewPriority as ResponseReviewPriority;
  }

  const score = Math.round(getResponseScore(response));
  if (score <= 2) return "high";
  if (score === 3) return "medium";
  return "low";
};

const getPriorityMeta = (priority: ResponseReviewPriority) => {
  if (priority === "high") {
    return {
      label: "High",
      className: "bg-[#fff0ee] text-[#ba1a1a]",
    };
  }

  if (priority === "medium") {
    return {
      label: "Medium",
      className: "bg-[#fff1e4] text-[#a85a08]",
    };
  }

  return {
    label: "Low",
    className: "bg-[#ecf8ee] text-[#2e7d32]",
  };
};

const filterResponses = (responses: ResponseRecord[], query: string) => {
  if (!query.trim()) {
    return responses;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return responses.filter((response) => {
    const haystack = [
      getResponseGuestName(response),
      getResponseRoomLabel(response),
      getResponseSurveyName(response),
      getResponseSourceLabel(response),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
};

const filterResponsesByRange = (
  responses: ResponseRecord[],
  range: RangeFilter,
) => {
  if (range === "all") {
    return responses;
  }

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);

  return responses.filter((response) => response.createdAt >= threshold);
};

const filterResponsesByScore = (
  responses: ResponseRecord[],
  scoreFilter: ScoreFilter,
) => {
  if (scoreFilter === "any") {
    return responses;
  }

  return responses.filter((response) => {
    const score = Math.round(getResponseScore(response));

    if (scoreFilter === "high") {
      return score >= 4;
    }

    if (scoreFilter === "medium") {
      return score === 3;
    }

    return score > 0 && score <= 2;
  });
};

const filterResponsesBySurvey = (
  responses: ResponseRecord[],
  surveyFilter: string,
) => {
  if (!surveyFilter || surveyFilter === "all") {
    return responses;
  }

  return responses.filter(
    (response) => getResponseSurveyName(response) === surveyFilter,
  );
};

const renderStars = (score: number) => {
  const filled = Math.max(0, Math.min(5, Math.round(score)));

  return Array.from({ length: 5 }, (_, index) => (
    <Star
      className={
        index < filled
          ? "size-4 fill-[#f59e0b] text-[#f59e0b]"
          : "size-4 fill-transparent text-[#f5ded2]"
      }
      key={`${score}-${index}`}
    />
  ));
};

export default async function ResponsesPage({
  searchParams,
}: {
  searchParams?: ResponseSearchParams;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const searchQuery = Array.isArray(resolvedSearchParams?.q)
    ? resolvedSearchParams?.q[0] ?? ""
    : resolvedSearchParams?.q ?? "";
  const rangeFilter = (
    Array.isArray(resolvedSearchParams?.range)
      ? resolvedSearchParams?.range[0]
      : resolvedSearchParams?.range
  ) as RangeFilter | undefined;
  const scoreFilter = (
    Array.isArray(resolvedSearchParams?.score)
      ? resolvedSearchParams?.score[0]
      : resolvedSearchParams?.score
  ) as ScoreFilter | undefined;
  const surveyFilter = Array.isArray(resolvedSearchParams?.survey)
    ? resolvedSearchParams?.survey[0] ?? "all"
    : resolvedSearchParams?.survey ?? "all";
  const activeRange: RangeFilter = rangeFilter ?? "30d";
  const activeScore: ScoreFilter = scoreFilter ?? "any";

  const responses = await getResponses();
  const surveyOptions = Array.from(
    new Set(responses.map((response) => getResponseSurveyName(response))),
  ).sort((a, b) => a.localeCompare(b));
  const filteredResponses = filterResponses(
    filterResponsesBySurvey(
      filterResponsesByScore(
        filterResponsesByRange(responses, activeRange),
        activeScore,
      ),
      surveyFilter,
    ),
    searchQuery,
  );
  const visibleResponses = filteredResponses.slice(0, 10);

  const scoredResponses = filteredResponses
    .map((response) => getResponseScore(response))
    .filter((score) => score > 0);

  const averageScore =
    scoredResponses.length > 0
      ? scoredResponses.reduce((sum, score) => sum + score, 0) /
        scoredResponses.length
      : 0;

  const completedResponses = filteredResponses.filter(
    (response) => response.status === "completed",
  ).length;
  const completionRate =
    filteredResponses.length > 0
      ? Math.round((completedResponses / filteredResponses.length) * 100)
      : 0;

  const attentionResponses = filteredResponses.filter(
    (response) => response.status === "rejected",
  );

  const attentionHref =
    attentionResponses.length > 0 ? `/responses/${attentionResponses[0].id}` : "#responses-table";

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeaderSlot>
        <div className="space-y-1">
          <h1 className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#974800]">
            Responses
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Review and manage guest feedback across all active surveys.
          </p>
        </div>
      </AdminPageHeaderSlot>

      <div className="flex justify-end">
        <Button
          className="h-10 self-start rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-[14px] font-semibold text-[#974800] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#fff1ea]"
          type="button"
          variant="outline"
        >
          <Download className="size-3.5" />
          Export
        </Button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-[#f5ded2] bg-[#fff8f5] p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
              Average Satisfaction
            </p>
            <div className="flex items-end gap-2">
              <span className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#974800]">
                {averageScore.toFixed(1)}
              </span>
              <span className="pb-1 text-sm font-semibold text-[#584235]">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#059669]">
              <ArrowUpRight className="size-3.5" />
              Based on recent completed responses
            </div>
          </div>
          <SmilePlus className="pointer-events-none absolute -top-5 right-2 size-28 text-[#d1fae5] opacity-50" />
        </div>

        <div className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
              Total Responses
            </p>
            <div className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#974800]">
              {formatCompactNumber(filteredResponses.length)}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-2 flex-1 rounded-full bg-[#f5ded2]">
              <div
                className="h-2 rounded-full bg-[#974800]"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm text-[#584235]">{completionRate}% completion</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#974800] p-6 text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-[0.6px] text-[#ffb688] uppercase">
              Attention Required
            </p>
            <div className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px]">
              {attentionResponses.length}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="max-w-[11rem] text-sm leading-5 text-[#ffb688]">
              Flagged reviews needing response
            </p>
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 text-xs font-medium text-white transition-colors hover:bg-white/20"
              href={attentionHref}
            >
              View Now
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#f5ded2] bg-[#fff8f5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <div className="border-b border-[#f5ded2] px-4 py-4">
          <ResponsesFilterBar
            initialQuery={searchQuery}
            initialRange={activeRange}
            initialScore={activeScore}
            initialSurvey={surveyFilter}
            rangeOptions={rangeOptions}
            scoreOptions={scoreOptions}
            surveyOptions={surveyOptions}
          />
        </div>

        <div className="overflow-x-auto" id="responses-table">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[#f5ded2] bg-white/50 text-left">
                {[
                  "Date & Time",
                  "Guest / Room",
                  "Survey Title",
                  "Overall Score",
                  "Status",
                  "",
                ].map((heading) => (
                  <th
                    className="px-6 py-4 text-xs font-medium tracking-[0.6px] text-[#584235] uppercase"
                    key={heading || "action"}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleResponses.length === 0 ? (
                <tr>
                  <td className="px-6 py-16 text-center text-sm text-[#8b7263]" colSpan={6}>
                    No responses matched your search.
                  </td>
                </tr>
              ) : (
                visibleResponses.map((response) => {
                  const guestName = getResponseGuestName(response);
                  const initials = getGuestInitials(guestName);
                  const room = getResponseRoomLabel(response);
                  const surveyName = getResponseSurveyName(response);
                  const sourceLabel = getResponseSourceLabel(response);
                  const score = getResponseScore(response);
                  const status = getDisplayStatus(response);
                  const priority = getPriorityMeta(getResponsePriority(response));

                  return (
                    <tr
                      className="border-t border-[#f5ded2] transition-colors hover:bg-white/40"
                      key={response.id}
                    >
                      <td className="px-6 py-4 align-middle">
                        <Link className="block" href={`/responses/${response.id}`}>
                          <div className="text-sm font-medium leading-5 text-[#251912]">
                            {formatAppDate(response.createdAt)}
                          </div>
                          <div className="text-xs font-medium leading-4 text-[#584235]">
                            {formatAppTime(response.createdAt)}
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <Link className="flex items-center gap-3" href={`/responses/${response.id}`}>
                          <div
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getInitialsTone(
                              guestName,
                            )}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-medium leading-5 text-[#251912] hover:text-[#974800]">
                              {guestName}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-[#584235]">
                              <BedDouble className="size-3" />
                              {room}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <Link className="block" href={`/responses/${response.id}`}>
                          <div className="text-sm leading-5 text-[#251912]">{surveyName}</div>
                          <div className="text-xs font-medium leading-4 text-[#584235]">
                            {sourceLabel}
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <Link className="block" href={`/responses/${response.id}`}>
                          <div className="flex items-center gap-1">{renderStars(score)}</div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <Link className="block" href={`/responses/${response.id}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            {status ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                              >
                                <span className={`size-1.5 rounded-full ${status.dotClassName}`} />
                                {status.label}
                              </span>
                            ) : null}
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priority.className}`}
                            >
                              {priority.label}
                            </span>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-right align-middle">
                        <Link
                          className="inline-flex items-center justify-center rounded-lg border border-[#dfc0af] px-3 py-2 text-xs font-semibold text-[#974800] transition-colors hover:bg-[#fff1ea]"
                          href={`/responses/${response.id}`}
                        >
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#f5ded2] px-4 py-4 text-sm text-[#584235] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {visibleResponses.length === 0 ? 0 : 1} to {visibleResponses.length} of{" "}
            {filteredResponses.length} results
          </p>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-[30px] items-center justify-center rounded-md border border-[#dfc0af] px-3 text-sm text-[#584235] opacity-50"
              disabled
              type="button"
            >
              Previous
            </button>
            <button
              className="inline-flex h-[30px] items-center justify-center rounded-md border border-[#dfc0af] px-3 text-sm text-[#584235]"
              disabled={filteredResponses.length <= visibleResponses.length}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {attentionResponses.length > 0 ? (
        <section className="rounded-xl border border-[#f5ded2] bg-[#fff1ea] p-4 text-sm text-[#7b3f05]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#b45309]" />
              <p>
                {attentionResponses.length} response
                {attentionResponses.length === 1 ? "" : "s"} currently need manual
                review or follow-up.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#974800] hover:underline"
              href={attentionHref}
            >
              Open first flagged response
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
