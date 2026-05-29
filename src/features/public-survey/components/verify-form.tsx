"use client";

import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BedDouble, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  guestEntryCopy,
  guestEntryLanguageOptions,
} from "@/features/public-survey/guest-entry-copy";
import {
  normalizeSurveyLocale,
  type SurveyLocale,
} from "@/features/surveys/locales";

type VerifyFormProps = {
  hotelId: string;
  initialLocale: SurveyLocale;
  publicSlug: string;
};

export function VerifyForm({
  hotelId,
  initialLocale,
  publicSlug,
}: VerifyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomNumber, setRoomNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [locale, setLocale] = useState<SurveyLocale>(initialLocale);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const copy = guestEntryCopy[locale];

  function handleLocaleChange(nextLocale: SurveyLocale) {
    setLocale(nextLocale);

    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    router.replace(`/s/${publicSlug}/verify?${params.toString()}`, {
      scroll: false,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const response = await fetch("/api/public-survey/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotelId,
        publicSlug,
        roomNumber,
        birthDate,
      }),
    });

    const result = (await response.json()) as
      | {
          verified: true;
          verificationToken: string;
          guestDisplayName?: string;
          guestFirstName?: string;
          guestLastName?: string;
          roomNumber?: string;
          birthDate?: string;
          checkInDate?: string;
          checkOutDate?: string;
          country?: string;
          externalReference?: string;
        }
      | { verified: false; reason: string; message?: string };

    if (!result.verified) {
      const message =
        result.reason === "already_completed"
          ? copy.alreadyCompleted
          : result.reason === "expired"
            ? copy.expired
            : result.reason === "service_unavailable"
              ? `${copy.verifyingUnavailable}${result.message ? ` (${result.message})` : ""}`
          : copy.notFound;

      setError(message);
      setIsPending(false);
      return;
    }

    startTransition(() => {
      const params = new URLSearchParams({
        token: result.verificationToken,
        roomNumber: result.roomNumber ?? roomNumber,
        birthDate: result.birthDate ?? birthDate,
        lang: locale,
      });

      if (result.guestDisplayName) {
        params.set("guestName", result.guestDisplayName);
      }
      if (result.guestLastName) {
        params.set("lastName", result.guestLastName);
      }
      if (result.country) {
        params.set("country", result.country);
      }
      if (result.checkInDate) {
        params.set("checkIn", result.checkInDate);
      }
      if (result.checkOutDate) {
        params.set("checkOut", result.checkOutDate);
      }
      if (result.externalReference) {
        params.set("externalReference", result.externalReference);
      }

      router.push(`/s/${publicSlug}/start?${params.toString()}`);
    });
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#251912]" htmlFor="language">
          {copy.languageLabel}
        </label>
        <select
          className="h-[49px] rounded-lg border border-[#dfc0af] bg-[#fff8f5] px-4 text-base text-[#251912]"
          id="language"
          onChange={(event) =>
            handleLocaleChange(
              normalizeSurveyLocale(event.target.value, "en"),
            )
          }
          value={locale}
        >
          {guestEntryLanguageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#251912]" htmlFor="room">
          {copy.roomLabel}
        </label>
        <div className="relative">
          <BedDouble className="pointer-events-none absolute left-4 top-1/2 size-[15px] -translate-y-1/2 text-[#584235]" />
          <Input
            className="h-[49px] rounded-lg border-[#dfc0af] bg-[#fff8f5] pl-11 text-base text-[#251912] placeholder:text-[#8b7263]"
            id="room"
            value={roomNumber}
            onChange={(event) => setRoomNumber(event.target.value)}
            placeholder={copy.roomPlaceholder}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-medium text-[#251912]"
          htmlFor="birthDate"
        >
          {copy.birthDateLabel}
        </label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-[13px] -translate-y-1/2 text-[#584235]" />
          <Input
            className="h-[49px] rounded-lg border-[#dfc0af] bg-[#fff8f5] pl-11 text-base text-[#251912] placeholder:text-[#8b7263]"
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            required
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        className="mt-3 h-12 rounded-lg bg-[#974800] text-sm font-semibold tracking-[0.14px] text-white hover:bg-[#824000]"
        disabled={isPending}
        type="submit"
      >
        {copy.submit}
        <ArrowRight className="size-3.5" />
      </Button>
    </form>
  );
}
