"use client";

import "survey-core/survey-core.css";
import "survey-core/i18n/german";
import "survey-core/i18n/russian";
import "survey-core/i18n/turkish";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

import {
  extractSurveyDefinitionAndTheme,
  type SurveySchemaValue,
} from "@/features/forms/schema";
import {
  normalizeSurveyLocale,
  surveyLocaleLabels,
  type SurveyLocale,
} from "@/features/surveys/locales";
import { guestEntryCopy } from "@/features/public-survey/guest-entry-copy";

type SurveyRuntimeProps = {
  defaultLocale: SurveyLocale;
  externalReference?: string;
  formId: string;
  guestName?: string;
  publicationId: string;
  publicSlug: string;
  respondentBirthDate?: string;
  respondentCountry?: string;
  respondentSurname?: string;
  roomNumber?: string;
  requestedLocale?: string;
  stayEnd?: string;
  stayStart?: string;
  surveyJson: object;
  verificationToken?: string;
  portalToken?: string;
};

export function SurveyRuntime({
  defaultLocale,
  externalReference,
  formId,
  guestName,
  publicationId,
  publicSlug,
  respondentBirthDate,
  respondentCountry,
  respondentSurname,
  roomNumber,
  requestedLocale,
  stayEnd,
  stayStart,
  surveyJson,
  verificationToken,
  portalToken,
}: SurveyRuntimeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const initialLocale = useMemo(
    () => normalizeSurveyLocale(requestedLocale, defaultLocale),
    [defaultLocale, requestedLocale],
  );
  const [selectedLocale, setSelectedLocale] = useState<SurveyLocale>(initialLocale);
  const runtimeLocale = selectedLocale;

  const { surveyDefinition, theme } = useMemo(
    () => extractSurveyDefinitionAndTheme(surveyJson as SurveySchemaValue),
    [surveyJson],
  );
  const copy = guestEntryCopy[runtimeLocale];

  const model = useMemo(() => {
    const survey = new Model(surveyDefinition);
    survey.showQuestionNumbers = "off";
    survey.widthMode = "responsive";
    survey.locale = runtimeLocale;

    if (theme) {
      survey.applyTheme(theme);
    }

    return survey;
  }, [runtimeLocale, surveyDefinition, theme]);

  useEffect(() => {
    const handleComplete = async (sender: Model) => {
      const scoreValue = Object.values(sender.data).find(
        (value) => typeof value === "number",
      );

      const response = await fetch("/api/public-survey/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationToken,
          portalToken,
          formId,
          publicationId,
          respondentName: guestName,
          respondentSurname,
          respondentBirthDate,
          respondentCountry,
          roomNumber,
          stayEnd,
          stayStart,
          externalReference,
          answers: sender.data,
          scoreSummary: typeof scoreValue === "number" ? scoreValue : null,
        }),
      });

      const result = (await response.json()) as {
        accepted: boolean;
        message?: string;
      };

      if (!result.accepted) {
        setError(
          result.message
            ? `Yanitiniz kaydedilemedi. ${result.message}`
            : "Yanitiniz kaydedilemedi. Lutfen tekrar deneyin.",
        );
        return;
      }

      const params = new URLSearchParams();
      params.set("lang", runtimeLocale);
      router.push(`/s/${publicSlug}/thanks?${params.toString()}`);
    };

    model.onComplete.add(handleComplete);

    return () => {
      model.onComplete.remove(handleComplete);
    };
  }, [
    externalReference,
    formId,
    guestName,
    model,
    portalToken,
    publicationId,
    publicSlug,
    respondentBirthDate,
    respondentCountry,
    respondentSurname,
    roomNumber,
    runtimeLocale,
    router,
    stayEnd,
    stayStart,
    verificationToken,
  ]);

  const handleLocaleChange = (nextLocaleValue: string) => {
    const nextLocale = normalizeSurveyLocale(nextLocaleValue, defaultLocale);
    setSelectedLocale(nextLocale);

    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    router.replace(`/s/${publicSlug}/start?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-sm sm:p-8">
      <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-[#f3dfd2] bg-[#fff8f5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a28572]">
            {copy.languageLabel}
          </p>
          <p className="mt-1 text-sm text-[#6f5648]">
            Choose the survey language for this page.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-[#251912]">
          <span className="sr-only">{copy.languageLabel}</span>
          <select
            className="min-w-[150px] rounded-full border border-[#dfc0af] bg-white px-4 py-2 text-sm text-[#251912] shadow-sm outline-none transition focus:border-[#a85a08] focus:ring-2 focus:ring-[#f0d7c7]"
            onChange={(event) => handleLocaleChange(event.target.value)}
            value={runtimeLocale}
          >
            {Object.entries(surveyLocaleLabels).map(([locale, value]) => (
              <option key={locale} value={locale}>
                {value.nativeLabel} ({value.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <Survey model={model} />
    </div>
  );
}
