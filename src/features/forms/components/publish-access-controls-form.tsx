"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publishFormAction } from "@/features/forms/actions";

type PublishAccessControlsFormProps = {
  canBeDefault: boolean;
  expirationDateValue: string;
  formId: string;
  isActive: boolean;
  isDefaultLink: boolean;
  publicationMode: "direct_link" | "captive_portal";
  publicSlug: string;
};

function ToggleField({
  forceActiveStyle = false,
  checked,
  disabled = false,
  name,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  forceActiveStyle?: boolean;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const showActiveStyle = checked || forceActiveStyle;

  return (
    <label
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
        disabled
          ? showActiveStyle
            ? "cursor-not-allowed bg-[#974800]"
            : "cursor-not-allowed bg-[#ead8cd] opacity-60"
          : checked
            ? "cursor-pointer bg-[#974800]"
            : "cursor-pointer bg-[#dfc0af]"
      }`}
    >
      <input
        checked={checked}
        className="peer sr-only"
        disabled={disabled}
        name={name}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        type="checkbox"
        value="true"
      />
      <span
        className={`absolute size-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </label>
  );
}

export function PublishAccessControlsForm({
  canBeDefault,
  expirationDateValue,
  formId,
  isActive,
  isDefaultLink,
  publicationMode,
  publicSlug,
}: PublishAccessControlsFormProps) {
  const [isPublished, setIsPublished] = useState(isActive);
  const [isDefault, setIsDefault] = useState(isDefaultLink);
  const [guestVerificationEnabled, setGuestVerificationEnabled] = useState(
    publicationMode === "direct_link" || isDefaultLink,
  );
  const [hasExpiration, setHasExpiration] = useState(Boolean(expirationDateValue));

  return (
    <form action={publishFormAction}>
      <input name="formId" type="hidden" value={formId} />
      <input name="publicSlug" type="hidden" value={publicSlug} />
      <input
        name="mode"
        type="hidden"
        value={guestVerificationEnabled || isDefault ? "direct_link" : "captive_portal"}
      />

      <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#f5ded2] pb-3">
          <div className="flex items-center gap-3">
            <Link2 className="size-5 text-[#974800]" />
            <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
              Access Controls
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#974800]">
              {isPublished ? "Live" : "Inactive"}
            </span>
            <ToggleField checked={isPublished} name="isActive" onCheckedChange={setIsPublished} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-[#dfc0af] bg-[#fff8f5] p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <p className="pr-4 text-sm font-semibold leading-4 tracking-[0.14px] text-[#251912]">
                  Guest verification
                </p>
                <ToggleField
                  checked={guestVerificationEnabled || isDefault}
                  disabled={isDefault}
                  forceActiveStyle
                  onCheckedChange={setGuestVerificationEnabled}
                />
              </div>
              <p className="text-sm leading-5 text-[#584235]">
                Guests will access this survey using room number and birth date.
              </p>
              {isDefault ? (
                <p className="text-xs font-medium leading-4 text-[#8d6f5b]">
                  Default survey links always require guest verification.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-[#dfc0af] bg-[#fff8f5] p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <p className="max-w-[220px] pr-4 text-sm font-semibold leading-5 tracking-[0.14px] text-[#251912]">
                  Use this form as the account default survey link
                </p>
                <ToggleField
                  checked={isDefault}
                  disabled={!canBeDefault}
                  name="isDefault"
                  onCheckedChange={(checked) => {
                    setIsDefault(checked);

                    if (checked) {
                      setGuestVerificationEnabled(true);
                    }
                  }}
                />
              </div>
              <p className="text-sm leading-5 text-[#584235]">
                If enabled, the stable account link will always open this survey until another form is marked as default.
              </p>
              {!canBeDefault ? (
                <p className="text-xs font-medium leading-4 text-[#974800]">
                  Publish this survey first to make it eligible for the account default link.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 border-y border-[#f5ded2] py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-4 tracking-[0.14px] text-[#251912]">
                  Form Expiration Date
                </p>
                <p className="text-xs font-medium leading-4 text-[#584235]">
                  The form will automatically become inactive after this date.
                </p>
              </div>
              <ToggleField checked={hasExpiration} name="hasExpiration" onCheckedChange={setHasExpiration} />
            </div>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-[#584235]" />
              <Input
                className={`h-[44px] rounded-md border-[#dfc0af] pl-10 ${
                  hasExpiration
                    ? "bg-[#fff8f5]"
                    : "cursor-not-allowed bg-[#f3ece7] text-[#9f8a7d]"
                }`}
                defaultValue={expirationDateValue}
                disabled={!hasExpiration}
                id="expiresAt"
                name="expiresAt"
                type="date"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/forms/${formId}/settings?step=builder`}>
              <Button
                className="rounded-lg border-[#dfc0af] text-[#251912] hover:bg-[#fff8f5]"
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </Link>
            <Button
              className="rounded-lg bg-[#974800] text-white hover:bg-[#824000]"
              type="submit"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
