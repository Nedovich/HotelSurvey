import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  FileDown,
  Flag,
  MonitorSmartphone,
  Printer,
  ShieldCheck,
  Square,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";

import { AdminPageHeaderSlot } from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  toggleResponseFlagAction,
  updateResponseReviewAction,
} from "@/features/responses/actions";
import { ResponseReviewForm } from "@/features/responses/components/response-review-form";
import { formatAppDate, formatAppDateTime } from "@/lib/datetime";
import { getResponseById } from "@/server/data";
import type { ResponseReviewPriority } from "@/generated/prisma";

type ResponseRecord = NonNullable<Awaited<ReturnType<typeof getResponseById>>>;

type SurveyQuestionDefinition = {
  name: string;
  title: string;
  type: string;
  rateMax?: number;
  choiceLabels?: Record<string, string>;
  rowLabels?: Record<string, string>;
};

type QuestionItem =
  | {
      kind: "rating";
      name: string;
      title: string;
      answer: number;
      max: number;
    }
  | {
      kind: "matrix";
      name: string;
      title: string;
      rows: Array<{
        label: string;
        rawValue: unknown;
      }>;
    }
  | {
      kind: "list";
      name: string;
      title: string;
      items: string[];
    }
  | {
      kind: "text";
      name: string;
      title: string;
      answer: string;
    }
  | {
      kind: "value";
      name: string;
      title: string;
      answer: string;
    }
  | {
      kind: "boolean";
      name: string;
      title: string;
      answer: boolean;
    };

type ResponseDetailViewModel = {
  id: string;
  title: string;
  guestName: string;
  guestInitials: string;
  room: string;
  roomLabel: string;
  countryLabel: string;
  stayDates: string;
  submittedLabel: string;
  score: number;
  scoreDisplay: string;
  statusLabel: string;
  isFlagged: boolean;
  formName: string;
  sourceLabel: string;
  deviceLabel: string;
  completionLabel: string;
  reviewPriority: ResponseReviewPriority;
  internalNote: string;
  questionItems: QuestionItem[];
};

