import {
  ClipboardList,
  HeartHandshake,
  Sparkles,
  Soup,
  Star,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFormFromTemplateAction } from "@/features/forms/actions";
import { surveyTemplates } from "@/features/forms/templates";

const templateIcons = {
  blank: Sparkles,
  checkout: ClipboardList,
  "in-stay-recovery": HeartHandshake,
  restaurant: Soup,
  spa: Waves,
  "quick-nps": Star,
} as const;

export default function NewFormPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm text-[#a28572]">Forms</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#7b3f05]">
          Create a new survey
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Start with a proven hospitality template or choose a blank canvas. Each
          new form begins in English, then you can add other languages and theme
          settings in the SurveyJS builder.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {surveyTemplates.map((template) => {
          const Icon = templateIcons[template.id as keyof typeof templateIcons] ?? Sparkles;

          return (
            <Card
              className="rounded-[2rem] border-[#eddccf] bg-[#fff8f5] shadow-none"
              key={template.id}
            >
              <CardHeader className="space-y-3 pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#f4e4d8] text-[#a85a08]">
                      <Icon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex rounded-full bg-[#fff1ea] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f6545]">
                        {template.category}
                      </div>
                      <CardTitle className="text-2xl text-[#251912]">
                        {template.title}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-3">
                <p className="min-h-16 text-sm leading-6 text-[#584235]">
                  {template.summary}
                </p>
                <form action={createFormFromTemplateAction}>
                  <input name="templateId" type="hidden" value={template.id} />
                  <Button
                    className="w-full rounded-2xl bg-[#a85a08] px-5 text-white hover:bg-[#8f4d06]"
                    type="submit"
                    variant="default"
                  >
                    {template.createLabel}
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
