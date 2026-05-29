"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit";
import { hasDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireHotelContext } from "@/lib/session";

const reviewSchema = z.object({
  responseId: z.string().min(1),
  reviewPriority: z.enum(["low", "medium", "high"]),
  internalNote: z.string().trim().max(4000).optional(),
});

const toggleFlagSchema = z.object({
  responseId: z.string().min(1),
});

function redirectWithStatus(
  responseId: string,
  key: "notice" | "error",
  value: string,
): never {
  redirect(`/responses/${responseId}?${key}=${value}`);
}

function revalidateResponsePaths(responseId: string) {
  revalidatePath("/responses");
  revalidatePath(`/responses/${responseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function updateResponseReviewAction(formData: FormData) {
  const context = await requireHotelContext();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus(
      String(formData.get("responseId") ?? ""),
      "error",
      "invalid_review_payload",
    );
  }

  if (!hasDatabaseUrl) {
    redirectWithStatus(parsed.data.responseId, "notice", "demo_mode_only");
  }

  const response = await prisma.surveyResponse.findFirst({
    where: {
      id: parsed.data.responseId,
      hotelId: context.hotel.id,
    },
    select: {
      id: true,
    },
  });

  if (!response) {
    redirectWithStatus(parsed.data.responseId, "error", "response_not_found");
  }

  await prisma.surveyResponse.update({
    where: {
      id: parsed.data.responseId,
    },
    data: {
      reviewPriority: parsed.data.reviewPriority,
      internalNote:
        parsed.data.internalNote && parsed.data.internalNote.length > 0
          ? parsed.data.internalNote
          : null,
    },
  });

  await writeAuditLog({
    action: "response.review_updated",
    entityType: "survey_response",
    entityId: parsed.data.responseId,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      reviewPriority: parsed.data.reviewPriority,
      hasInternalNote: Boolean(parsed.data.internalNote),
      isImpersonating: context.isImpersonating,
    },
  });

  revalidateResponsePaths(parsed.data.responseId);
  redirectWithStatus(parsed.data.responseId, "notice", "response_review_saved");
}

export async function toggleResponseFlagAction(formData: FormData) {
  const context = await requireHotelContext();
  const parsed = toggleFlagSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithStatus(
      String(formData.get("responseId") ?? ""),
      "error",
      "invalid_flag_payload",
    );
  }

  if (!hasDatabaseUrl) {
    redirectWithStatus(parsed.data.responseId, "notice", "demo_mode_only");
  }

  const response = await prisma.surveyResponse.findFirst({
    where: {
      id: parsed.data.responseId,
      hotelId: context.hotel.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!response) {
    redirectWithStatus(parsed.data.responseId, "error", "response_not_found");
  }

  const nextStatus = response.status === "rejected" ? "completed" : "rejected";

  await prisma.surveyResponse.update({
    where: {
      id: parsed.data.responseId,
    },
    data: {
      status: nextStatus,
    },
  });

  await writeAuditLog({
    action: nextStatus === "rejected" ? "response.flagged" : "response.unflagged",
    entityType: "survey_response",
    entityId: parsed.data.responseId,
    hotelId: context.hotel.id,
    userId: context.session.user.id,
    payload: {
      status: nextStatus,
      isImpersonating: context.isImpersonating,
    },
  });

  revalidateResponsePaths(parsed.data.responseId);
  redirectWithStatus(
    parsed.data.responseId,
    "notice",
    nextStatus === "rejected" ? "response_flagged" : "response_unflagged",
  );
}
