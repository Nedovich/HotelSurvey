import { z } from "zod";

import { supportedSurveyLocales } from "@/features/surveys/locales";

export type SurveySchemaValue = Record<string, unknown>;
export type SurveyThemeValue = Record<string, unknown>;

export type FormSettingsActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialFormSettingsActionState: FormSettingsActionState = {
  status: "idle",
};

export const saveFormSchema = z.object({
  formId: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  defaultLocale: z.enum(supportedSurveyLocales),
  status: z.enum(["draft", "published", "archived"]),
  surveySchema: z.string().min(2),
  thankYouTitle: z.string().optional(),
  thankYouDescription: z.string().optional(),
});

export function extractSurveyDefinitionAndTheme(
  value: SurveySchemaValue,
): { surveyDefinition: SurveySchemaValue; theme: SurveyThemeValue | null } {
  const { theme, ...surveyDefinition } = value;

  if (theme && !Array.isArray(theme) && typeof theme === "object") {
    return {
      surveyDefinition,
      theme: theme as SurveyThemeValue,
    };
  }

  return {
    surveyDefinition,
    theme: null,
  };
}

export function serializeSurveySchema(
  surveyDefinition: SurveySchemaValue,
  theme?: unknown,
): SurveySchemaValue {
  if (theme && !Array.isArray(theme) && typeof theme === "object") {
    return {
      ...surveyDefinition,
      theme: theme as SurveyThemeValue,
    };
  }

  return { ...surveyDefinition };
}

export function parseSurveySchemaString(
  value: string,
): { success: true; data: SurveySchemaValue } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return {
        success: false,
        error: "Survey schema must be a JSON object.",
      };
    }

    return {
      success: true,
      data: parsed as SurveySchemaValue,
    };
  } catch {
    return {
      success: false,
      error: "Survey schema must be valid JSON.",
    };
  }
}
