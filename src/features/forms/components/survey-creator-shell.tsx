"use client";

import "survey-core/survey-core.css";
import "survey-core/i18n/german";
import "survey-core/i18n/russian";
import "survey-creator-core/survey-creator-core.css";
import "survey-creator-core/i18n/german";
import "survey-creator-core/i18n/russian";
import "survey-creator-core/i18n/turkish";

import { useEffect, useMemo } from "react";
import { ArrowRight, Save } from "lucide-react";
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";

import { Button } from "@/components/ui/button";
import {
  extractSurveyDefinitionAndTheme,
  parseSurveySchemaString,
  serializeSurveySchema,
  type SurveySchemaValue,
} from "@/features/forms/schema";
import { ensureHospitaSurveyThemesRegistered } from "@/features/forms/theme-presets";
import { type SurveyLocale } from "@/features/surveys/locales";

type SurveyCreatorShellProps = {
  initialJson: object;
  name: string;
  description?: string | null;
  defaultLocale: SurveyLocale;
  saveFormId: string;
  isSaving?: boolean;
  onSchemaChange: (schema: SurveySchemaValue) => void;
  onMetadataChange: (name: string, description: string) => void;
  onSchemaError?: (message: string | null) => void;
  onNextToPublish: () => void;
};

const creatorOptions = {
  showLogicTab: false,
  showJSONEditorTab: false,
  showThemeTab: true,
  showTranslationTab: true,
  showSaveButton: false,
  collapseOnDrag: true,
  showPropertyGrid: true,
} as const;

export function SurveyCreatorShell({
  initialJson,
  name,
  description,
  defaultLocale,
  saveFormId,
  isSaving = false,
  onSchemaChange,
  onMetadataChange,
  onSchemaError,
  onNextToPublish,
}: SurveyCreatorShellProps) {
  const creator = useMemo(() => {
    ensureHospitaSurveyThemesRegistered();

    const instance = new SurveyCreator(creatorOptions);
    const {
      surveyDefinition,
      theme,
    } = extractSurveyDefinitionAndTheme(initialJson as SurveySchemaValue);

    instance.locale = defaultLocale;
    instance.JSON = surveyDefinition;

    if (theme) {
      instance.theme = theme;
    }

    return instance;
  }, [defaultLocale, initialJson]);

  useEffect(() => {
    if (creator.survey.title !== name) {
      // eslint-disable-next-line react-hooks/immutability
      creator.survey.title = name;
    }
  }, [creator, name]);

  useEffect(() => {
    const nextDescription = description ?? "";
    if (creator.survey.description !== nextDescription) {
      // eslint-disable-next-line react-hooks/immutability
      creator.survey.description = nextDescription;
    }
  }, [creator, description]);

  useEffect(() => {
    if (creator.survey.locale !== defaultLocale) {
      // eslint-disable-next-line react-hooks/immutability
      creator.survey.locale = defaultLocale;
    }
  }, [creator, defaultLocale]);

  useEffect(() => {
    const syncSchema = () => {
      const nextSchema = serializeSurveySchema(
        creator.JSON as SurveySchemaValue,
        creator.theme,
      );
      const schemaResult = parseSurveySchemaString(JSON.stringify(nextSchema));

      if (!schemaResult.success) {
        onSchemaError?.(schemaResult.error);
        return;
      }

      onSchemaError?.(null);
      onSchemaChange(schemaResult.data);
      onMetadataChange(
        creator.survey.title ?? "",
        creator.survey.description ?? "",
      );
    };

    creator.onModified.add(syncSchema);
    creator.themeEditor.onThemePropertyChanged.add(syncSchema);
    creator.themeEditor.onThemeSelected.add(syncSchema);

    return () => {
      creator.onModified.remove(syncSchema);
      creator.themeEditor.onThemePropertyChanged.remove(syncSchema);
      creator.themeEditor.onThemeSelected.remove(syncSchema);
    };
  }, [creator, onMetadataChange, onSchemaChange, onSchemaError]);

  useEffect(() => {
    return () => {
      (
        creator as SurveyCreator & {
          destroy?: () => void;
        }
      ).destroy?.();
    };
  }, [creator]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f6545]">
            Step 2 of 3
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Survey Builder
          </h3>
        </div>
        <div className="flex w-full max-w-sm items-stretch xl:justify-end">
          <Button
            className="h-12 rounded-2xl bg-[#a85a08] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#8f4d06] xl:min-w-[220px]"
            onClick={onNextToPublish}
            type="button"
          >
            Next step
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex justify-end border-b border-border/60 bg-[#fffaf7] px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="rounded-2xl border-[#dfc0af] bg-white text-[#584235] hover:bg-[#fff8f5]"
            disabled={isSaving}
            form={saveFormId}
            type="submit"
            variant="outline"
          >
            <Save data-icon="inline-start" />
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
      <div className="h-[calc(100vh-18rem)] min-h-[760px] bg-background">
        <SurveyCreatorComponent creator={creator} />
      </div>
    </div>
  );
}