const filledBarClass = "bg-[#974800]";
const emptyBarClass = "bg-[#f5ded2]";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const prettifyKey = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const hasRenderableValue = (value: unknown) => {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

const normalizeChoices = (choices: unknown): Record<string, string> => {
  if (!Array.isArray(choices)) return {};

  return choices.reduce<Record<string, string>>((map, item) => {
    if (typeof item === "string") {
      map[item] = item;
      return map;
    }

    if (
      item &&
      typeof item === "object" &&
      "value" in item &&
      typeof item.value === "string"
    ) {
      const label =
        "text" in item && typeof item.text === "string"
          ? item.text
          : item.value;

      map[item.value] = label;
    }

    return map;
  }, {});
};

const normalizeRows = (rows: unknown): Record<string, string> => {
  if (!Array.isArray(rows)) return {};

  return rows.reduce<Record<string, string>>((map, item) => {
    if (typeof item === "string") {
      map[item] = item;
      return map;
    }

    if (
      item &&
      typeof item === "object" &&
      "value" in item &&
      typeof item.value === "string"
    ) {
      const label =
        "text" in item && typeof item.text === "string"
          ? item.text
          : item.value;

      map[item.value] = label;
    }

    return map;
  }, {});
};

const flattenSurveyElements = (schema: unknown): SurveyQuestionDefinition[] => {
  if (!schema || typeof schema !== "object") {
    return [];
  }

  const pages =
    "pages" in schema && Array.isArray(schema.pages) ? schema.pages : [];
  const definitions: SurveyQuestionDefinition[] = [];

  const walk = (elements: unknown) => {
    if (!Array.isArray(elements)) return;

    for (const element of elements) {
      if (!element || typeof element !== "object") continue;

      const nestedElements =
        "elements" in element && Array.isArray(element.elements)
          ? element.elements
          : "templateElements" in element && Array.isArray(element.templateElements)
            ? element.templateElements
            : null;

      if (
        "name" in element &&
        typeof element.name === "string" &&
        "type" in element &&
        typeof element.type === "string"
      ) {
        definitions.push({
          name: element.name,
          title:
            "title" in element && typeof element.title === "string"
              ? element.title
              : prettifyKey(element.name),
          type: element.type,
          rateMax:
            "rateMax" in element && typeof element.rateMax === "number"
              ? element.rateMax
              : undefined,
          choiceLabels:
            "choices" in element ? normalizeChoices(element.choices) : undefined,
          rowLabels: "rows" in element ? normalizeRows(element.rows) : undefined,
        });
      }

      if (nestedElements) {
        walk(nestedElements);
      }
    }
  };

  for (const page of pages) {
    if (page && typeof page === "object" && "elements" in page) {
      walk(page.elements);
    }
  }

  return definitions;
};

const getGuestName = (response: ResponseRecord) =>
  "guestName" in response
    ? response.guestName
    : [response.respondentName?.trim(), response.respondentSurname?.trim()]
        .filter(Boolean)
        .join(" ") || "Guest";

const getRoom = (response: ResponseRecord) =>
  "room" in response ? response.room : response.roomNumber?.trim() || "-";

const getFormName = (response: ResponseRecord) =>
  "surveyName" in response
    ? response.surveyName
    : "form" in response && response.form
      ? response.form.name
      : "Survey";

const getScore = (response: ResponseRecord, answers: Record<string, unknown>) => {
  const baseScore = "score" in response ? response.score : response.scoreSummary ?? null;

  if (typeof baseScore === "number") {
    return baseScore;
  }

  const firstNumeric = Object.values(answers).find((value) => typeof value === "number");
  return typeof firstNumeric === "number" ? firstNumeric : 0;
};

const getAnswersMap = (response: ResponseRecord) => {
  if (
    "answers" in response &&
    response.answers &&
    typeof response.answers === "object" &&
    !Array.isArray(response.answers)
  ) {
    return response.answers as Record<string, unknown>;
  }

  return {};
};

const getRoomLabel = (room: string) => {
  if (room === "-") {
    return "Room information unavailable";
  }

  const floor = room[0];

  if (floor === "4") return `${room} (Deluxe Suite)`;
  if (floor === "2") return `${room} (Superior Room)`;
  if (floor === "7") return `${room} (Sky Suite)`;

  return `${room} (Guest Room)`;
};

const getStayDates = (response: ResponseRecord, fallbackDate: Date) => {
  const stayStart =
    "stayStart" in response && response.stayStart ? response.stayStart : null;
  const stayEnd =
    "stayEnd" in response && response.stayEnd ? response.stayEnd : null;

  if (stayStart && stayEnd) {
    return `${formatAppDate(stayStart)} - ${formatAppDate(stayEnd)}`;
  }

  const start = new Date(fallbackDate);
  start.setDate(start.getDate() - 4);
  return `${formatAppDate(start)} - ${formatAppDate(fallbackDate)}`;
};

const getReviewPriority = (response: ResponseRecord, score: number): ResponseReviewPriority => {
  if ("reviewPriority" in response && typeof response.reviewPriority === "string") {
    return response.reviewPriority as ResponseReviewPriority;
  }

  if (score <= 2) return "high";
  if (score <= 3) return "medium";
  return "low";
};

const getInternalNote = (response: ResponseRecord) => {
  if ("internalNote" in response && typeof response.internalNote === "string") {
    return response.internalNote;
  }

  return "";
};

const formatDuration = (createdAt: Date, submittedAt?: Date | null) => {
  if (!submittedAt) {
    return "Time to complete: -";
  }

  const diffMs = Math.max(submittedAt.getTime() - createdAt.getTime(), 0);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `Time to complete: ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const buildQuestionItems = (response: ResponseRecord): QuestionItem[] => {
  const answers = getAnswersMap(response);
  const schema =
    "form" in response && response.form ? response.form.surveySchema : null;
  const definitions = flattenSurveyElements(schema);
  const definitionsByName = new Map(definitions.map((item) => [item.name, item]));

  const orderedNames = [
    ...definitions
      .map((definition) => definition.name)
      .filter((name) => hasRenderableValue(answers[name])),
    ...Object.keys(answers).filter(
      (name) => !definitionsByName.has(name) && hasRenderableValue(answers[name]),
    ),
  ];

  return orderedNames.map((name) => {
    const definition = definitionsByName.get(name);
    const title = definition?.title ?? prettifyKey(name);
    const value = answers[name];

    if (Array.isArray(value)) {
      const items = value.map((item) => {
        if (typeof item === "string") {
          return definition?.choiceLabels?.[item] ?? item;
        }

        return String(item);
      });

      return {
        kind: "list",
        name,
        title,
        items,
      };
    }

    if (typeof value === "number") {
      if (definition?.type === "rating") {
        return {
          kind: "rating",
          name,
          title,
          answer: value,
          max: definition.rateMax ?? 5,
        };
      }

      return {
        kind: "value",
        name,
        title,
        answer: String(value),
      };
    }

    if (typeof value === "boolean") {
      return {
        kind: "boolean",
        name,
        title,
        answer: value,
      };
    }

    if (typeof value === "string") {
      const mappedValue = definition?.choiceLabels?.[value] ?? value;

      if (definition?.type === "comment" || value.length > 100) {
        return {
          kind: "text",
          name,
          title,
          answer: mappedValue,
        };
      }

      return {
        kind: "value",
        name,
        title,
        answer: mappedValue,
      };
    }

    if (value && typeof value === "object") {
      const rows = Object.entries(value).map(([rowKey, rowValue]) => ({
        label: definition?.rowLabels?.[rowKey] ?? prettifyKey(rowKey),
        rawValue: rowValue,
      }));

      return {
        kind: "matrix",
        name,
        title,
        rows,
      };
    }

    return {
      kind: "value",
      name,
      title,
      answer: String(value),
    };
  });
};

const buildDetailViewModel = (response: ResponseRecord): ResponseDetailViewModel => {
  const answers = getAnswersMap(response);
  const guestName = getGuestName(response);
  const room = getRoom(response);
  const score = Number(getScore(response, answers).toFixed(1));
  const submittedAt =
    "submittedAt" in response && response.submittedAt
      ? response.submittedAt
      : response.createdAt;

  return {
    id: response.id,
    title: room !== "-" ? `Response from Room ${room}` : `Response from ${guestName}`,
    guestName,
    guestInitials: getInitials(guestName),
    room,
    roomLabel: getRoomLabel(room),
    countryLabel:
      "respondentCountry" in response && response.respondentCountry
        ? response.respondentCountry
        : "Country unavailable",
    stayDates: getStayDates(response, submittedAt),
    submittedLabel: `Submitted on ${formatAppDateTime(submittedAt)}`,
    score,
    scoreDisplay: score.toFixed(1),
    statusLabel: response.status === "rejected" ? "Flagged" : "Reviewed",
    isFlagged: response.status === "rejected",
    formName: getFormName(response),
    sourceLabel:
      response.source === "captive_portal"
        ? "Auth: Hotel app / captive portal"
        : "Auth: Room Number + Birth Date",
    deviceLabel:
      response.source === "captive_portal"
        ? "Device: Hotel app session"
        : "Device: Direct link session",
    completionLabel: formatDuration(response.createdAt, submittedAt),
    reviewPriority: getReviewPriority(response, score),
    internalNote: getInternalNote(response),
    questionItems: buildQuestionItems(response),
  };
};

const renderStars = (value: number, max = 5, sizeClassName = "size-5") =>
  Array.from({ length: max }, (_, index) => (
    <Star
      className={`${sizeClassName} ${
        index < value
          ? "fill-[#974800] text-[#974800]"
          : "fill-[#f5ded2] text-[#f5ded2]"
      }`}
      key={`${value}-${index}`}
    />
  ));

function MatrixRow({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  const numericValue =
    typeof value === "number" && value >= 1 && value <= 5 ? value : null;
  const displayValue =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? `${value}/5`
        : String(value);

  return (
    <div className="rounded-lg bg-[#fff1ea] px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-[16px] leading-6 font-medium text-[#251912]">{label}</div>
        {numericValue ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  className={`h-2 w-8 rounded-full ${
                    index < numericValue ? filledBarClass : emptyBarClass
                  }`}
                  key={`${label}-${index}`}
                />
              ))}
            </div>
            <span className="min-w-16 text-right text-[14px] font-semibold tracking-[0.14px] text-[#251912]">
              {displayValue}
            </span>
          </div>
        ) : (
          <span className="text-[14px] font-semibold tracking-[0.14px] text-[#251912]">
            {displayValue}
          </span>
        )}
      </div>
    </div>
  );
}

function QuestionSection({
  item,
  index,
}: {
  item: QuestionItem;
  index: number;
}) {
  return (
    <section className={index === 0 ? "" : "border-t border-[#f5ded2] pt-6"}>
      <p className="text-xs font-medium text-[#584235]">Question {index + 1}</p>
      <h4 className="mt-1 text-[18px] leading-7 font-medium text-[#251912]">
        {item.title}
      </h4>

      {item.kind === "rating" ? (
        <div className="mt-4 flex items-center gap-2">
          {renderStars(item.answer, item.max)}
          <span className="pl-2 text-[16px] leading-6 font-medium text-[#251912]">
            {item.answer}/{item.max}
          </span>
        </div>
      ) : null}

      {item.kind === "matrix" ? (
        <div className="mt-4 space-y-3">
          {item.rows.map((row) => (
            <MatrixRow key={`${item.name}-${row.label}`} label={row.label} value={row.rawValue} />
          ))}
        </div>
      ) : null}

      {item.kind === "list" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {item.items.map((value) => (
            <span
              className="inline-flex items-center gap-2 rounded-lg border border-[#fdab77] bg-[#fdab77] px-4 py-2 text-[14px] leading-5 text-[#773d12]"
              key={`${item.name}-${value}`}
            >
              <Check className="size-3.5" />
              {value}
            </span>
          ))}
        </div>
      ) : null}

      {item.kind === "text" ? (
        <blockquote className="mt-4 rounded-xl border-l-4 border-[#974800] bg-[#ffeadf] px-4 py-6 text-[16px] leading-6 italic text-[#251912]">
          &quot;{item.answer}&quot;
        </blockquote>
      ) : null}

      {item.kind === "value" ? (
        <div className="mt-4 rounded-xl border border-[#f5ded2] bg-[#fff8f5] px-4 py-4 text-[16px] leading-6 text-[#251912]">
          {item.answer}
        </div>
      ) : null}

      {item.kind === "boolean" ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff1ea] px-4 py-2 text-[14px] font-semibold text-[#251912]">
          {item.answer ? <Check className="size-4 text-[#974800]" /> : <Square className="size-4 text-[#584235]" />}
          {item.answer ? "Yes" : "No"}
        </div>
      ) : null}
    </section>
  );
}

export default async function ResponseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ responseId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { responseId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const notice =
    typeof resolvedSearchParams.notice === "string"
      ? resolvedSearchParams.notice
      : null;
  const error =
    typeof resolvedSearchParams.error === "string"
      ? resolvedSearchParams.error
      : null;
  const response = await getResponseById(responseId);

  if (!response) {
    return (
      <div className="rounded-xl border border-[#f5ded2] bg-white p-8 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <h1 className="font-heading text-2xl font-semibold text-[#251912]">
          Response not found
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#584235]">
          The response you requested could not be loaded.
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#974800]"
          href="/responses"
        >
          <ArrowLeft className="size-4" />
          Back to responses
        </Link>
      </div>
    );
  }

  const detail = buildDetailViewModel(response);

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="rounded-xl border border-[#cae7d0] bg-[#f1fbf4] px-4 py-3 text-sm font-medium text-[#2e7d32]">
          {notice === "response_review_saved"
            ? "Internal review details saved."
            : notice === "response_flagged"
              ? "Response flagged for manual follow-up."
              : notice === "response_unflagged"
                ? "Flag removed from this response."
                : "Changes saved."}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-[#f3c8c2] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#ba1a1a]">
          {error === "response_not_found"
            ? "This response could not be found."
            : "The requested update could not be saved."}
        </div>
      ) : null}

      <AdminPageHeaderSlot>
        <div className="flex items-start gap-4">
          <Link
            aria-label="Back to responses"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff1ea] text-[#251912] transition-colors hover:bg-[#fbe4d7]"
            href="/responses"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div>
            <h1 className="font-heading text-[32px] leading-10 font-semibold text-[#251912]">
              {detail.title}
            </h1>
          </div>
        </div>
      </AdminPageHeaderSlot>

      <section className="flex flex-col gap-4 border-b border-[#f5ded2] pb-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#cde5ff] px-3 py-1 text-xs font-medium text-[#001d31]">
              <BadgeCheck className="size-3.5" />
              {detail.statusLabel}
            </span>
          </div>
          <p className="text-[14px] leading-5 text-[#584235]">{detail.submittedLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-[34px] rounded-lg border-[#dfc0af] bg-white px-4 text-[14px] font-semibold text-[#251912] hover:bg-[#fff1ea]"
            type="button"
            variant="outline"
          >
            <Printer className="size-4" />
            Print
          </Button>
          <Button
            className="h-[34px] rounded-lg border-[#dfc0af] bg-white px-4 text-[14px] font-semibold text-[#251912] hover:bg-[#fff1ea]"
            type="button"
            variant="outline"
          >
            <FileDown className="size-4" />
            Export PDF
          </Button>
          <form action={toggleResponseFlagAction}>
            <input name="responseId" type="hidden" value={detail.id} />
            <Button
              className={`h-[34px] rounded-lg px-4 text-[14px] font-semibold ${
                detail.isFlagged
                  ? "border-[#ba1a1a] bg-[#ba1a1a] text-white hover:bg-[#961313]"
                  : "border-[#ba1a1a] bg-white text-[#ba1a1a] hover:bg-[#fff1ea]"
              }`}
              type="submit"
              variant="outline"
            >
              <Flag className="size-4" />
              {detail.isFlagged ? "Unflag" : "Flag"}
            </Button>
          </form>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_208px]">
            <section className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <div className="border-b border-[#f5ded2] pb-2 text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
                Guest Profile
              </div>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#fe7f03] font-heading text-base font-bold text-[#5d2a00]">
                  {detail.guestInitials}
                </div>

                <div className="flex-1 space-y-3">
                  <h2 className="font-heading text-[28px] leading-8 font-semibold text-[#251912]">
                    {detail.guestName}
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium text-[#584235]">Room</p>
                      <p className="mt-1 text-[16px] leading-6 font-medium text-[#251912]">
                        {detail.roomLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#584235]">Stay Dates</p>
                      <p className="mt-1 text-[16px] leading-6 font-medium text-[#251912]">
                        {detail.stayDates}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#584235]">Country</p>
                      <p className="mt-1 text-[16px] leading-6 font-medium text-[#251912]">
                        {detail.countryLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-xl border border-[#f5ded2] bg-white px-6 py-10 text-center shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-[#fe7f03]/20 blur-2xl" />
              <p className="relative text-xs font-medium tracking-[0.6px] text-[#584235] uppercase">
                Overall Score
              </p>
              <div className="relative mt-3 flex items-end justify-center gap-1">
                <span className="font-heading text-5xl leading-none font-bold text-[#974800]">
                  {detail.scoreDisplay}
                </span>
                <span className="font-heading text-[20px] leading-7 font-semibold text-[#584235]">
                  / 5.0
                </span>
              </div>
              <div className="relative mt-4 flex items-center justify-center gap-1">
                {renderStars(Math.round(detail.score), 5, "size-4")}
              </div>
            </section>
          </div>

          <section className="rounded-xl bg-[#fff1ea] px-4 py-4">
            <div className="grid gap-3 text-[14px] leading-5 text-[#584235] md:grid-cols-2">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="size-4 text-[#584235]" />
                <span>{detail.deviceLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#584235]" />
                <span>{detail.sourceLabel}</span>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Clock3 className="size-4 text-[#584235]" />
                <span>{detail.completionLabel}</span>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="border-b border-[#f5ded2] px-6 py-5">
              <h3 className="font-heading text-[28px] leading-8 font-semibold text-[#251912]">
                Survey Responses
              </h3>
            </div>

            <div className="space-y-6 px-6 py-6">
              {detail.questionItems.length > 0 ? (
                detail.questionItems.map((item, index) => (
                  <QuestionSection index={index} item={item} key={item.name} />
                ))
              ) : (
                <p className="text-[14px] leading-6 text-[#584235]">
                  No submitted answers were found for this response.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f5ded2] bg-[#fff1ea] px-4 py-4">
              <h3 className="text-sm font-semibold tracking-[0.35px] uppercase text-[#251912]">
                Internal Actions
              </h3>
              <Wrench className="size-4 text-[#584235]" />
            </div>

            <ResponseReviewForm
              action={updateResponseReviewAction}
              initialNote={detail.internalNote}
              initialPriority={detail.reviewPriority}
              responseId={detail.id}
            />
          </section>

          <section className="rounded-xl border border-[#f5ded2] bg-white p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-[#fff1ea] p-2 text-[#974800]">
                <UserRound className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#251912]">Survey</p>
                <p className="mt-1 text-[14px] leading-5 text-[#584235]">
                  {detail.formName}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-[14px] leading-5 text-[#584235]">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                <span>{detail.stayDates}</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="size-2 fill-[#974800] text-[#974800]" />
                <span>ID: {detail.id}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
