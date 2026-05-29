"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Search,
  Settings,
  SquareChartGantt,
  Users,
} from "lucide-react";

import {
  AdminPageHeaderProvider,
  useAdminPageHeader,
} from "@/components/admin-page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { stopHotelImpersonationAction } from "@/features/super-admin/actions";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/forms", label: "Forms", icon: FileText },
  { href: "/responses", label: "Responses", icon: MessageSquareQuote },
  { href: "/reports", label: "Reports", icon: SquareChartGantt },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

type AdminShellProps = {
  children: React.ReactNode;
  hotelName: string;
  isImpersonating?: boolean;
  userName: string;
};

export function AdminShell({
  children,
  hotelName,
  isImpersonating = false,
  userName,
}: AdminShellProps) {
  return (
    <AdminPageHeaderProvider>
      <AdminShellFrame
        hotelName={hotelName}
        isImpersonating={isImpersonating}
        userName={userName}
      >
        {children}
      </AdminShellFrame>
    </AdminPageHeaderProvider>
  );
}

function AdminShellFrame({
  children,
  hotelName,
  isImpersonating = false,
  userName,
}: AdminShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const { content: customHeaderContent } = useAdminPageHeader();
  const isDashboard = currentPath.startsWith("/dashboard");
  const isSettingsRoute = currentPath.startsWith("/settings");
  const formDetailMatch = currentPath.match(
    /^\/forms\/[^/]+\/(settings|publish|preview)$/,
  );
  const formIdFromPath = currentPath.match(/^\/forms\/([^/]+)\//)?.[1] ?? null;
  const currentEditorStep = searchParams.get("step");
  const formFlowSteps = formDetailMatch
    ? formDetailMatch[1] === "publish"
      ? [
          {
            label: "Form Settings",
            isActive: false,
            href: formIdFromPath
              ? `/forms/${formIdFromPath}/settings?step=settings`
              : "/forms",
          },
          {
            label: "Build Survey",
            isActive: false,
            href: formIdFromPath
              ? `/forms/${formIdFromPath}/settings?step=builder`
              : "/forms",
          },
          {
            label: "Publish",
            isActive: true,
            href: formIdFromPath ? `/forms/${formIdFromPath}/publish` : "/forms",
          },
        ]
      : formDetailMatch[1] === "preview"
        ? [
            {
              label: "Form Settings",
              isActive: false,
              href: formIdFromPath
                ? `/forms/${formIdFromPath}/settings?step=settings`
                : "/forms",
            },
            {
              label: "Build Survey",
              isActive: false,
              href: formIdFromPath
                ? `/forms/${formIdFromPath}/settings?step=builder`
                : "/forms",
            },
            {
              label: "Preview",
              isActive: true,
              href: formIdFromPath ? `/forms/${formIdFromPath}/preview` : "/forms",
            },
          ]
        : currentEditorStep === "builder"
          ? [
              {
                label: "Form Settings",
                isActive: false,
                href: formIdFromPath
                  ? `/forms/${formIdFromPath}/settings?step=settings`
                  : "/forms",
              },
              {
                label: "Build Survey",
                isActive: true,
                href: formIdFromPath
                  ? `/forms/${formIdFromPath}/settings?step=builder`
                  : "/forms",
              },
              {
                label: "Publish",
                isActive: false,
                href: formIdFromPath
                  ? `/forms/${formIdFromPath}/publish`
                  : "/forms",
              },
            ]
          : [
              {
                label: "Form Settings",
                isActive: true,
                href: formIdFromPath
                  ? `/forms/${formIdFromPath}/settings?step=settings`
                  : "/forms",
              },
              {
                label: "Build Survey",
                isActive: false,
                href: formIdFromPath
                  ? `/forms/${formIdFromPath}/settings?step=builder`
                  : "/forms",
              },
              {
                label: "Publish",
                isActive: false,
                href: formIdFromPath
                  ? `/forms/${formIdFromPath}/publish`
                  : "/forms",
              },
            ]
    : null;
  const isFormFlowRoute = Boolean(formFlowSteps);
  const headerTabs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reports", label: "Analytics" },
  ];
  const settingsTabs = [
    { href: "/settings?tab=general", label: "General", isActive: searchParams.get("tab") !== "security" && searchParams.get("tab") !== "billing" },
    { href: "/settings?tab=security", label: "Security & Team", isActive: searchParams.get("tab") === "security" },
    { href: "/settings?tab=billing", label: "Billing", isActive: searchParams.get("tab") === "billing" },
  ];
  const hasCustomHeaderContent =
    !isDashboard &&
    !isSettingsRoute &&
    !isFormFlowRoute &&
    Boolean(customHeaderContent);

  return (
    <div
      className="h-screen overflow-hidden bg-[#fff8f5] text-[#251912]"
    >
      <div className="flex h-full">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen flex-col justify-between overflow-y-auto bg-[#fff8f5] px-2 py-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-[width] duration-200 lg:flex",
            isSidebarCollapsed ? "w-[88px]" : "w-[280px]",
          )}
        >
          <div>
            <div className="px-4 pb-8">
              <div
                className={cn(
                  "relative flex items-start gap-3",
                  isSidebarCollapsed ? "justify-center px-0" : "px-4",
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#974800] text-base font-bold text-white">
                  {hotelName.slice(0, 1).toUpperCase()}
                </div>
                {!isSidebarCollapsed ? (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-heading text-[20px] font-bold leading-7 text-[#974800]">
                          Hospita Admin
                        </p>
                        <p className="text-xs leading-4 font-medium text-[#584235]">
                          Enterprise Suite
                        </p>
                      </div>
                      <Button
                        aria-label="Collapse sidebar"
                        className="mt-0.5 size-8 shrink-0 rounded-full text-[#584235] hover:bg-[#f5ded2]/60"
                        onClick={() => setIsSidebarCollapsed(true)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <ChevronsLeft className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    aria-label="Expand sidebar"
                    className="absolute right-3 top-6 size-8 rounded-full text-[#584235] hover:bg-[#f5ded2]/60"
                    onClick={() => setIsSidebarCollapsed(false)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <ChevronsRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath.startsWith(item.href);

                return (
                  <Link
                    aria-label={item.label}
                    key={item.href}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-lg text-[14px] font-semibold leading-4 tracking-[0.14px] transition-colors",
                      isSidebarCollapsed
                        ? "justify-center px-0"
                        : "px-4",
                      isActive
                        ? "bg-[#fff1ea] text-[#974800]"
                        : "text-[#584235] hover:bg-[#fff1ea]/60 hover:text-[#974800]",
                    )}
                    href={item.href}
                  >
                    <Icon
                      className={cn(
                        "size-[18px]",
                        isActive ? "text-[#974800]" : "text-[#584235]",
                      )}
                    />
                    {!isSidebarCollapsed ? item.label : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-[#f5ded2] px-4 pt-4">
            <button
              className={cn(
                "flex h-[34px] w-full items-center justify-center gap-2 rounded-lg border border-[#f5ded2] bg-white text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#584235] transition-colors hover:bg-[#fff8f5]",
                isSidebarCollapsed && "px-0",
              )}
              type="button"
              title={isSidebarCollapsed ? "Tenant Switcher" : undefined}
            >
              <FileText className="size-[14px]" />
              {!isSidebarCollapsed ? "Tenant Switcher" : null}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header
            className={cn(
              "shrink-0 border-b border-[#f5ded2] bg-[#fff8f5] px-4 sm:px-8",
              isSettingsRoute
                ? "flex items-start justify-between gap-6 py-5"
                : hasCustomHeaderContent
                  ? "flex items-start justify-between gap-6 py-6"
                : "flex h-16 items-center justify-between gap-6",
            )}
          >
            {isDashboard ? (
              <nav className="hidden h-full items-stretch sm:flex">
                {headerTabs.map((tab) => {
                  const isActive = currentPath.startsWith(tab.href);

                  return (
                    <Link
                      className={cn(
                        "flex h-full items-center px-4 text-xs leading-4",
                        isActive
                          ? "border-b-2 border-[#974800] font-bold text-[#974800]"
                          : "font-medium text-[#584235]",
                      )}
                      href={tab.href}
                      key={tab.href}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            ) : isFormFlowRoute ? (
              <div className="flex min-w-0 items-center gap-4">
                <Link
                  aria-label="Back to forms"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#584235] transition-colors hover:bg-[#f5ded2]/50"
                  href="/forms"
                >
                  <ArrowLeft className="size-5" />
                </Link>
                <nav
                  aria-label="Form flow"
                  className="flex min-w-0 items-center gap-4 text-xs leading-4"
                >
                  <Link
                    className="font-medium text-[#584235] transition-colors hover:text-[#974800]"
                    href="/forms"
                  >
                    Forms
                  </Link>
                  {formFlowSteps?.map((step) => (
                    <div className="flex items-center gap-4" key={step.label}>
                      <span className="text-[#8b7263]">›</span>
                      <Link
                        className={cn(
                          "pb-1 transition-colors",
                          step.isActive
                            ? "border-b-2 border-[#974800] font-bold text-[#974800]"
                            : "font-medium text-[#584235] hover:text-[#974800]",
                        )}
                        href={step.href}
                      >
                        {step.label}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
            ) : isSettingsRoute ? (
              <div className="min-w-0">
                <nav className="flex items-end gap-8 text-xs leading-4">
                  {settingsTabs.map((tab) => (
                    <Link
                      className={cn(
                        "border-b-2 pb-3 transition-colors",
                        tab.isActive
                          ? "border-[#974800] font-bold text-[#974800]"
                          : "border-transparent font-medium text-[#584235]",
                      )}
                      href={tab.href}
                      key={tab.href}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ) : hasCustomHeaderContent ? (
              <div className="min-w-0 flex-1">{customHeaderContent}</div>
            ) : (
              <div aria-hidden="true" className="h-7" />
            )}

            <div className={cn("ml-auto flex items-center gap-4", isSettingsRoute && "pt-0.5")}>
              {isDashboard ? (
                <div className="relative hidden sm:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-[12px] -translate-y-1/2 text-[#584235]" />
                  <input
                    className="h-[34px] w-64 rounded-full border border-[#f5ded2] bg-white pl-9 pr-4 text-xs font-medium text-[#251912] placeholder:text-[#6b7280] outline-none transition-colors focus:border-[#d8b39b]"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              ) : null}

              <Button
                className="size-8 rounded-full text-[#584235] hover:bg-[#f5ded2]/50"
                size="icon-sm"
                variant="ghost"
              >
                <Bell className="size-4" />
              </Button>
              <Button
                className="size-9 rounded-full text-[#584235] hover:bg-[#f5ded2]/50"
                size="icon-sm"
                variant="ghost"
              >
                <CircleHelp className="size-4" />
              </Button>
              <Avatar
                className={cn(
                  "size-8 rounded-full border",
                  isDashboard
                    ? "border-[#dfc0af] bg-[#f5ded2]"
                    : "border-[#dfc0af] bg-[#fdac77]",
                )}
                title={hotelName}
              >
                <AvatarFallback
                  className={cn(
                    "rounded-full text-xs font-medium",
                    isDashboard
                      ? "bg-[#f5ded2] text-[#584235]"
                      : "bg-[#fdac77] text-[#584235]",
                  )}
                >
                  {userName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Button
                className="hidden text-[#584235] hover:bg-[#f5ded2]/50 xl:inline-flex"
                onClick={async () => {
                  await authClient.signOut();
                  router.push("/login");
                  router.refresh();
                }}
                size="sm"
                variant="ghost"
              >
                <LogOut data-icon="inline-start" />
                Sign out
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            {isImpersonating ? (
              <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#f5ded2] bg-[#fff1ea] px-4 py-4 text-sm text-[#7d3c00] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#974800]">
                    You are viewing this hotel as Super Admin
                  </p>
                  <p className="mt-1 text-[#584235]">
                    Active hotel context: {hotelName}
                  </p>
                </div>
                <form action={stopHotelImpersonationAction}>
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-[#dfc0af] bg-white px-4 text-sm font-semibold text-[#974800] transition-colors hover:bg-[#fff8f5]"
                    type="submit"
                  >
                    Return to Super Admin
                  </button>
                </form>
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
