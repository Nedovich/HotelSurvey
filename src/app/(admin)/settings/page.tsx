import type { ReactNode } from "react";
import {
  CalendarDays,
  EllipsisVertical,
  Globe2,
  Languages,
  Mail,
  Monitor,
  Save,
  Shield,
  Smartphone,
  UserPlus,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  updateGeneralSettingsAction,
  updateSecuritySettingsAction,
} from "@/features/settings/actions";
import {
  getSecuritySettingsSnapshot,
  getSettingsSnapshot,
} from "@/server/data";

const localeOptions = [
  { value: "en", label: "English (United States)" },
  { value: "tr", label: "Turkish (Turkey)" },
  { value: "de", label: "German (Germany)" },
  { value: "ru", label: "Russian (Russia)" },
];

const timezoneOptions = [
  { value: "Europe/Istanbul", label: "Istanbul (GMT+3)" },
];

const currencyOptions = [
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "TRY", label: "TRY (₺) - Turkish Lira" },
];

const dateFormatOptions = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2023)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2023)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2023-12-31)" },
];

const systemLanguageOptions = [
  { value: "en-US", label: "English (US) - Interface" },
  { value: "tr-TR", label: "Turkish (TR) - Interface" },
  { value: "de-DE", label: "German (DE) - Interface" },
  { value: "ru-RU", label: "Russian (RU) - Interface" },
];

const numberFormatOptions = [
  { value: "1,234,567.89", label: "1,234,567.89" },
  { value: "1.234.567,89", label: "1.234.567,89" },
  { value: "1 234 567,89", label: "1 234 567,89" },
];

const noticeMap: Record<string, { title: string; description: string }> = {
  general_settings_saved: {
    title: "General settings saved",
    description:
      "Regional formats and display preferences were updated successfully.",
  },
  security_settings_saved: {
    title: "Security settings saved",
    description: "Security preferences were updated successfully.",
  },
  demo_mode_only: {
    title: "Demo mode only",
    description:
      "This settings screen is visible in demo mode, but changes are only persisted when a database is connected.",
  },
  password_updated: {
    title: "Password updated",
    description: "Your password was updated successfully.",
  },
};

const errorMap: Record<string, { title: string; description: string }> = {
  invalid_settings_payload: {
    title: "Unable to save settings",
    description:
      "Please review the selected general preference values and try again.",
  },
  invalid_security_payload: {
    title: "Unable to save security settings",
    description: "Please review the security configuration and try again.",
  },
  invalid_password_payload: {
    title: "Invalid password",
    description: "Password must be at least 8 characters long.",
  },
};

import Link from "next/link";

type SettingsTab = "general" | "security" | "billing";

function SettingsSectionHeader({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f5ded2] pb-4">
      <div className="text-[#974800]">{icon}</div>
      <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
        {title}
      </h2>
    </div>
  );
}

