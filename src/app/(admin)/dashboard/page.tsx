import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CircleGauge,
  ClipboardList,
  SearchCheck,
} from "lucide-react";

import { getDashboardData } from "@/server/data";

const trendBars = [
  { day: "Mon", height: 96, tone: "bg-[#ffb688]" },
  { day: "Tue", height: 144, tone: "bg-[#ffb688]" },
  { day: "Wed", height: 72, tone: "bg-[#ffb688]" },
  { day: "Thu", height: 192, tone: "bg-[#ffb688]" },
  { day: "Fri", height: 120, tone: "bg-[#ffb688]" },
  { day: "Sat", height: 216, tone: "bg-[#ffb688]" },
  { day: "Sun", height: 180, tone: "bg-[#974800]" },
];

const metricIcons = [
  ClipboardList,
  SearchCheck,
  CalendarDays,
  CircleGauge,
  AlertTriangle,
];

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  footer,
  progress,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "default" | "danger";
  footer?: React.ReactNode;
  progress?: number;
}) {
  const isDanger = accent === "danger";

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#584235]">
          {label}
        </p>
        <Icon
          className={isDanger ? "size-[14px] text-[#ba1a1a]" : "size-[14px] text-[#003c5e]"}
        />
      </div>
      <div className="mt-3 text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#974800]">
        <span className={isDanger ? "text-[#ba1a1a]" : ""}>{value}</span>
      </div>
      {progress !== undefined ? (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-[#ffeadf]">
            <div
              className="h-1.5 rounded-full bg-[#974800]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}

function RatingStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1 text-[14px] leading-4">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={index < score ? "text-[#ba1a1a]" : "text-[#dfc0af]"}
          key={`${score}-${index}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-[32px] leading-10 font-bold tracking-[-0.64px] text-[#974800]">
            Overview
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Real-time insights across your active properties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="flex h-[34px] items-center justify-center rounded-lg border border-[#f5ded2] bg-white px-4 text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#974800] transition-colors hover:bg-[#fff8f5]"
            type="button"
          >
            Export Report
          </button>
          <Link
            className="flex h-[34px] items-center justify-center rounded-lg bg-[#974800] px-4 text-[14px] font-semibold leading-4 tracking-[0.14px] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#7d3c00]"
            href="/forms/new"
          >
            New Survey
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={metricIcons[0]}
          label="Total Surveys"
          value={dashboard.totalSurveys}
        />
        <MetricCard
          icon={metricIcons[1]}
          label="Active Surveys"
          value={dashboard.activeSurveys}
        />
        <MetricCard
          footer={
            <div className="flex items-center gap-1 text-xs font-medium text-[#10b981]">
              <span>↗</span>
              <span>+12% vs yesterday</span>
            </div>
          }
          icon={metricIcons[2]}
          label="Today's Responses"
          value={dashboard.todayResponses}
        />
        <MetricCard
          icon={metricIcons[3]}
          label="Response Rate"
          progress={dashboard.responseRate}
          value={`${dashboard.responseRate}%`}
        />
        <MetricCard
          accent="danger"
          icon={metricIcons[4]}
          label="Unfinished"
          value={dashboard.unfinished}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_296px]">
        <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#f5ded2] px-5 py-5">
            <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#974800]">
              Response Trends
            </h2>
            <div className="flex items-center gap-2">
              <button
                className="flex h-6 items-center justify-center rounded-md bg-[#fff1ea] px-3 text-xs font-medium text-[#974800]"
                type="button"
              >
                7M
              </button>
              <button
                className="flex h-6 items-center justify-center rounded-md px-3 text-xs font-medium text-[#584235]"
                type="button"
              >
                30M
              </button>
            </div>
          </div>

          <div className="px-5 pb-4 pt-6">
            <div className="relative h-[443px] overflow-hidden rounded-xl bg-white">
              <div className="absolute inset-x-5 inset-y-5 flex flex-col justify-between opacity-20">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div className="h-px bg-[#dfc0af]" key={index} />
                ))}
              </div>

              <div className="absolute inset-x-5 bottom-16 top-24 flex items-end gap-3">
                {trendBars.map((bar) => (
                  <div className="flex flex-1 items-end justify-center" key={bar.day}>
                    <div
                      className={`relative w-full max-w-[80px] rounded-t-[2px] ${bar.tone} shadow-[0px_1px_2px_rgba(0,0,0,0.05)]`}
                      style={{ height: `${bar.height}px` }}
                    >
                      {bar.day === "Sun" ? (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-[#ff7e00] px-2 py-1 text-xs font-medium text-[#5e2a00]">
                          85
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-7 bottom-4 flex items-center justify-between text-xs font-medium text-[#584235]">
                {trendBars.map((bar) => (
                  <span
                    className={bar.day === "Sun" ? "font-bold text-[#974800]" : ""}
                    key={bar.day}
                  >
                    {bar.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
          <div className="flex items-center gap-2 border-b border-[#f5ded2] px-5 py-5">
            <AlertTriangle className="size-5 text-[#ba1a1a]" />
            <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#974800]">
              Attention Required
            </h2>
          </div>

          <div>
            {dashboard.lowScoreAlerts.map((alert, index) => (
              <div
                className={index === 0 ? "px-4 py-4" : "border-t border-[#f5ded2] px-4 py-4"}
                key={alert.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RatingStars score={Math.max(1, Math.min(5, alert.score))} />
                      <span className="text-xs font-medium leading-4 text-[#584235]">
                        {alert.score}/5
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#974800]">
                      Room {alert.room} - {alert.guestName}
                    </p>
                    <p className="text-[14px] leading-5 text-[#584235]">
                      {alert.notes}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#f5ded2] px-3 py-3">
            <Link
              className="inline-flex items-center justify-center gap-2 text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#974800]"
              href="/responses"
            >
              View all alerts
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </aside>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
        <div className="border-b border-[#f5ded2] px-5 py-5">
          <h2 className="font-heading text-[20px] leading-7 font-semibold text-[#974800]">
            System Activity
          </h2>
        </div>

        <div className="px-8 py-5">
          <div className="border-l border-[#f5ded2] pl-6">
            <div className="space-y-6">
              {dashboard.activity.map((item, index) => (
                <div className="relative pl-6" key={`${item.title}-${index}`}>
                  <span
                    className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full border-2 ${
                      item.isCurrent
                        ? "border-[#974800] bg-[#fff8f5]"
                        : "border-[#dfc0af] bg-[#fff8f5]"
                    }`}
                  />
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-base leading-6 text-[#974800]">
                        {item.title}
                      </p>
                      <p className="text-sm leading-5 text-[#584235]">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium leading-4 text-[#584235]">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
