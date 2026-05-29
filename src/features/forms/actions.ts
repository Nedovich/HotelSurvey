"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { InputJsonObject } from "@prisma/client/runtime/library";

import { hasDatabaseUrl } from "@/lib/env";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { requireHotelContext } from "@/lib/session";
import { resolvePublicSlug } from "@/features/forms/publication";
import {
  type FormSettingsActionState,
  parseSurveySchemaString,
  saveFormSchema,
} from "@/features/forms/schema";
import {
  cloneSurveyTemplateSchema,
  getSurveyTemplate,
} from "@/features/forms/templates";
import { normalizeSurveyLocale } from "@/features/surveys/locales";

const publishFormSchema = z.object({
  formId: z.string(),
  publicSlug: z.string().min(3),
  mode: z.enum(["direct_link", "captive_portal"]),
  isActive: z.string().optional(),
  isDefault: z.string().optional(),
  hasExpiration: z.string().optional(),
  expiresAt: z.string().optional(),
});

const createTemplateFormSchema = z.object({
  templateId: z.string().min(1),
});

function normalizeFormName(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

async function buildUniqueFormName(hotelId: string, baseName: string) {
  const existingForms = await prisma.surveyForm.findMany({
    where: {
      hotelId,
    },
    select: {
      name: true,
    },
  });

  const existingNames = new Set(
    existingForms.map((form) => normalizeFormName(form.name)),
  );

  if (!existingNames.has(normalizeFormName(baseName))) {
    return baseName;
  }

  let suffix = 2;

  while (existingNames.has(normalizeFormName(`${baseName} ${suffix}`))) {
    suffix += 1;
  }

  return `${baseName} ${suffix}`;
}

export async function createBlankFormAction() {
  const context = await requireHotelContext();
  const template = getSurveyTemplate("blank");

  if (!hasDatabaseUrl) {
    redirect("/forms/form-checkout/settings?demo=1");
  }

  const uniqueFormName = await buildUniqueFormName(
    context.hotel.id,
    template.baseFormName,
  );

  const form = await prisma.surveyForm.create({
    data: {
      hotelId: context.hotel.id,
      name: uniqueFormName,
      description: template.description,
      status: "draft",
      defaultLocale: "en",
      surveySchema: cloneSurveyTemplateSchema(
        template.surveySchema,
      ) as InputJsonObject,
      thankYouContent: {
        title: template.thankYouTitle,
        description: template.thankYouDescription,
      },
    },
  });

  await writeAuditLog({
    action: "form.created",
    entityType: "survey_form",
    entityId: form.id,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      isImpersonating: context.isImpersonating,
      templateId: "blank",
    },
  });

  redirect(`/forms/${form.id}/settings`);
}

export async function createFormFromTemplateAction(formData: FormData) {
  const context = await requireHotelContext();
  const parsed = createTemplateFormSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!parsed.success) {
    redirect("/forms/new");
  }

  const template = getSurveyTemplate(parsed.data.templateId);

  if (!hasDatabaseUrl) {
    redirect("/forms/form-checkout/settings?demo=1");
  }

  const uniqueFormName = await buildUniqueFormName(
    context.hotel.id,
    template.baseFormName,
  );

  const form = await prisma.surveyForm.create({
    data: {
      hotelId: context.hotel.id,
      name: uniqueFormName,
      description: template.description,
      status: "draft",
      defaultLocale: "en",
      surveySchema: cloneSurveyTemplateSchema(
        template.surveySchema,
      ) as InputJsonObject,
      thankYouContent: {
        title: template.thankYouTitle,
        description: template.thankYouDescription,
      },
    },
  });

  await writeAuditLog({
    action: "form.created",
    entityType: "survey_form",
    entityId: form.id,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      isImpersonating: context.isImpersonating,
      templateId: parsed.data.templateId,
    },
  });

  redirect(`/forms/${form.id}/settings`);
}

