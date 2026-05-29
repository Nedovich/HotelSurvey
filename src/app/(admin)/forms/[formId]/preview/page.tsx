import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyRuntime } from "@/features/public-survey/components/survey-runtime";
import { normalizeSurveyLocale } from "@/features/surveys/locales";
import { getFormById } from "@/server/data";

export default async function FormPreviewPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = await getFormById(formId);

  if (!form) {
    return <div>Form not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#a28572]">Preview</p>
        <h2 className="text-3xl font-semibold text-[#7b3f05]">Guest-facing survey</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SurveyRuntime
          defaultLocale={normalizeSurveyLocale(form.defaultLocale, "en")}
          formId={form.id}
          portalToken="preview-token"
          publicationId={`${form.id}-preview`}
          publicSlug="preview"
          surveyJson={form.surveySchema as object}
        />
        <Card className="rounded-[2rem] border-[#eddccf] shadow-none">
          <CardHeader>
            <CardTitle>Preview notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Desktop and mobile share the same SurveyJS JSON schema.</p>
            <p>
              The final public flow will use direct-link verification or captive
              portal tokens before landing here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
