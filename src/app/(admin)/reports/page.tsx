import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Download,
  MessageSquareWarning,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { AdminPageHeaderSlot } from "@/components/admin-page-header";
import { getResponses } from "@/server/data";

type ResponseRecord = Awaited<ReturnType<typeof getResponses>>[number];
type ReportsSearchParams = Promise<Record<string, string | string[] | undefined>>;

type DepartmentKey =
  | "Housekeeping"
  | "Front Desk"
  | "Food & Beverage"
  | "Spa & Wellness"
  | "Maintenance";

type SentimentKey = "positive" | "neutral" | "negative";

const DATE_RANGE_OPTIONS = [
  { value: 7, label: "Last 7 Days" },
  { value: 30, label: "Last 30 Days" },
  { value: 90, label: "Last 90 Days" },
  { value: 365, label: "Last 12 Months" },
] as const;

const DEPARTMENT_STYLES: Record<
  DepartmentKey,
  { barClassName: string; dotClassName: string }
> = {
  Housekeeping: {
    barClassName: "bg-[#974800]",
    dotClassName: "bg-[#974800]",
  },
  "Front Desk": {
    barClassName: "bg-[#8D4E22]",
    dotClassName: "bg-[#8D4E22]",
  },
  "Food & Beverage": {
    barClassName: "bg-[#006398]",
    dotClassName: "bg-[#006398]",
  },
  "Spa & Wellness": {
    barClassName: "bg-[#B56308]",
    dotClassName: "bg-[#B56308]",
  },
  Maintenance: {
    barClassName: "bg-[#8B7263]",
    dotClassName: "bg-[#8B7263]",
  },
};

const DEPARTMENT_KEYWORDS: Record<DepartmentKey, string[]> = {
  Housekeeping: [
    "housekeeping",
    "clean",
    "cleaning",
    "dirty",
    "towel",
    "linen",
    "sheet",
    "pillow",
    "room service",
  ],
  "Front Desk": [
    "front desk",
    "reception",
    "receptionist",
    "check-in",
    "check in",
    "check-out",
    "check out",
    "valet",
    "concierge",
    "lobby",
  ],
  "Food & Beverage": [
    "breakfast",
    "buffet",
    "restaurant",
    "food",
    "beverage",
    "bar",
    "dinner",
    "lunch",
    "meal",
    "coffee",
  ],
  "Spa & Wellness": [
    "spa",
    "massage",
    "wellness",
    "sauna",
    "steam room",
    "pool",
    "gym",
    "fitness",
  ],
  Maintenance: [
    "ac",
    "air conditioning",
    "noise",
    "noisy",
    "broken",
    "maintenance",
    "wifi",
    "internet",
    "shower",
    "plumbing",
    "light",
    "elevator",
    "tv",
  ],
};

const ISSUE_CATALOG = [
  {
    key: "ac-noise",
    label: "AC Noise",
    department: "Maintenance" as const,
    keywords: ["ac", "air conditioning", "noise", "noisy"],
  },
  {
    key: "slow-checkin",
    label: "Slow Check-in",
    department: "Front Desk" as const,
    keywords: ["check-in", "check in", "reception", "queue", "valet"],
  },
  {
    key: "breakfast-variety",
    label: "Breakfast Variety",
    department: "Food & Beverage" as const,
    keywords: ["breakfast", "buffet", "food", "empty"],
  },
  {
    key: "room-cleanliness",
    label: "Room Cleanliness",
    department: "Housekeeping" as const,
    keywords: ["clean", "dirty", "towel", "linen", "sheet"],
  },
  {
    key: "spa-availability",
    label: "Spa Availability",
    department: "Spa & Wellness" as const,
    keywords: ["spa", "massage", "sauna", "pool", "gym"],
  },
] as const;

const POSITIVE_WORDS = [
  "great",
  "excellent",
  "amazing",
  "friendly",
  "perfect",
  "clean",
  "comfortable",
  "good",
  "lovely",
  "helpful",
];

const NEGATIVE_WORDS = [
  "bad",
  "poor",
  "dirty",
  "slow",
  "late",
  "broken",
  "noise",
  "noisy",
  "empty",
  "issue",
  "problem",
  "wait",
  "cold",
];

const isDatabaseResponse = (
  response: ResponseRecord,
): response is Extract<ResponseRecord, { createdAt: Date; form: { name: string } }> =>
  "form" in response;

const getResponseDate = (response: ResponseRecord) =>
  "createdAt" in response ? response.createdAt : new Date();

