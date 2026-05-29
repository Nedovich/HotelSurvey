"use server";

import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit";
import { APP_TIME_ZONE } from "@/lib/datetime";
import { hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireHotelContext } from "@/lib/session";

const generalSettingsSchema = z.object({
  defaultLocale: z.enum(["en", "tr", "de", "ru"]),
  timezone: z.string().trim().min(2),
  baseCurrency: z.enum(["USD", "EUR", "GBP", "TRY"]),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  timeFormat: z.enum(["12h", "24h"]),
  systemLanguage: z.enum(["en-US", "tr-TR", "de-DE", "ru-RU"]),
  numberFormat: z.enum(["1,234,567.89", "1.234.567,89", "1 234 567,89"]),
  defaultView: z.enum(["list", "card"]),
});

const securitySettingsSchema = z.object({
  requireTwoFactor: z.enum(["true", "false"]).transform((value) => value === "true"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8),
});

function redirectWithStatus(
  path: string,
  key: "notice" | "error",
  value: string,
): never {
  redirect(`${path}?${key}=${value}`);
}

export async function updateGeneralSettingsAction(formData: FormData) {
  const context = await requireHotelContext();
  const parsed = generalSettingsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus("/settings", "error", "invalid_settings_payload");
  }

  if (!hasDatabaseUrl) {
    redirectWithStatus("/settings", "notice", "demo_mode_only");
  }

  await prisma.hotel.update({
    where: {
      id: context.hotel.id,
    },
    data: {
      defaultLocale: parsed.data.defaultLocale,
      timezone: APP_TIME_ZONE,
      baseCurrency: parsed.data.baseCurrency,
      dateFormat: parsed.data.dateFormat,
      timeFormat: "24h",
      systemLanguage: parsed.data.systemLanguage,
      numberFormat: parsed.data.numberFormat,
      defaultView: parsed.data.defaultView,
    },
  });

  await writeAuditLog({
    action: "hotel.general_settings_updated",
    entityType: "hotel",
    entityId: context.hotel.id,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      ...parsed.data,
      timezone: APP_TIME_ZONE,
      timeFormat: "24h",
      isImpersonating: context.isImpersonating,
    },
  });

  revalidatePath("/settings");
  redirectWithStatus("/settings", "notice", "general_settings_saved");
}

export async function updateSecuritySettingsAction(formData: FormData) {
  const context = await requireHotelContext();
  const parsed = securitySettingsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus("/settings?tab=security", "error", "invalid_security_payload");
  }

  if (!hasDatabaseUrl) {
    redirectWithStatus("/settings?tab=security", "notice", "demo_mode_only");
  }

  await prisma.hotel.update({
    where: {
      id: context.hotel.id,
    },
    data: {
      requireTwoFactor: parsed.data.requireTwoFactor,
    },
  });

  await writeAuditLog({
    action: "hotel.security_settings_updated",
    entityType: "hotel",
    entityId: context.hotel.id,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      requireTwoFactor: parsed.data.requireTwoFactor,
      isImpersonating: context.isImpersonating,
    },
  });

  revalidatePath("/settings");
  redirectWithStatus("/settings?tab=security", "notice", "security_settings_saved");
}

export async function updateMyPasswordAction(formData: FormData) {
  const context = await requireHotelContext();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus("/settings?tab=security", "error", "invalid_password_payload");
  }

  if (!hasDatabaseUrl) {
    redirectWithStatus("/settings?tab=security", "notice", "demo_mode_only");
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.account.updateMany({
    where: {
      userId: context.session.user.id,
      providerId: "credential",
    },
    data: {
      password: passwordHash,
    },
  });

  await writeAuditLog({
    action: "user.password_updated",
    entityType: "user",
    entityId: context.session.user.id,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      isImpersonating: context.isImpersonating,
    },
  });

  redirectWithStatus("/settings?tab=security", "notice", "password_updated");
}
