"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BedDouble, CalendarRange, ChevronDown, Filter, Search, Star } from "lucide-react";

type RangeFilter = "7d" | "30d" | "90d" | "all";
type ScoreFilter = "any" | "high" | "medium" | "low";

export function ResponsesFilterBar({
  initialQuery,
  initialRange,
  initialScore,
  initialSurvey,
  rangeOptions,
  scoreOptions,
  surveyOptions,
}: {
  initialQuery: string;
  initialRange: RangeFilter;
  initialScore: ScoreFilter;
  initialSurvey: string;
  rangeOptions: Array<{ value: RangeFilter; label: string }>;
  scoreOptions: Array<{ value: ScoreFilter; label: string }>;
  surveyOptions: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [range, setRange] = useState<RangeFilter>(initialRange);
  const [score, setScore] = useState<ScoreFilter>(initialScore);
  const [survey, setSurvey] = useState(initialSurvey);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (deferredQuery.trim()) {
      params.set("q", deferredQuery.trim());
    } else {
      params.delete("q");
    }

    if (range !== "30d") {
      params.set("range", range);
    } else {
      params.delete("range");
    }

    if (score !== "any") {
      params.set("score", score);
    } else {
      params.delete("score");
    }

    if (survey !== "all") {
      params.set("survey", survey);
    } else {
      params.delete("survey");
    }

    const nextQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    if (nextQueryString === currentQueryString) {
      return;
    }

    startTransition(() => {
      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
        scroll: false,
      });
    });
  }, [deferredQuery, pathname, range, router, score, searchParams, survey]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative">
          <CalendarRange className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#584235]" />
          <select
            className="h-[34px] appearance-none rounded-full border border-[#dfc0af] bg-[#fff1ea] pl-10 pr-10 text-sm font-semibold text-[#584235] outline-none"
            name="range"
            onChange={(event) => setRange(event.target.value as RangeFilter)}
            value={range}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 text-[#584235]" />
        </label>

        <label className="relative">
          <Star className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#584235]" />
          <select
            className="h-[34px] appearance-none rounded-full border border-[#dfc0af] bg-[#fff1ea] pl-10 pr-10 text-sm font-semibold text-[#584235] outline-none"
            name="score"
            onChange={(event) => setScore(event.target.value as ScoreFilter)}
            value={score}
          >
            {scoreOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 text-[#584235]" />
        </label>

        <label className="relative">
          <BedDouble className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#584235]" />
          <select
            className="h-[34px] appearance-none rounded-full border border-[#dfc0af] bg-[#fff1ea] pl-10 pr-10 text-sm font-semibold text-[#584235] outline-none"
            name="survey"
            onChange={(event) => setSurvey(event.target.value)}
            value={survey}
          >
            <option value="all">All Surveys</option>
            {surveyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 text-[#584235]" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className={`inline-flex size-9 items-center justify-center rounded-lg text-[#584235] transition-colors ${
            isPending ? "bg-[#fff1ea]" : ""
          }`}
        >
          <Filter className="size-4.5" />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#584235]" />
          <input
            className="h-[38px] w-full min-w-[256px] rounded-lg border border-[#dfc0af] bg-white pl-10 pr-4 text-sm text-[#251912] outline-none placeholder:text-[#6b7280] focus:border-[#c98b61] lg:w-[256px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guests or rooms..."
            type="search"
            value={query}
          />
        </div>
      </div>
    </div>
  );
}