const getRawScore = (response: ResponseRecord) => {
  if ("score" in response && typeof response.score === "number") {
    return response.score;
  }

  if ("scoreSummary" in response && typeof response.scoreSummary === "number") {
    return response.scoreSummary;
  }

  return 0;
};

const normalizeScoreToTen = (score: number) => {
  if (score <= 0) {
    return 0;
  }

  return score <= 5 ? score * 2 : score;
};

const normalizeScoreToFive = (score: number) => {
  if (score <= 0) {
    return 0;
  }

  return score > 5 ? score / 2 : score;
};

const average = (values: number[]) =>
  values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const roundToOne = (value: number) => Math.round(value * 10) / 10;

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);

const extractStrings = (value: unknown): string[] => {
  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractStrings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(extractStrings);
  }

  return [];
};

const getResponseTextCorpus = (response: ResponseRecord) => {
  if (!isDatabaseResponse(response)) {
    return response.notes ? [response.notes] : [];
  }

  const answers = extractStrings(response.answers);
  const formName = response.form.name ? [response.form.name] : [];
  return [...answers, ...formName];
};

const getResponseStatus = (response: ResponseRecord) => response.status;

const classifySentiment = (
  response: ResponseRecord,
  texts: string[],
): SentimentKey => {
  const score = getRawScore(response);
  const corpus = texts.join(" ").toLowerCase();

  const positiveMatches = POSITIVE_WORDS.filter((word) => corpus.includes(word)).length;
  const negativeMatches = NEGATIVE_WORDS.filter((word) => corpus.includes(word)).length;

  if (negativeMatches > positiveMatches || score <= 2) {
    return "negative";
  }

  if (positiveMatches > negativeMatches || score >= 4) {
    return "positive";
  }

  return "neutral";
};

const getMatchedDepartments = (texts: string[]) => {
  const corpus = texts.join(" ").toLowerCase();

  return (Object.entries(DEPARTMENT_KEYWORDS) as [DepartmentKey, string[]][])
    .filter(([, keywords]) => keywords.some((keyword) => corpus.includes(keyword)))
    .map(([department]) => department);
};

const getMatchedIssues = (texts: string[]) => {
  const corpus = texts.join(" ").toLowerCase();

  return ISSUE_CATALOG.filter((issue) =>
    issue.keywords.some((keyword) => corpus.includes(keyword)),
  );
};

