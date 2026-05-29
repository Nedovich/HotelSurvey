"use client";

import { useActionState, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  initialFormSettingsActionState,
  type SurveySchemaValue,
} from "@/features/forms/schema";
import { saveFormSettingsAction } from "@/features/forms/actions";
import { SurveyCreatorShell } from "@/features/forms/components/survey-creator-shell";
import {
  surveyLocaleLabels,
  supportedSurveyLocales,
  type SurveyLocale,
} from "@/features/surveys/locales";

type FormSettingsEditorProps = {
  form: {
    id: string;
    name: string;
    description: string | null;
    defaultLocale: SurveyLocale;
    status: "draft" | "published" | "archived";
    surveySchema: object;
    thankYouContent: unknown;
  };
  initialStep?: 1 | 2;
};

function getThankYouValue(
  thankYouContent: unknown,
  key: "title" | "description",
): string {
  if (typeof thankYouContent === "object" && thankYouContent) {
    const content = thankYouContent as Partial<Record<"title" | "description", unknown>>;
    const value = content[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

export function FormSettingsEditor({
  form,
  initialStep = 1,
}: FormSettingsEditorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(
    saveFormSettingsAction,
    initialFormSettingsActionState,
  );
  const saveFormId = `form-settings-${form.id}`;
  const [name, setName] = useState(form.name);
  const [description, setDescription] = useState(form.description ?? "");
  const [defaultLocale, setDefaultLocale] = useState<SurveyLocale>(form.defaultLocale);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    form.status,
  );
  const [thankYouTitle, setThankYouTitle] = useState(
    getThankYouValue(form.thankYouContent, "title"),
  );
  const [thankYouDescription, setThankYouDescription] = useState(
    getThankYouValue(form.thankYouContent, "description"),
  );
  const [currentStep, setCurrentStep] = useState<1 | 2>(initialStep);
  const [surveySchemaString, setSurveySchemaString] = useState(
    JSON.stringify(form.surveySchema),
  );
  const [schemaError, setSchemaError] = useState<string | null>(null);

  function goToStep(step: 1 | 2) {
    setCurrentStep(step);

    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step === 1 ? "settings" : "builder");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function goToPublish() {
    router.push(`/forms/${form.id}/publish`);
  }

  function handleSchemaChange(nextSchema: SurveySchemaValue) {
    setSurveySchemaString(JSON.stringify(nextSchema));
    setSchemaError(null);
  }

  function handleMetadataChange(nextName: string, nextDescription: string) {
    setName(nextName);
    setDescription(nextDescription);
  }

  return (
    <div className="space-y-6">
      {currentStep === 1 ? (
        <Alert className="rounded-2xl border-[#e7d7cb] bg-[#fff7f1] text-[#6b4d39]">
          One survey can now hold multiple languages. Choose the base locale
          here, then use Builder &gt; Translation for English, German, Russian,
          and other copies. Builder &gt; Theme styles the same form once for all
          languages.
        </Alert>
      ) : null}

      {state.status !== "idle" ? (
        <Alert
          className={
            state.status === "success"
              ? "rounded-2xl border-[#d6eadf] bg-[#f3fcf7] text-[#166534]"
              : "rounded-2xl border-[#f2d3cf] bg-[#fff5f3] text-[#ba1a1a]"
          }
          variant={state.status === "error" ? "destructive" : "default"}
        >
          {state.message}
        </Alert>
      ) : null}

      {schemaError ? (
        <Alert
          className="rounded-2xl border-[#f2d3cf] bg-[#fff5f3] text-[#ba1a1a]"
          variant="destructive"
        >
          {schemaError}
        </Alert>
      ) : null}

      <form action={formAction} className="hidden" id={saveFormId}>
        <input name="formId" type="hidden" value={form.id} />
        <input name="name" type="hidden" value={name} />
        <input name="description" type="hidden" value={description} />
        <input name="defaultLocale" type="hidden" value={defaultLocale} />
        <input name="status" type="hidden" value={status} />
        <input name="thankYouTitle" type="hidden" value={thankYouTitle} />
        <input
          name="thankYouDescription"
          type="hidden"
          value={thankYouDescription}
        />
        <input name="surveySchema" readOnly type="hidden" value={surveySchemaString} />
      </form>

      <div className="space-y-6">
        {currentStep === 1 ? (
          <Card className="rounded-[2rem] border-[#eddccf] shadow-none">
            <CardHeader className="border-b border-[#f5ded2] pb-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-1">
                  <div className="inline-flex rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f6545]">
                    Step 1 of 3
                  </div>
                  <CardTitle className="text-[24px] font-semibold text-[#251912]">
                    Form settings
                  </CardTitle>
                  <CardDescription className="text-sm text-[#6b4d39]">
                    Define the survey identity here first. In the next step,
                    we will focus only on building questions and logic.
                  </CardDescription>
                </div>
                <div className="flex w-full max-w-sm flex-col items-stretch gap-2 xl:items-end">
                  <Button
                    className="h-12 rounded-2xl bg-[#a85a08] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#8f4d06] xl:min-w-[260px]"
                    onClick={() => goToStep(2)}
                    type="button"
                  >
                    Continue to builder
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 xl:grid-cols-2">
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="name">
                    Form name
                  </label>
                  <Input
                    form={saveFormId}
                    id="name"
                    name="name"
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <Textarea
                    form={saveFormId}
                    id="description"
                    name="description"
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="defaultLocale"
                    >
                      Default locale
                    </label>
                    <select
                      className="h-10 rounded-2xl border border-input bg-background px-3 text-sm"
                      form={saveFormId}
                      id="defaultLocale"
                      name="defaultLocale"
                      onChange={(event) => setDefaultLocale(event.target.value as SurveyLocale)}
                      value={defaultLocale}
                    >
                      {supportedSurveyLocales.map((locale) => (
                        <option key={locale} value={locale}>
                          {surveyLocaleLabels[locale].code} ·{" "}
                          {surveyLocaleLabels[locale].nativeLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-foreground"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <select
                      className="h-10 rounded-2xl border border-input bg-background px-3 text-sm"
                      form={saveFormId}
                      id="status"
                      name="status"
                      onChange={(event) =>
                        setStatus(
                          event.target.value as "draft" | "published" | "archived",
                        )
                      }
                      value={status}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#f5ded2] bg-[#fff8f5] p-4 text-sm text-[#6b4d39]">
                  <p className="font-medium text-[#251912]">
                    Recommended localization flow
                  </p>
                  <p className="mt-2">
                    Set the default language once, then keep the same form in
                    Builder. Add translated titles, questions, choices, and
                    thank-you content inside the Translation tab instead of
                    creating duplicate forms.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="thankYouTitle"
                  >
                    Thank-you title
                  </label>
                  <Input
                    form={saveFormId}
                    id="thankYouTitle"
                    name="thankYouTitle"
                    onChange={(event) => setThankYouTitle(event.target.value)}
                    value={thankYouTitle}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="thankYouDescription"
                  >
                    Thank-you description
                  </label>
                  <Textarea
                    form={saveFormId}
                    id="thankYouDescription"
                    name="thankYouDescription"
                    onChange={(event) => setThankYouDescription(event.target.value)}
                    value={thankYouDescription}
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex flex-col gap-3 border-t border-[#f5ded2] bg-[#fffaf7] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#8b7263]">
                Save your progress anytime, then move to Builder when you are
                ready for questions, translations, and theme.
              </p>
              <Button
                className="rounded-2xl border-[#dfc0af] bg-white text-[#584235] hover:bg-[#fff8f5]"
                disabled={isPending}
                form={saveFormId}
                type="submit"
                variant="outline"
              >
                <Save data-icon="inline-start" />
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </Card>
        ) : (
          <SurveyCreatorShell
            defaultLocale={defaultLocale}
            description={description}
            initialJson={form.surveySchema}
            isSaving={isPending}
            name={name}
            onMetadataChange={handleMetadataChange}
            onNextToPublish={goToPublish}
            onSchemaChange={handleSchemaChange}
            onSchemaError={setSchemaError}
            saveFormId={saveFormId}
          />
        )}
      </div>
    </div>
  );
}