export async function saveFormSettingsAction(
  _previousState: FormSettingsActionState,
  formData: FormData,
): Promise<FormSettingsActionState> {
  const context = await requireHotelContext();
  const parsed = saveFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please complete the required form fields before saving.",
    };
  }

  const surveySchemaResult = parseSurveySchemaString(parsed.data.surveySchema);

  if (!surveySchemaResult.success) {
    return {
      status: "error",
      message: surveySchemaResult.error,
    };
  }

  if (!hasDatabaseUrl) {
    revalidatePath(`/forms/${parsed.data.formId}/settings`);
    return {
      status: "success",
      message: "Demo mode refreshed successfully.",
    };
  }

  const normalizedName = normalizeFormName(parsed.data.name);
  const trimmedName = parsed.data.name.trim();
  const duplicateForm = await prisma.surveyForm.findFirst({
    where: {
      hotelId: context.hotel.id,
      name: {
        equals: trimmedName,
        mode: "insensitive",
      },
      NOT: {
        id: parsed.data.formId,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (duplicateForm && normalizeFormName(duplicateForm.name) === normalizedName) {
    return {
      status: "error",
      message: "A form with this name already exists. Please choose a different name.",
    };
  }

  const { formId, thankYouTitle, thankYouDescription, ...rest } =
    parsed.data;

  await prisma.surveyForm.update({
    where: {
      id: formId,
    },
    data: {
      ...rest,
      name: trimmedName,
      defaultLocale: normalizeSurveyLocale(parsed.data.defaultLocale, "en"),
      surveySchema: surveySchemaResult.data as InputJsonObject,
      thankYouContent: {
        title: thankYouTitle ?? "Thank you",
        description:
          thankYouDescription ?? "Your feedback has been recorded successfully.",
      },
    },
  });

  await writeAuditLog({
    action: "form.settings_updated",
    entityType: "survey_form",
    entityId: formId,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      isImpersonating: context.isImpersonating,
      status: parsed.data.status,
    },
  });

  revalidatePath(`/forms/${formId}/settings`);
  revalidatePath(`/forms/${formId}/preview`);
  revalidatePath("/forms");

  return {
    status: "success",
    message: "Survey settings saved successfully.",
  };
}

export async function publishFormAction(
  formData: FormData,
): Promise<void> {
  const context = await requireHotelContext();
  const parsed = publishFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return;
  }

  if (!hasDatabaseUrl) {
    revalidatePath(`/forms/${parsed.data.formId}/publish`);
    return;
  }

  const form = await prisma.surveyForm.findUnique({
    where: {
      id: parsed.data.formId,
    },
    select: {
      id: true,
      name: true,
      hotelId: true,
      status: true,
    },
  });

  if (!form || form.hotelId !== context.hotel.id) {
    return;
  }

  const nextIsDefault =
    parsed.data.isDefault === "true" || parsed.data.isDefault === "on";
  const nextIsActive =
    nextIsDefault ||
    parsed.data.isActive === "true" ||
    parsed.data.isActive === "on";
  const hasExpiration =
    parsed.data.hasExpiration === "true" ||
    parsed.data.hasExpiration === "on";
  const expiresAt =
    hasExpiration && parsed.data.expiresAt?.trim()
      ? new Date(parsed.data.expiresAt)
      : null;

  if (expiresAt) {
    expiresAt.setHours(23, 59, 59, 999);
  }

  const resolvedPublicSlug = resolvePublicSlug(
    form.name,
    form.id,
    parsed.data.publicSlug,
  );

  const publishPagePath = `/forms/${parsed.data.formId}/publish`;

  if (nextIsDefault && form.status !== "published") {
    redirect(
      `${publishPagePath}?error=publish_first_before_default`,
    );
  }

  await prisma.surveyPublication.upsert({
    where: {
      publicSlug: resolvedPublicSlug,
    },
    update: {
      formId: form.id,
      mode: parsed.data.mode,
      isActive: nextIsActive,
      endsAt: expiresAt,
    },
    create: {
      formId: form.id,
      publicSlug: resolvedPublicSlug,
      mode: parsed.data.mode,
      isActive: nextIsActive,
      endsAt: expiresAt,
    },
  });

  await prisma.surveyForm.update({
    where: {
      id: form.id,
    },
    data: {
      status: nextIsActive ? "published" : "draft",
    },
  });

  await prisma.hotel.update({
    where: {
      id: context.hotel.id,
    },
    data: {
      defaultForm: nextIsDefault
        ? {
            connect: {
              id: form.id,
            },
          }
        : !nextIsActive && context.hotel.defaultFormId === form.id
          ? {
              disconnect: true,
            }
          : undefined,
    },
  });

  await writeAuditLog({
    action: "form.publication_updated",
    entityType: "survey_form",
    entityId: form.id,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      isImpersonating: context.isImpersonating,
      isActive: nextIsActive,
      isDefault: nextIsDefault,
      publicSlug: resolvedPublicSlug,
    },
  });

  revalidatePath(`/forms/${parsed.data.formId}/publish`);
  revalidatePath(`/forms/${parsed.data.formId}`);
  revalidatePath("/forms");

  if (nextIsDefault) {
    redirect(`${publishPagePath}?notice=default_link_updated`);
  }

  if (nextIsActive) {
    redirect(`${publishPagePath}?notice=publish_saved`);
  }

  redirect(`${publishPagePath}?notice=unpublished`);
}

export async function deleteFormAction(formData: FormData): Promise<void> {
  const context = await requireHotelContext();
  const formId = formData.get("formId");

  if (typeof formId !== "string" || formId.trim().length === 0) {
    return;
  }

  if (!hasDatabaseUrl) {
    revalidatePath("/forms");
    return;
  }

  await prisma.surveyForm.deleteMany({
    where: {
      id: formId,
      hotelId: context.hotel.id,
    },
  });

  if (context.hotel.defaultFormId === formId) {
    await prisma.hotel.update({
      where: {
        id: context.hotel.id,
      },
      data: {
        defaultForm: {
          disconnect: true,
        },
      },
    });
  }

  await writeAuditLog({
    action: "form.deleted",
    entityType: "survey_form",
    entityId: formId,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      isImpersonating: context.isImpersonating,
    },
  });

  revalidatePath("/forms");
}