const buildDateRange = (days: number) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const formatCsvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: ReportsSearchParams;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rangeParam = Array.isArray(resolvedSearchParams.range)
    ? resolvedSearchParams.range[0]
    : resolvedSearchParams.range;

  const selectedRangeDays =
    DATE_RANGE_OPTIONS.find((option) => String(option.value) === rangeParam)?.value ?? 30;
  const selectedRangeLabel =
    DATE_RANGE_OPTIONS.find((option) => option.value === selectedRangeDays)?.label ??
    "Last 30 Days";

  const allResponses = await getResponses();
  const currentRange = buildDateRange(selectedRangeDays);
  const previousRange = buildDateRange(selectedRangeDays * 2);

  const filteredResponses = allResponses.filter((response) => {
    const date = getResponseDate(response);
    return date >= currentRange.start && date <= currentRange.end;
  });

  const previousResponses = allResponses.filter((response) => {
    const date = getResponseDate(response);
    return date >= previousRange.start && date < currentRange.start;
  });

  const scoredCurrent = filteredResponses
    .map((response) => getRawScore(response))
    .filter((score) => score > 0);
  const scoredPrevious = previousResponses
    .map((response) => getRawScore(response))
    .filter((score) => score > 0);

  const csatTen = roundToOne(average(scoredCurrent.map(normalizeScoreToTen)));
  const previousCsatTen = roundToOne(average(scoredPrevious.map(normalizeScoreToTen)));
  const csatDelta = roundToOne(csatTen - previousCsatTen);

  const npsInput = filteredResponses
    .map((response) => normalizeScoreToTen(getRawScore(response)))
    .filter((score) => score > 0);
  const promoterCount = npsInput.filter((score) => score >= 9).length;
  const detractorCount = npsInput.filter((score) => score <= 6).length;
  const nps =
    npsInput.length > 0
      ? Math.round(((promoterCount - detractorCount) / npsInput.length) * 100)
      : 0;

  const completedCount = filteredResponses.filter(
    (response) => getResponseStatus(response) === "completed",
  ).length;
  const abandonedCount = filteredResponses.filter(
    (response) => getResponseStatus(response) !== "completed",
  ).length;
  const completionRate =
    filteredResponses.length > 0
      ? Math.round((completedCount / filteredResponses.length) * 100)
      : 0;

  const responseInsights = filteredResponses.map((response) => {
    const texts = getResponseTextCorpus(response);
    const scoreFive = normalizeScoreToFive(getRawScore(response));

    return {
      response,
      texts,
      departments: getMatchedDepartments(texts),
      issues: getMatchedIssues(texts),
      sentiment: classifySentiment(response, texts),
      scoreFive,
      scoreTen: normalizeScoreToTen(getRawScore(response)),
    };
  });

  const trendBuckets = Array.from({ length: 5 }, (_, index) => {
    const start = new Date(currentRange.start);
    start.setDate(currentRange.start.getDate() + index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const responses = filteredResponses.filter((response) => {
      const date = getResponseDate(response);
      return date >= start && date <= end;
    });

    const score = roundToOne(
      average(responses.map((response) => normalizeScoreToTen(getRawScore(response)))),
    );

    return {
      label: `Wk ${index + 1}`,
      score,
    };
  });

  const chartMax = Math.max(10, ...trendBuckets.map((bucket) => bucket.score));
  const chartPoints = trendBuckets.map((bucket, index) => {
    const x = (index / Math.max(1, trendBuckets.length - 1)) * 100;
    const y = 100 - (bucket.score / chartMax) * 100;
    return { ...bucket, x, y };
  });

  const departmentPerformance = (
    Object.keys(DEPARTMENT_KEYWORDS) as DepartmentKey[]
  ).map((department) => {
    const scores = responseInsights
      .filter((item) => item.departments.includes(department))
      .map((item) => item.scoreTen)
      .filter((score) => score > 0);

    const score = roundToOne(average(scores));

    return {
      department,
      score,
      hasData: scores.length > 0,
      ...DEPARTMENT_STYLES[department],
    };
  });

  const sentimentCounts = responseInsights.reduce(
    (accumulator, item) => {
      accumulator[item.sentiment] += 1;
      return accumulator;
    },
    { positive: 0, neutral: 0, negative: 0 } as Record<SentimentKey, number>,
  );

  const sentimentTotal = Math.max(
    1,
    sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative,
  );

  const sentimentPercentages = {
    positive: Math.round((sentimentCounts.positive / sentimentTotal) * 100),
    neutral: Math.round((sentimentCounts.neutral / sentimentTotal) * 100),
    negative: Math.round((sentimentCounts.negative / sentimentTotal) * 100),
  };

  const issueMap = new Map<
    string,
    {
      label: string;
      department: DepartmentKey;
      frequency: number;
      scores: number[];
    }
  >();

  for (const item of responseInsights) {
    for (const issue of item.issues) {
      const existing = issueMap.get(issue.key) ?? {
        label: issue.label,
        department: issue.department,
        frequency: 0,
        scores: [],
      };

      existing.frequency += 1;
      if (item.scoreFive > 0) {
        existing.scores.push(item.scoreFive);
      }

      issueMap.set(issue.key, existing);
    }
  }

  const issueRows = Array.from(issueMap.values())
    .map((issue) => ({
      ...issue,
      impact: roundToOne(average(issue.scores) - 5),
      dotClassName: DEPARTMENT_STYLES[issue.department].dotClassName,
    }))
    .sort((left, right) => right.frequency - left.frequency)
    .slice(0, 5);

  const issuesCsv = [
    [
      "Date",
      "Form",
      "Guest",
      "Room",
      "Status",
      "Score",
      "Notes",
    ].join(","),
    ...filteredResponses.map((response) => {
      const date = getResponseDate(response).toISOString();
      const formName = isDatabaseResponse(response)
        ? response.form.name
        : response.surveyName;
      const guestName = isDatabaseResponse(response)
        ? [response.respondentName, response.respondentSurname].filter(Boolean).join(" ") ||
          "Guest"
        : response.guestName;
      const room = isDatabaseResponse(response)
        ? response.roomNumber ?? "-"
        : response.room;
      const notes = getResponseTextCorpus(response).join(" | ");

      return [
        formatCsvValue(date),
        formatCsvValue(formName),
        formatCsvValue(guestName),
        formatCsvValue(room),
        formatCsvValue(response.status),
        formatCsvValue(getRawScore(response)),
        formatCsvValue(notes),
      ].join(",");
    }),
  ].join("\n");

  const exportHref = `data:text/csv;charset=utf-8,${encodeURIComponent(issuesCsv)}`;

  return (
    <div className="space-y-12 pb-10">
      <AdminPageHeaderSlot>
        <div className="space-y-1">
          <h1 className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#251912]">
            Reports
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Comprehensive overview of guest feedback and property performance.
          </p>
        </div>
      </AdminPageHeaderSlot>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="inline-flex h-[35px] items-center gap-2 rounded-lg border border-[#dfc0af] bg-white px-3 text-sm font-semibold text-[#251912] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <CalendarDays className="size-4 text-[#584235]" />
          {selectedRangeLabel}
          <ChevronDown className="size-4 text-[#584235]" />
        </div>
        <a
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#7d3b00]"
          download={`reports-${selectedRangeDays}d.csv`}
          href={exportHref}
        >
          <Download className="size-3.5" />
          Export Report
        </a>
      </div>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(252,125,0,0.03)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold tracking-[0.7px] text-[#584235] uppercase">
              Net Promoter Score
            </p>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#fe7f0333]">
              <TrendingUp className="size-4 text-[#974800]" />
            </div>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="font-heading text-5xl leading-[48px] font-bold text-[#251912]">
              {nps}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2 py-1 text-sm font-medium text-[#2e7d32]">
              <TrendingUp className="size-3.5" />
              {nps >= 0 ? `+${Math.abs(nps)}` : nps} pts
            </span>
          </div>
          <p className="mt-3 text-sm leading-5 text-[#584235]">
            Based on current satisfaction ratings normalized to a 10-point advocacy scale.
          </p>
        </article>

        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(252,125,0,0.03)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold tracking-[0.7px] text-[#584235] uppercase">
              Overall CSAT
            </p>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#08aaff33]">
              <Star className="size-4 fill-transparent text-[#006398]" />
            </div>
          </div>
          <div className="mt-5 flex items-end">
            <span className="font-heading text-5xl leading-[48px] font-bold text-[#251912]">
              {csatTen.toFixed(1)}
            </span>
            <span className="pb-1 text-[24px] leading-8 font-semibold text-[#584235]">/10</span>
          </div>
          <div className="mt-3 border-t border-[#f5ded2] pt-3 text-sm text-[#584235]">
            vs. previous period:
            <span className="ml-2 font-bold text-[#974800]">
              {csatDelta >= 0 ? "+" : ""}
              {csatDelta.toFixed(1)}
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_4px_6px_-1px_rgba(252,125,0,0.03)]">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold tracking-[0.7px] text-[#584235] uppercase">
              Total Responses
            </p>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#fdab7733]">
              <MessageSquareWarning className="size-4 text-[#8D4E22]" />
            </div>
          </div>
          <div className="mt-5 font-heading text-5xl leading-[48px] font-bold text-[#251912]">
            {formatCompactNumber(filteredResponses.length)}
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#f5ded2]">
            <div
              className="h-full bg-[#974800]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-bold text-[#974800]">{completionRate}% Completed</span>
            <span className="font-medium text-[#584235]">
              {filteredResponses.length > 0
                ? Math.round((abandonedCount / filteredResponses.length) * 100)
                : 0}
              % Abandoned
            </span>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_320px]">
        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#251912]">
              Satisfaction Trend
            </h2>
            <button
              className="text-[#584235]"
              type="button"
            >
              •••
            </button>
          </div>
          <div className="mt-6">
            <svg
              aria-label="Satisfaction trend chart"
              className="h-[320px] w-full"
              viewBox="0 0 640 320"
            >
              <defs>
                <linearGradient
                  id="trend-fill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(254, 127, 3, 0.22)"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgba(254, 127, 3, 0)"
                  />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3, 4].map((line) => (
                <line
                  key={`grid-${line}`}
                  stroke="#ffe9dd"
                  strokeDasharray="4 4"
                  x1="24"
                  x2="616"
                  y1={36 + line * 56}
                  y2={36 + line * 56}
                />
              ))}

              <line
                stroke="#f5ded2"
                x1="24"
                x2="24"
                y1="36"
                y2="280"
              />
              <line
                stroke="#f5ded2"
                x1="24"
                x2="616"
                y1="280"
                y2="280"
              />

              {chartPoints.length > 0 ? (
                <>
                  <path
                    d={`M 24 280 L ${chartPoints
                      .map(
                        (point) =>
                          `${24 + (point.x / 100) * 592} ${36 + (point.y / 100) * 244}`,
                      )
                      .join(" L ")} L 616 280 Z`}
                    fill="url(#trend-fill)"
                  />
                  <polyline
                    fill="none"
                    points={chartPoints
                      .map(
                        (point) =>
                          `${24 + (point.x / 100) * 592},${36 + (point.y / 100) * 244}`,
                      )
                      .join(" ")}
                    stroke="#974800"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="8"
                  />
                  {chartPoints.map((point) => (
                    <circle
                      cx={24 + (point.x / 100) * 592}
                      cy={36 + (point.y / 100) * 244}
                      fill="#ffffff"
                      key={point.label}
                      r="8"
                      stroke="#974800"
                      strokeWidth="6"
                    />
                  ))}
                </>
              ) : null}

              {[10, 8, 6, 4, 2].map((tick, index) => (
                <text
                  fill="#584235"
                  fontSize="12"
                  key={`tick-${tick}`}
                  textAnchor="end"
                  x="14"
                  y={40 + index * 56}
                >
                  {tick}
                </text>
              ))}

              {chartPoints.map((point) => (
                <text
                  fill="#584235"
                  fontSize="12"
                  key={`label-${point.label}`}
                  textAnchor="middle"
                  x={24 + (point.x / 100) * 592}
                  y="304"
                >
                  {point.label}
                </text>
              ))}
            </svg>
          </div>
        </article>

        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#251912]">
              Dept Performance
            </h2>
            <div className="text-[#584235]">☰</div>
          </div>

          <div className="mt-8 space-y-6">
            {departmentPerformance.map((item) => (
              <div
                className="space-y-2"
                key={item.department}
              >
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#251912]">
                  <span>{item.department}</span>
                  <span className="text-[#584235]">
                    {item.hasData ? item.score.toFixed(1) : "No data"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f5ded2]">
                  <div
                    className={`h-full rounded-full ${item.barClassName}`}
                    style={{ width: `${item.hasData ? Math.max(item.score * 10, 8) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <article className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#251912]">
              Sentiment Analysis
            </h2>
            <CircleAlert className="size-4 text-[#584235]" />
          </div>

          <div className="mt-24 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#974800]">
                  {sentimentPercentages.positive}%
                </div>
                <div className="text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
                  Positive
                </div>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl leading-8 font-semibold text-[#8D4E22]">
                  {sentimentPercentages.neutral}%
                </div>
                <div className="text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
                  Neutral
                </div>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl leading-8 font-semibold text-[#BA1A1A]">
                  {sentimentPercentages.negative}%
                </div>
                <div className="text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
                  Negative
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-full border border-[#f5ded2] shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)]">
              <div className="flex h-[14px]">
                <div
                  className="bg-[#974800]"
                  style={{ width: `${sentimentPercentages.positive}%` }}
                />
                <div
                  className="bg-[#fdab77]"
                  style={{ width: `${sentimentPercentages.neutral}%` }}
                />
                <div
                  className="bg-[#ffd8d3]"
                  style={{ width: `${sentimentPercentages.negative}%` }}
                />
              </div>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between border-b border-[#f5ded2] bg-[#fff8f5] px-6 py-5">
            <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#251912]">
              Common Guest Issues
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ffd8d3] px-3 py-1 text-xs font-medium text-[#93000A]">
              <Sparkles className="size-3.5" />
              Needs Attention
            </span>
          </div>

          <div className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr] border-b border-[#f5ded2] bg-[#fff1ea] px-6 py-4 text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
            <div>Keyword / Issue</div>
            <div>Frequency</div>
            <div>Avg Impact</div>
            <div className="text-right">Department</div>
          </div>

          <div>
            {issueRows.length > 0 ? (
              issueRows.map((issue) => (
                <div
                  className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr] items-center border-b border-[#f5ded2] px-6 py-5"
                  key={`${issue.label}-${issue.department}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`size-2 rounded-full ${issue.dotClassName}`} />
                    <span className="text-[14px] leading-5 font-medium text-[#251912]">
                      {issue.label}
                    </span>
                  </div>
                  <div className="text-[14px] leading-5 text-[#251912]">
                    {issue.frequency} Mentions
                  </div>
                  <div className="text-[14px] leading-5 font-medium text-[#BA1A1A]">
                    {issue.impact >= 0 ? "+" : ""}
                    {issue.impact.toFixed(1)} pts
                  </div>
                  <div className="text-right text-[14px] leading-5 text-[#584235]">
                    {issue.department}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-sm text-[#584235]">
                Not enough issue-tagged feedback yet for this period.
              </div>
            )}
          </div>

          <div className="bg-[#fff8f5] px-6 py-4 text-center">
            <Link
              className="text-sm font-semibold text-[#974800]"
              href="/responses"
            >
              View all issues
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
