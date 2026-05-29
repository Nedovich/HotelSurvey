export const supportedSurveyLocales = ["tr", "en", "de", "ru"] as const;

export type SurveyLocale = (typeof supportedSurveyLocales)[number];

export const surveyLocaleLabels: Record<
  SurveyLocale,
  { code: string; label: string; nativeLabel: string }
> = {
  tr: {
    code: "TR",
    label: "Turkish",
    nativeLabel: "Turkce",
  },
  en: {
    code: "EN",
    label: "English",
    nativeLabel: "English",
  },
  de: {
    code: "DE",
    label: "German",
    nativeLabel: "Deutsch",
  },
  ru: {
    code: "RU",
    label: "Russian",
    nativeLabel: "Russkiy",
  },
};

export function isSurveyLocale(value: string): value is SurveyLocale {
  return supportedSurveyLocales.includes(value as SurveyLocale);
}

export function normalizeSurveyLocale(
  value: string | null | undefined,
  fallback: SurveyLocale = "en",
): SurveyLocale {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  const baseLocale = normalized.split("-")[0];

  if (isSurveyLocale(normalized)) {
    return normalized;
  }

  if (isSurveyLocale(baseLocale)) {
    return baseLocale;
  }

  return fallback;
}

export function pickSurveyLocale(
  candidates: Array<string | null | undefined>,
  fallback: SurveyLocale,
): SurveyLocale {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = candidate.trim().toLowerCase();
    const baseLocale = normalized.split("-")[0];

    if (isSurveyLocale(normalized)) {
      return normalized;
    }

    if (isSurveyLocale(baseLocale)) {
      return baseLocale;
    }
  }

  return fallback;
}