function SettingsField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#584235]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectField({
  defaultValue,
  name,
  options,
}: {
  defaultValue: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      className="h-[46px] w-full rounded-lg border border-[#dfc0af] bg-white px-4 text-[16px] leading-6 text-[#251912] outline-none transition-colors focus:border-[#c99674]"
      defaultValue={defaultValue}
      name={name}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SegmentedField({
  defaultValue,
  name,
  options,
}: {
  defaultValue: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className={`grid min-h-[42px] gap-1 rounded-lg bg-[#f5ded2] p-1 ${options.length === 2 ? "grid-cols-2" : ""}`}>
      {options.map((option) => {
        const isActive = defaultValue === option.value;

        return (
          <label className="cursor-pointer" key={option.value}>
            <input
              className="peer sr-only"
              defaultChecked={isActive}
              name={name}
              type="radio"
              value={option.value}
            />
            <span className="flex min-h-[34px] items-center justify-center rounded-md border border-transparent px-4 py-2 text-center text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#584235] transition-colors peer-checked:border-[#f5ded2] peer-checked:bg-[#fff8f5] peer-checked:text-[#974800] peer-checked:shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function ToggleField({
  checked,
  label,
  name,
  description,
}: {
  checked: boolean;
  label: string;
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-1">
        <p className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#251912]">
          {label}
        </p>
        <p className="text-sm leading-5 text-[#584235]">{description}</p>
      </div>
      <label className="cursor-pointer">
        <input
          className="peer sr-only"
          defaultChecked={checked}
          name={name}
          type="checkbox"
          value="true"
        />
        <span className="flex h-6 w-11 items-center rounded-full bg-[#dfc0af] px-[2px] transition-colors peer-checked:bg-[#974800]">
          <span className="size-5 rounded-full border border-white bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
    </div>
  );
}

function renderStatusNotice(notice?: string, error?: string) {
  return (
    <div className="mt-8 max-w-[936px] space-y-4">
      {notice && noticeMap[notice] ? (
        <Alert className="rounded-2xl border-[#cbe7d0] bg-[#f2fbf4] text-[#256e35]">
          <AlertTitle>{noticeMap[notice].title}</AlertTitle>
          <AlertDescription className="text-[#256e35]">
            {noticeMap[notice].description}
          </AlertDescription>
        </Alert>
      ) : null}

      {error && errorMap[error] ? (
        <Alert className="rounded-2xl border-[#f5c8c5] bg-[#fff4f3] text-[#a02820]">
          <AlertTitle>{errorMap[error].title}</AlertTitle>
          <AlertDescription className="text-[#a02820]">
            {errorMap[error].description}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

async function GeneralTab({ notice, error }: { notice?: string; error?: string }) {
  const settings = await getSettingsSnapshot();
  const formId = "general-settings-form";

  return (
    <>
      <div className="max-w-[896px] space-y-2">
        <h1 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
          General Preferences
        </h1>
        <p className="text-[18px] leading-7 text-[#584235]">
          Manage your regional formats, localized units, and system-wide date displays.
        </p>
      </div>

      {renderStatusNotice(notice, error)}

      <form action={updateGeneralSettingsAction} className="mt-8 max-w-[896px] space-y-6" id={formId}>
        <section className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] p-6 shadow-[0px_10px_15px_-3px_rgba(252,125,0,0.04),0px_4px_6px_-4px_rgba(0,0,0,0.05)]">
          <SettingsSectionHeader
            icon={<Globe2 className="size-5" />}
            title="Regional Settings"
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <SettingsField label="Default Language">
              <SelectField
                defaultValue={settings.hotel.defaultLocale}
                name="defaultLocale"
                options={localeOptions}
              />
            </SettingsField>

            <SettingsField label="Timezone">
              <SelectField
                defaultValue="Europe/Istanbul"
                name="timezone"
                options={timezoneOptions}
              />
            </SettingsField>

            <SettingsField label="Base Currency">
              <SelectField
                defaultValue={settings.hotel.baseCurrency}
                name="baseCurrency"
                options={currencyOptions}
              />
            </SettingsField>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] p-6 shadow-[0px_10px_15px_-3px_rgba(252,125,0,0.04),0px_4px_6px_-4px_rgba(0,0,0,0.05)]">
            <SettingsSectionHeader
              icon={<CalendarDays className="size-5" />}
              title="Date & Time Formats"
            />

            <div className="mt-6 space-y-6">
              <SettingsField label="Date Format">
                <SelectField
                  defaultValue={settings.hotel.dateFormat}
                  name="dateFormat"
                  options={dateFormatOptions}
                />
              </SettingsField>

              <SettingsField label="Time Format">
                <SegmentedField
                  defaultValue="24h"
                  name="timeFormat"
                  options={[
                    { value: "24h", label: "24-hour (13:00)" },
                  ]}
                />
              </SettingsField>
            </div>
          </section>

          <section className="rounded-xl border border-[#f5ded2] bg-[#fff8f5] p-6 shadow-[0px_10px_15px_-3px_rgba(252,125,0,0.04),0px_4px_6px_-4px_rgba(0,0,0,0.05)]">
            <SettingsSectionHeader
              icon={<Languages className="size-5" />}
              title="Display & Localization"
            />

            <div className="mt-6 space-y-6">
              <SettingsField label="System Language">
                <SelectField
                  defaultValue={settings.hotel.systemLanguage}
                  name="systemLanguage"
                  options={systemLanguageOptions}
                />
              </SettingsField>

              <SettingsField label="Number Format">
                <SelectField
                  defaultValue={settings.hotel.numberFormat}
                  name="numberFormat"
                  options={numberFormatOptions}
                />
              </SettingsField>

              <SettingsField label="Default View">
                <SegmentedField
                  defaultValue={settings.hotel.defaultView}
                  name="defaultView"
                  options={[
                    { value: "list", label: "List" },
                    { value: "card", label: "Card" },
                  ]}
                />
              </SettingsField>
            </div>
          </section>
        </div>
      </form>

      <div className="mt-10 border-t border-[#f5ded2] bg-[rgba(255,248,245,0.9)] pt-4">
        <div className="flex max-w-[896px] justify-end gap-4">
          <button
            className="inline-flex h-[38px] items-center justify-center rounded-lg px-6 text-sm font-semibold text-[#584235] transition-colors hover:bg-[#f5ded2]/50"
            form={formId}
            type="reset"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#974800] px-6 text-sm font-semibold text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#7d3c00]"
            form={formId}
            type="submit"
          >
            <Save className="size-[13px]" />
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

async function SecurityTab({ notice, error }: { notice?: string; error?: string }) {
  const snapshot = await getSecuritySettingsSnapshot();
  const formId = "security-settings-form";

  return (
    <>
      <div className="max-w-[936px] space-y-2">
        <h1 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
          Security &amp; Team
        </h1>
        <p className="text-[18px] leading-7 text-[#584235]">
          Manage your organization&apos;s members, roles, and security policies.
        </p>
      </div>

      {renderStatusNotice(notice, error)}

      <div className="mt-8 max-w-[936px] space-y-12">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
              Team Members
            </h2>
            <Link
              className="inline-flex h-8 items-center gap-2 rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-[#7d3c00]"
              href="/team"
            >
              <UserPlus className="size-4" />
              Invite Member
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#f5ded2] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-[minmax(0,2.2fr)_140px_170px_160px_44px] bg-[rgba(255,234,223,0.5)] px-6 py-4 text-xs font-medium text-[#584235]">
              <div>Name</div>
              <div>Role</div>
              <div>Status</div>
              <div>Last Login</div>
              <div />
            </div>

            {snapshot.teamMembers.map((member) => (
              <div
                className="grid grid-cols-[minmax(0,2.2fr)_140px_170px_160px_44px] items-center border-t border-[#f5ded2] px-6 py-4 first:border-t-0"
                key={member.id}
              >
                <div className="flex items-center gap-3">
                  {member.initials ? (
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#fdab77] text-base font-bold text-[#773d12]">
                      {member.initials}
                    </div>
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full border border-dashed border-[#dfc0af] text-[#8b7263]">
                      <Mail className="size-4" />
                    </div>
                  )}
                  <div>
                    <p className={`text-[14px] font-semibold leading-4 ${member.isPending ? "text-[#251912]/70" : "text-[#251912]"}`}>
                      {member.name ?? member.email}
                    </p>
                    <p className="mt-1 text-xs text-[#584235]">{member.email}</p>
                  </div>
                </div>
                <div className="text-sm text-[#251912]">{member.role}</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-[10px] py-[2px] text-[11px] font-medium ${
                      member.status === "Pending"
                        ? "bg-[#f5ded2] text-[#251912]"
                        : "bg-[#cde5ff] text-[#001d31]"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="text-sm text-[#584235]">{member.lastLoginLabel}</div>
                <button className="flex justify-end text-[#584235]" type="button">
                  <EllipsisVertical className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            action={updateSecuritySettingsAction}
            className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            id={formId}
          >
            <div className="border-b border-[#f5ded2] pb-4">
              <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
                Security Settings
              </h2>
            </div>

            <div className="space-y-6 pt-6">
              <input name="requireTwoFactor" type="hidden" value="false" />

              <ToggleField
                checked={snapshot.hotel.requireTwoFactor}
                description="Require an extra security step upon login."
                label="Two-Factor Authentication (2FA)"
                name="requireTwoFactor"
              />

              <div className="border-t border-[#f5ded2] pt-4">
                <p className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#251912]">
                  Password Policy
                </p>
                <div className="mt-3 space-y-2 text-sm text-[#584235]">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-[#006398]" />
                    Minimum 12 characters
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-[#006398]" />
                    Requires numbers and symbols
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-[#8b7263]" />
                    Expire every 90 days (Disabled)
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  className="inline-flex h-[34px] items-center justify-center rounded-lg bg-[#974800] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#7d3c00]"
                  type="submit"
                >
                  Save Security Settings
                </button>
                <Link
                  className="inline-flex h-[34px] items-center justify-center rounded-lg border border-[#8b7263] px-4 text-sm font-semibold text-[#251912]"
                  href="/forgot-password"
                >
                  Change My Password
                </Link>
              </div>
            </div>
          </form>

          <section className="rounded-xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-[#f5ded2] pb-4">
              <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
                Active Sessions
              </h2>
              <span className="text-xs font-medium text-[#ba1a1a]">Logout All</span>
            </div>

            <div className="space-y-4 pt-4">
              {snapshot.sessions.map((session) => (
                <div
                  className={`rounded-lg border p-3 ${
                    session.isCurrent
                      ? "border-[#f5ded2] bg-[rgba(255,234,223,0.5)]"
                      : "border-transparent bg-transparent"
                  }`}
                  key={session.id}
                >
                  <div className="flex gap-4">
                    <div className="pt-1 text-[#974800]">
                      {session.label.toLowerCase().includes("ios") ? (
                        <Smartphone className="size-5" />
                      ) : (
                        <Monitor className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[14px] font-semibold leading-4 tracking-[0.14px] text-[#251912]">
                          {session.label}
                        </p>
                        {session.isCurrent ? (
                          <span className="rounded bg-[#cde5ff] px-2 py-[6px] text-[10px] font-medium text-[#001d31]">
                            Current Session
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-5 text-[#584235]">
                        {session.location} • {session.ipAddress}
                      </p>
                      <p className="text-[11px] leading-6 text-[#584235]">
                        {session.activityLabel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function BillingTab() {
  return (
    <div className="max-w-[896px] space-y-2">
      <h1 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
        Billing
      </h1>
      <p className="text-[18px] leading-7 text-[#584235]">
        Billing preferences will be available here next.
      </p>
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const tabValue = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const activeTab: SettingsTab =
    tabValue === "security" || tabValue === "billing" ? tabValue : "general";
  const notice = Array.isArray(resolvedSearchParams.notice)
    ? resolvedSearchParams.notice[0]
    : resolvedSearchParams.notice;
  const error = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-4rem)] bg-[#fff8f5] sm:-mx-8 sm:-mt-8">
      <div className="px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1040px]">
          {activeTab === "general" ? (
            <GeneralTab error={error} notice={notice} />
          ) : activeTab === "security" ? (
            <SecurityTab error={error} notice={notice} />
          ) : (
            <BillingTab />
          )}
        </div>
      </div>
    </div>
  );
}
