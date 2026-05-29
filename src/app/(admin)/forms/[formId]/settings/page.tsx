import { FormSettingsEditor } from "@/features/forms/components/form-settings-editor";
import { normalizeSurveyLocale } from "@/features/surveys/locales";
import { getFormById } from "@/server/data";

export default async function FormSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { formId } = await params;
  const { step } = await searchParams;
  const form = await getFormById(formId);

  if (!form) {
    return <div>Form not found.</div>;
  }

  return (
    <div>
      <FormSettingsEditor
        form={{
          id: form.id,
          name: form.name,
          description: form.description,
          defaultLocale: normalizeSurveyLocale(form.defaultLocale, "en"),
          status: form.status as "draft" | "published" | "archived",
          surveySchema: form.surveySchema as object,
          thankYouContent: form.thankYouContent,
        }}
        initialStep={step === "builder" ? 2 : 1}
      />
    </div>
  );
}
